const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const mongoose = require("mongoose");
const Model = require("../Models");


//fetch Announcement
async function getCustomers(queryData) {
    try {
        let { skip = undefined, limit = undefined, search } = queryData;
        let condition = { isDeleted: false }
        let sorting = { _id: -1 }
        if (search)
            condition["$or"] = [
                { firstName: new RegExp(search, "gi") },
                { lastName: new RegExp(search, "gi") }
            ];
        const aggregate = [
            { $match: { ...condition } },
            { $sort: sorting }
        ];
        if (typeof skip !== "undefined" && typeof limit !== "undefined") {
            aggregate.push({ $skip: skip }, { $limit: limit }, { $sort: sorting });
        }
        aggregate.push(
            {
                $lookup: {
                    from: "orders",
                    let: { "userId": "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$addedBy", "$$userId"] },
                                    ]
                                }
                            }
                        },
                    ],
                    as: "orders"
                },
            },
            {
                $unwind: { path: "$orders", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "products",
                    let: { "productId": "$orders.productId", "variantId": "$orders.variantId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$productId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                variant: {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$variants',
                                            as: 'variant',
                                            cond: { $eq: ['$$variant._id', '$$variantId'] }
                                        }
                                    }, 0]
                                },
                            }
                        }
                    ],
                    as: "orders.productData"
                },
            },
            {
                $unwind: { path: "$orders.productData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "vendors",
                    let: { "vendorId": "$orders.vendorId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$vendorId"] },
                                        { $eq: ["$isDeleted", false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                mobile: 1,
                            }
                        }
                    ],
                    as: "orders.vendorData"
                },
            },
            {
                $unwind: { path: "$orders.vendorData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    let: { "userId": "$orders.addedBy", "addressId": "$orders.addressId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$isDeleted", false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                address: {
                                    $arrayElemAt: [{
                                        $filter: {
                                            input: '$addresses',
                                            as: 'address',
                                            cond: { $eq: ['$$address._id', '$$addressId'] }
                                        }
                                    }, 0]
                                },
                            }
                        }
                    ],
                    as: "orders.addressData"
                },
            },
            {
                $unwind: { path: "$orders.addressData", preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: "$_id",
                    firstName: { $first: "$firstName" },
                    lastName: { $first: "$lastName" },
                    email: { $first: "$email" },
                    mobile: { $first: "$mobile" },
                    createdAt: { $first: "$createdAt" },
                    totalOrders: { $push: "$orders" },
                    totalOrderSpent: { $sum: { $multiply: ["$orders.price", "$orders.quantity"] } }
                }
            },
            {
                $addFields: {
                    totalOrders: {
                        $filter: {
                            input: '$totalOrders',
                            as: 'totalOrders',
                            cond: { "$ne": [{ $type: '$$totalOrders._id' }, "missing"] }
                        }
                    }
                }
            },
        )
        const data = await Model.Users.aggregate(aggregate);
        const total = await Service.count(Model.Users, condition);
        return { userData: data.length ? data : [], total: total };
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    getCustomers
}
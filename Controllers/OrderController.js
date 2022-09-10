const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");
const orderid = require('order-id')('key');


//create order
async function createOrder(payloadData, userData) {
    try {
        const cart = await Service.findOne(Model.Cart, { addedBy: userData._id, _id: payloadData.cartId, status: 1 })
        if (!cart) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CART_NOT_EXIT);
        }
        const cartId = await Service.findOne(Model.Orders, { addedBy: userData._id, cartId: payloadData.cartId })
        if (cartId) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CART_ALREAY_EXIT);
        }
        for (let index = 0; index < cart.item.length; index++) {
            const element = cart.item[index];
            let obj = {
                addedBy: userData._id,
                orderNumber: orderid.generate(),
                paymentMode: payloadData.paymentMode,
                cartId: payloadData.cartId,
                addressId: payloadData.addressId,
                productId: element.productId,
                price: element.price,
                quantity: element.quantity,
                variantId: element.variantId,
                vendorId: element.vendorId
            }
            const order = await Service.saveData(Model.Orders, obj)
            if (!order) {
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
            }
            await Service.findAndUpdate(Model.Product, {
                _id: element.productId,
                productAvailable: "STOCK",
                variants: {
                    $elemMatch:
                    {
                        _id: element.variantId,
                        variantAvailable: "STOCK",
                        qty: { $gte: 0 }
                    }
                }
            }, { $inc: { "variants.$.qty": -element.quantity } }
            )
            await Service.findAndUpdate(Model.Product,
                {
                    _id: obj.productId,
                    productAvailable: "STOCK",
                    variants: {
                        $elemMatch:
                        {
                            _id: element.variantId,
                            variantAvailable: "STOCK",
                            qty: { $eq: 0 }
                        }
                    }
                },
                { "variants.$.variantAvailable": "OUTOFSTOCK" }
            )
            await Service.findAndUpdate(Model.Product,
                {
                    _id: obj.productId,
                    variants: { $not: { $elemMatch: { qty: { $nin: [0] } } } }
                },
                {
                    productAvailable: "OUTOFSTOCK",
                }
            )
        }
        await Service.findAndUpdate(Model.Cart, { _id: payloadData.cartId }, { status: 2 })
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ORDERS;

    } catch (err) {
        console.log(err);
    }
}

//get user order
async function getUserOrder(queryData, userData) {
    try {
        let { skip = undefined, limit = undefined, search } = queryData;
        let condition = { addedBy: userData._id }
        let sorting = { _id: -1 }
        if (search) {
            const productIds = await Service.getData(Model.Product, { name: new RegExp(search, "gi") }, { _id: 1 })
            const productId = productIds.map((id) => mongoose.Types.ObjectId(id))
            condition["$or"] = [
                { orderNumber: new RegExp(search, "gi") },
                { productId: { $in: productId } }
            ];
        }
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
                    from: "products",
                    let: { "productId": "$productId", "variantId": "$variantId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$productId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] },
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
                    as: "productData"
                },
            },
            {
                $unwind: { path: "$productData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "vendors",
                    let: { "vendorId": "$vendorId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$vendorId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isBlocked", false] },
                                        { $eq: ["$isPublished", true] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                mobile: 1
                            }
                        }
                    ],
                    as: "vendorData"
                },
            },
            {
                $unwind: { path: "$vendorData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    let: { "userId": "$addedBy", "addressId": "$addressId" },
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
                    as: "addressData"
                },
            },
            {
                $unwind: { path: "$addressData", preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    orderStatus: 1,
                    orderNumber: 1,
                    paymentMode: 1,
                    quantity: 1,
                    price: 1,
                    productData: 1,
                    vendorData: 1,
                    addressData: 1,
                    createdAt: 1
                }
            },
            {
                $group: {
                    _id: null,
                    orderDetails: { $push: "$$ROOT" },
                    totalAmount: { $sum: { $multiply: ["$price", "$quantity"] } }
                },
            },
            { $unset: ["_id"] }
        )
        const data = await Model.Orders.aggregate(aggregate);
        const total = await Service.count(Model.Orders, condition);
        return { orderData: data.length ? data[0] : [], total: total };
    } catch (err) {
        console.log(err);
    }
}

//get vendor order
async function getVendorOrder(queryData, userData) {
    try {
        let { skip = undefined, limit = undefined, search } = queryData;
        let condition = { vendorId: userData._id }
        let sorting = { _id: -1 }
        if (search) {
            const productIds = await Service.getData(Model.Product, { name: new RegExp(search, "gi") }, { _id: 1 })
            const productId = productIds.map((id) => mongoose.Types.ObjectId(id))
            condition["$or"] = [
                { orderNumber: new RegExp(search, "gi") },
                { productId: { $in: productId } }
            ];
        }
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
                    from: "products",
                    let: { "productId": "$productId", "variantId": "$variantId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$productId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$active", true] },
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
                    as: "productData"
                },
            },
            {
                $unwind: { path: "$productData", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "users",
                    let: { "userId": "$addedBy", "addressId": "$addressId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$isDeleted", false] },
                                        { $eq: ["$isBlocked", false] },
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                mobile: 1,
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
                    as: "userData"
                },
            },
            {
                $unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
            },
        )
        const data = await Model.Orders.aggregate(aggregate);
        const total = await Service.count(Model.Orders, condition);
        return { orderData: data.length ? data : [], total: total };
    } catch (err) {
        console.log(err);
    }
}

//check coupon
async function checkCoupon(payloadData, userData) {
    try {
        const coupon = await Service.findOne(Model.Offer, { discountCode: payloadData.coupon })
        if (coupon.offerStatus == "EXPIRY") {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.COUPON_EXPIRY);
        }
        if (coupon.minimumPurchaseAmount > payloadData.amount) {
            const minimumamount = Config.APP_CONSTANTS.STATUS_MSG.ERROR.MINIMUM_PURCHASE.customMessage.replace(
                "{minimumamount}",
                coupon.minimumPurchaseAmount
            );
            return Promise.reject(minimumamount);
        }
        let amountValue
        if (coupon.discountType == "PERCENTAGE") {
            amountValue = (coupon.discountValue / 100) * payloadData.amount
        }
        else if (coupon.discountType == "AMOUNT") {
            amountValue = coupon.discountValue
        }
        return {
            discountVale: amountValue
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    createOrder,
    getUserOrder,
    getVendorOrder,
    checkCoupon
}
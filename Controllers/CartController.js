const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");

//add to cart
async function addToCart(payloadData, userData) {
    try {
        const productExit = await Service.findOne(Model.Cart,
            {
                addedBy: userData._id,
                "item.productId": payloadData.productId,
                "item.variantId": payloadData.variantId,
                status: 1
            })
        if (productExit) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PRODUCT_ALREAY_EXIT_CART);
        }
        let item = {
            productId: payloadData.productId,
            variantId: payloadData.variantId,
            vendorId: payloadData.vendorId,
            price: payloadData.price
        }
        const query = { addedBy: userData._id, status: 1 };
        const update = { $set: { addedBy: userData._id }, $push: { item: { $each: [item], $position: 0 } } }
        const options = { upsert: true, new: true };
        const cart = await Service.findAndUpdate(Model.Cart, query, update, options)
        if (!cart) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return cart
    } catch (err) {
        console.log(err);
    }
}

//get cart
async function getCart(userData) {
    try {
        let condition = { addedBy: userData._id, status: 1 }
        const aggregate = [
            { $match: { ...condition } },
            {
                $unwind: { path: "$item", preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: "products",
                    let: { "productId": "$item.productId", "variantId": "$item.variantId" },
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
                                }
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
                $addFields: { "productData.variant.qty": "$item.quantity" },
            },
            {
                $addFields: { "productData.cartItemId": "$item._id" },
            },
            {
                $group: {
                    _id: null,
                    cartId: { $first: "$_id" },
                    itemData: { $push: "$productData" },
                    totalAmount: { $sum: { $multiply: ["$productData.variant.price", "$item.quantity"] } },
                }
            },
            {
                $addFields: {
                    itemData: {
                        $filter: {
                            input: '$itemData',
                            as: 'itemData',
                            cond: { "$ne": [{ $type: '$$itemData.cartItemId' }, "missing"] }
                        }
                    }
                }
            },
            { $unset: ["_id"] }
        ];
        const data = await Model.Cart.aggregate(aggregate);
        return { productData: data.length ? data[0] : null };
    } catch (err) {
        console.log(err);
    }
}

//delete cart item
async function deleteCartItem(paramsData, userData) {
    try {
        let data = await Service.findAndUpdate(Model.Cart,
            { addedBy: userData._id, _id: paramsData.cartId },
            { $pull: { item: { _id: paramsData.cartItemId } } }, { new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return data;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//update cart item
async function updateCartItem(payloadData, userData) {
    try {
        let data = await Service.findAndUpdate(Model.Cart,
            { addedBy: userData._id, _id: payloadData.cartId, "item._id": payloadData.cartItemId },
            { $inc: { "item.$.quantity": payloadData.quantity } }, { new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return data;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addToCart,
    getCart,
    deleteCartItem,
    updateCartItem
}
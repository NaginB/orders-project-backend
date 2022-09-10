const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");

//add to wishlist
async function addToWishlist(payloadData, userData) {
    try {
        const productExit = await Service.findOne(Model.Wishlist, { items: payloadData.productId })
        if (productExit) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PRODUCT_ALREAY_EXIT_WISHLIST);
        }
        const query = { addedBy: userData._id };
        const update = { $set: { addedBy: userData._id }, $push: { items: { $each: [payloadData.productId], $position: 0 } } }
        const options = { upsert: true, new: true };
        const cart = await Service.findAndUpdate(Model.Wishlist, query, update, options)
        if (!cart) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return cart
    } catch (err) {
        console.log(err);
    }
}

//get wishlist
async function getWishlist(userData) {
    try {
        return await Service.populateData(Model.Wishlist, { addedBy: userData._id }, {}, {}, [
            {
                path: "items",
                select: "name variants",
                model: "Product",
            },
        ])
    } catch (err) {
        console.log(err);
    }
}

//delete wishlist item
async function deleteWishlistItem(paramsData, userData) {
    try {
        let data = await Service.findAndUpdate(Model.Wishlist,
            { addedBy: userData._id },
            { $pull: { items: paramsData.productId } }, { new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return data;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addToWishlist,
    getWishlist,
    deleteWishlistItem
}
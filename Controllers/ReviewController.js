const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const mongoose = require("mongoose");
const Model = require("../Models");

//add Review
async function addReview(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Review, {
            productId: payloadData.productId, addedBy: userData._id
        })
        if (exit) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.REVIEW_ALREADY_EXIT);
        }
        payloadData.addedBy = userData._id
        const review = await Service.saveData(Model.Review, payloadData)
        if (!review) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return review
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//Review
async function fetchReview(queryData) {
    try {
        const { skip = undefined, limit = undefined, search } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.review = new RegExp(search, "ig");
        const collectionOptions = [
            {
                path: "productId",
                select: "name variants",
                model: "Product",
            },
            {
                path: "vendorId",
                select: "fullName",
                model: "Vendor",
            },
            {
                path: "addedBy",
                select: "firstName lastName",
                model: "Users",
            }]
        let data = await Service.populateData(Model.Review, query, projection, options, collectionOptions)
        let total = await Service.count(Model.Review, query)
        return {
            reviewData: data,
            total: total
        }

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//delete review
async function deleteReviewById(paramsData) {
    try {
        const { reviewId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Review,
            { _id: reviewId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


module.exports = {
    addReview,
    fetchReview,
    deleteReviewById
}
const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const mongoose = require("mongoose");
const Model = require("../Models");

//add offer
async function createOffer(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Offer, {
            name: payloadData.name,
        });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.OFFER_ALREAY_EXIT
            );
        }
        const code = await Service.findOne(Model.Offer, {
            discountCode: payloadData.discountCode,
        });
        if (code) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.DISCOUNT_ALREADY_EXIT
            );
        }
        payloadData.addedBy = userData._id
        data = await Service.saveData(Model.Offer, payloadData);
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return data;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get offer
async function fetchOffer(queryData, userData) {
    try {
        const { skip = undefined, limit = undefined, search, status, schedule } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (status)
            query.offerStatus = status;
        if (search)
            query.name = new RegExp(search, "ig");
        if (schedule) {
            query = {
                startDate: { $gte: new Date() }
            }
        }
        console.log(query)
        let data = await Service.getData(Model.Offer, query, projection, options)
        let total = await Service.count(Model.Offer, query)
        return {
            offerData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}
module.exports = {
    createOffer,
    fetchOffer
}
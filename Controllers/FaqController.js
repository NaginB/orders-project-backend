const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const mongoose = require("mongoose");
const Model = require("../Models");

//add edit faq
async function addEditFaq(payloadData, userData) {
    try {
        if (payloadData.name) {
            const exit = await Service.findOne(Model.Faq, {
                name: payloadData.name, isDeleted: false
            });
            if (exit) {
                return Promise.reject(
                    Config.APP_CONSTANTS.STATUS_MSG.ERROR.FAQ_ALREADY_EXIT
                );
            }
        }
        let data;
        // update faq
        if (payloadData.faqId) {
            let dataToUpdate
            if (payloadData.name) {
                dataToUpdate = {
                    name: payloadData.name
                }
            }
            if (payloadData.faqs) {
                dataToUpdate = { $push: { faqs: { $each: payloadData.faqs } } }
            }
            data = await Service.findAndUpdate(
                Model.Faq,
                { _id: payloadData.faqId },
                dataToUpdate,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add faq
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.Faq, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get faqs
async function fetchFaqs(queryData) {
    try {
        const { skip = undefined, limit = undefined, search } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        if (typeof active !== "undefined")
            query.active = active;
        let data = await Service.getData(Model.Faq, query, projection, options)
        let total = await Service.count(Model.Faq, query)
        return {
            faqData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete faq by id
async function deleteFaqById(paramsData) {
    try {
        const { faqId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Faq,
            { _id: faqId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//update faq question
async function updateFaqQuestion(paramsData, payloadData) {
    try {
        const resp = await Service.findAndUpdate(
            Model.Faq,
            { _id: paramsData.faqId, "faqs._id": payloadData.questionId },
            { "faqs.$": payloadData },
            { new: true }
        );
        if (!resp)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return resp
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete faq question
async function deleteFaqQuestion(paramsData, queryData) {
    try {
        let data = await Service.findAndUpdate(Model.Faq,
            { _id: paramsData.faqId },
            { $pull: { faqs: { _id: queryData.questionId } } }, { new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return data;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditFaq,
    fetchFaqs,
    deleteFaqById,
    updateFaqQuestion,
    deleteFaqQuestion
}
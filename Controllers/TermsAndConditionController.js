const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");

//add edit termsAndCondition
async function addEditTermsAndCondition(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.TermsAndCondition, {
            title: payloadData.title, isDeleted: false
        });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.TITLE_ALREADY_EXIT
            );
        }
        let data;
        // update termsAndCondition
        if (payloadData.termId) {
            data = await Service.findAndUpdate(
                Model.TermsAndCondition,
                { _id: payloadData.termId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add termsAndCondition
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.TermsAndCondition, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get fetchTermsAndConditions
async function fetchTermsAndConditions(queryData) {
    try {
        const { skip = undefined, limit = undefined, search } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        let data = await Service.getData(Model.TermsAndCondition, query, projection, options)
        let total = await Service.count(Model.TermsAndCondition, query)
        return {
            termsAndConditionData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete TermsAndCondition by id
async function deleteTermsAndConditionById(paramsData) {
    try {
        const { termId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.TermsAndCondition,
            { _id: termId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditTermsAndCondition,
    fetchTermsAndConditions,
    deleteTermsAndConditionById
};
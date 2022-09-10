const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");

//add edit AboutUs
async function addEditAboutUs(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.AboutUs, {
            title: payloadData.title, isDeleted: false
        });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.TITLE_ALREADY_EXIT
            );
        }
        let data;
        // update AboutUs
        if (payloadData.aboutId) {
            data = await Service.findAndUpdate(
                Model.AboutUs,
                { _id: payloadData.aboutId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add AboutUs
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.AboutUs, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get AboutUs
async function fetchAboutUs(queryData) {
    try {
        const { skip = undefined, limit = undefined, search } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        let data = await Service.getData(Model.AboutUs, query, projection, options)
        let total = await Service.count(Model.AboutUs, query)
        return {
            aboutUsData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete AboutUs by id
async function deleteAboutUsIdById(paramsData) {
    try {
        const { aboutId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.AboutUs,
            { _id: aboutId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditAboutUs,
    fetchAboutUs,
    deleteAboutUsIdById
};
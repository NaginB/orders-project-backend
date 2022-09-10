const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");

//add edit banner
async function addEditBanner(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Banner, {
            title: payloadData.title, isDeleted: false, type: payloadData.type
        });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.BANNER_ALREADY_EXIT
            );
        }
        let data;
        // update brand
        if (payloadData.bannerId) {
            data = await Service.findAndUpdate(
                Model.Banner,
                { _id: payloadData.bannerId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add brand
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.Banner, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get Banner
async function fetchBanner(queryData) {
    try {
        const { skip = undefined, limit = undefined, search, type } = queryData;
        let query = { isDeleted: false, type: type }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        let data = await Service.getData(Model.Banner, query, projection, options)
        let total = await Service.count(Model.Banner, query)
        return {
            BannerData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete banner
async function deleteBannerById(paramsData) {
    try {
        const { bannerId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Banner,
            { _id: bannerId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}
module.exports = {
    addEditBanner,
    fetchBanner,
    deleteBannerById
};
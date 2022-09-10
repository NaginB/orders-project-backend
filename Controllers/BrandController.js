const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");

//add edit brand
async function addEditBrand(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Brand, {
            name: payloadData.name,
        });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.BRAND_ALREAY_EXIT
            );
        }
        let data;
        // update brand
        if (payloadData.brandId) {
            data = await Service.findAndUpdate(
                Model.Brand,
                { _id: payloadData.brandId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add brand
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.Brand, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get brand
async function fetchBrands(queryData) {
    try {
        const { skip = undefined, limit = undefined, search, active = undefined } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        if (typeof active !== "undefined")
            query.active = active;
        let data = await Service.getData(Model.Brand, query, projection, options)
        let total = await Service.count(Model.Brand, query)
        return {
            brandData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete brand by id
async function deleteBrandById(paramsData, userData) {
    try {
        const { brandId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Brand,
            { _id: brandId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditBrand,
    deleteBrandById,
    fetchBrands,
};
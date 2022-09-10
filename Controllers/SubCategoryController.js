const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");


//add edit subcategory
async function addEditSubCategory(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Categories, { name: payloadData.name })
        if (exit) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.CATEGORY_ALREAY_EXIT);
        }
        let data;
        // update subcategory
        if (payloadData.subCategoryId) {
            data = await Service.findAndUpdate(
                Model.Categories,
                { _id: payloadData.subCategoryId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add subcategory
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.Categories, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;
    } catch (err) {
        console.log(err);
    }
}

//fetch subcategory
async function fetchSubCategories(queryData) {
    try {
        const { parentCategoryId, skip = undefined, limit = undefined, search, active = undefined } = queryData;
        let query = { isDeleted: false, parentCategoryId: { $ne: null }, childCategoryId: null }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (parentCategoryId)
            query.parentCategoryId = parentCategoryId;
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        if (typeof active !== "undefined")
            query.active = active;
        let data = await Service.populateData(Model.Categories, query, projection, options, [{
            path: "parentCategoryId",
            select: "name",
            model: "Categories",
        }])
        let total = await Service.count(Model.Categories, query)
        return {
            subCategoryData: data,
            total: total
        }
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete subcategory
async function deleteSubCategoryById(paramsData, userData) {
    try {
        const { subCategoryId } = paramsData;
        const resp = await Service.findAndUpdate(Model.Categories, { _id: subCategoryId }, { $set: { isDeleted: true } });
        if (resp)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//subcategory status change
async function subCategoryStatusChange(paramsData) {
    try {
        let find = await Service.findOne(Model.Categories, { _id: paramsData.subCategoryId })
        if (!find)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
        let active
        if (find.active)
            active = false
        else
            active = true
        let data = await Service.findAndUpdate(Model.Categories, { _id: paramsData.subCategoryId }, { active: active }, { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        if (active)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.ACTIVE;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.INACTIVE;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditSubCategory,
    fetchSubCategories,
    deleteSubCategoryById,
    subCategoryStatusChange
}


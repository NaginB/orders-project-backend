const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");

//add edit career
async function addEditCareer(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Career, {
            title: payloadData.title, isDeleted: false
        });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.TITLE_ALREADY_EXIT
            );
        }
        let data;
        // update career
        if (payloadData.careerId) {
            data = await Service.findAndUpdate(
                Model.Career,
                { _id: payloadData.careerId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add career
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.Career, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get career
async function fetchCareer(queryData) {
    try {
        const { skip = undefined, limit = undefined, search } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        let data = await Service.getData(Model.Career, query, projection, options)
        let total = await Service.count(Model.Career, query)
        return {
            CareerData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete career by id
async function deleteCareerById(paramsData) {
    try {
        const { careerId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Career,
            { _id: careerId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditCareer,
    fetchCareer,
    deleteCareerById
};
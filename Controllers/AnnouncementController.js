const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const mongoose = require("mongoose");
const Model = require("../Models");
//add announcement
async function announcement(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Announcement, { title: payloadData.title })
        if (exit)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.ANNOUNCEMENT_ALREAY_EXIT);
        payloadData.addedBy = userData._id
        const announcement = await Service.saveData(Model.Announcement, payloadData)
        if (!announcement)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return announcement
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//fetch Announcement
async function fetchAnnouncement() {
    try {
        return await Service.getData(Model.Announcement, { isDeleted: false })
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    announcement,
    fetchAnnouncement
}
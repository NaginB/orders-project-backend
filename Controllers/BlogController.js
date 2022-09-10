const Service = require("../Services").queries;
const Config = require("../Config");
const Model = require("../Models");

//add edit brand
async function addEditBlog(payloadData, userData) {
    try {
        const exit = await Service.findOne(Model.Blog, {
            title: payloadData.title, isDeleted: false
        });
        if (exit) {
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.BLOG_ALREADY_EXIT
            );
        }
        let data;
        // update brand
        if (payloadData.blogId) {
            data = await Service.findAndUpdate(
                Model.Blog,
                { _id: payloadData.blogId },
                payloadData,
                { new: true }
            );
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
        }
        // add brand
        else {
            payloadData.addedBy = userData._id;
            data = await Service.saveData(Model.Blog, payloadData);
            if (!data)
                return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        return data;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//get blogs
async function fetchblogs(queryData) {
    try {
        const { skip = undefined, limit = undefined, search } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.name = new RegExp(search, "ig");
        let data = await Service.getData(Model.Blog, query, projection, options)
        let total = await Service.count(Model.Blog, query)
        return {
            blogData: data,
            total: total
        }
    } catch (error) {
        console.log(error.message);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//delete blog by id
async function deleteBlogById(paramsData) {
    try {
        const { blogId } = paramsData;
        const resp = await Service.findAndUpdate(
            Model.Blog,
            { _id: blogId },
            { $set: { isDeleted: true } }
        );
        if (resp) return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DELETED;
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST);
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

module.exports = {
    addEditBlog,
    fetchblogs,
    deleteBlogById
};
const { AboutUsController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Joi = require("joi");

module.exports = [
    //add edit AboutUs
    {
        method: "POST",
        path: "/admin/AboutUs",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditAboutUs(request.payload, userData)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Add edit AboutUs",
            auth: "AdminAuth",
            validate: {
                payload: Joi.object({
                    aboutId: Joi.string(),
                    title: Joi.string().required(),
                    image: Joi.string(),
                    description: Joi.string()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses:
                        Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //get AboutUs
    {
        method: "GET",
        path: "/AboutUs",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchAboutUs(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch AboutUs",
            tags: ["api", "AboutUs"],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },

    //delete AboutUs
    {
        method: "DELETE",
        path: "/admin/AboutUs/{aboutId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteAboutUsIdById(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete AboutUs by id",
            auth: "AdminAuth",
            tags: ["api", "blog"],
            validate: {
                params: Joi.object({
                    aboutId: Joi.string().required()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages,
                },
            },
        },
    },
]
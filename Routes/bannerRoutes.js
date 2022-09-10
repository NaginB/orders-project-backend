const { BannerController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Joi = require("joi");

module.exports = [
    //add edit banner
    {
        method: "POST",
        path: "/admin/banner",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditBanner(request.payload, userData)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Add edit banner",
            auth: "AdminAuth",
            validate: {
                payload: Joi.object({
                    bannerId: Joi.string(),
                    title: Joi.string().required(),
                    url: Joi.string().required(),
                    image: Joi.string().required(),
                    type: Joi.string().valid(
                        "BANNER", "SINGLEOFFERBANNER",
                        "TOPCATEGORIES", "THREEBANNER",
                        "TWOBANNER", "TOPBRAND",
                        "SINGLEBANNER", "LATESTOFFER").required()
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

    //get banner
    {
        method: "GET",
        path: "/banner",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchBanner(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch banner",
            tags: ["api", "banner"],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                    type: Joi.string().valid(
                        "BANNER", "SINGLEOFFERBANNER",
                        "TOPCATEGORIES", "THREEBANNER",
                        "TWOBANNER", "TOPBRAND",
                        "SINGLEBANNER", "LATESTOFFER").required()
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

    //delete banner
    {
        method: "DELETE",
        path: "/admin/banner/{bannerId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteBannerById(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete banner by id",
            auth: "AdminAuth",
            tags: ["api", "banner"],
            validate: {
                params: Joi.object({
                    bannerId: Joi.string().required()
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
const { BrandController: Controller } = require("../Controllers");
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const Joi = require("joi");

module.exports = [
    {
        method: "POST",
        path: "/admin/brand",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditBrand(request.payload, userData)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Add Brand",
            auth: "AdminAuth",
            validate: {
                payload: Joi.object({
                    name: Joi.string().trim().required(),
                    brandId: Joi.string(),
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
    {
        method: "GET",
        path: "/admin/brand",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchBrands(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Brands",
            auth: "AdminAuth",
            tags: ["api", "brand"],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    active: Joi.boolean(),
                    search: Joi.string(),
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

    //delete brand
    {
        method: "DELETE",
        path: "/admin/brand/{brandId}",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteBrandById(request.params, userData)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete brand by id",
            auth: "AdminAuth",
            tags: ["api", "brand"],
            validate: {
                params: Joi.object({
                    brandId: Joi.string().required()
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
];
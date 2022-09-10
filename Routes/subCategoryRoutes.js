const { SubCategoryController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');

module.exports = [

    //add subcategory
    {
        method: "POST",
        path: "/admin/subCategories",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.addEditSubCategory(request.payload, userData)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Add Update subCategory",
            auth: "AdminAuth",
            validate: {
                payload: Joi.object({
                    name: Joi.string().trim().required(),
                    icon: Joi.string().allow(""),
                    parentCategoryId: Joi.string().trim().required(),
                    subCategoryId: Joi.string().trim()
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

    //get subcategory
    {
        method: "GET",
        path: "/subCategories",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchSubCategories(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Subcategories",
            validate: {
                query: Joi.object({
                    parentCategoryId: Joi.string().trim(),
                    skip: Joi.number(),
                    limit: Joi.number(),
                    active: Joi.boolean(),
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

    //delete subcategory
    {
        method: "DELETE",
        path: "/admin/subCategories/{subCategoryId}",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteSubCategoryById(request.params, userData)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete subcategory by id",
            auth: "AdminAuth",
            tags: ["api", "subcategory"],
            validate: {
                params: Joi.object({
                    subCategoryId: Joi.string().required()
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

    //subcategory status change
    {
        method: "POST",
        path: "/admin/subCategories/{subCategoryId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.subCategoryStatusChange(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "status change subcategory",
            auth: "AdminAuth",
            validate: {
                params: Joi.object({
                    subCategoryId: Joi.string().required()
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
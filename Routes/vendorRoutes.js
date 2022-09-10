const { VendorController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require('joi');
const Config = require('../Config');

module.exports = [

    //vendor register
    {
        method: 'POST',
        path: '/vendor/register',
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(null, await Controller.vendorRegister(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'vendor register API',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    fullName: Joi.string().required(),
                    userName: Joi.string().required(),
                    email: Joi.string().required(),
                    mobile: Joi.string().required(),
                    password: Joi.string().required(),
                    gender: Joi.string().required(),
                    gstNo: Joi.string().required(),
                    idProof: Joi.object({
                        adharCardFront: Joi.string().required(),
                        adharCardBack: Joi.string().required(),
                        addressProof: Joi.string().required(),
                    }),
                    pickupAddress: Joi.object({
                        pincode: Joi.string().required(),
                        address: Joi.string().required(),
                        location: Joi.string().required(),
                        city: Joi.string().required(),
                        state: Joi.string().required(),
                    }),
                    bankDetails: Joi.object({
                        bankName: Joi.string().required(),
                        accountNo: Joi.string().required(),
                        ifsc: Joi.string().required(),
                        accountHolderName: Joi.string().required(),
                        cancelCheck: Joi.string().required(),
                    })
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    //vendor login
    {
        method: 'POST',
        path: '/vendor/login',
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(null, await Controller.vendorLogin(request.payload))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'vendor login API',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
                    password: Joi.string().required()
                }),
                failAction: UniversalFunctions.failActionFunction,
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: Config.APP_CONSTANTS.swaggerDefaultResponseMessages
                }
            }
        }
    },

    //vendor forgot-password
    {
        method: "POST",
        path: "/vendor/forgot-password",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.forgotPassword(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "forgot password request",
            tags: ["api", "vendor"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
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

    //validate-otp
    {
        method: "POST",
        path: "/vendor/verify-otp",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.verifyOTP(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "verify otp",
            tags: ["api", "vendor"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
                    code: Joi.string().required()
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


    //change password
    {
        method: "POST",
        path: "/vendor/change-password",
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(
                        null,
                        await Controller.changePassword(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "verify otp and change password",
            tags: ["api", "vendor"],
            validate: {
                payload: Joi.object({
                    email: Joi.string().required(),
                    code: Joi.string().required(),
                    password: Joi.string().required(),
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


    //get vendor
    {
        method: "GET",
        path: "/admin/vendor",
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchVendor(request.query, userData)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Vendor",
            auth: "AdminAuth",
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    active: Joi.boolean(),
                    search: Joi.string(),
                    isBlocked: Joi.boolean(),
                    isReject: Joi.boolean(),
                    isPublished: Joi.boolean(),
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

    //vendor status change
    {
        method: "POST",
        path: "/admin/vendor/{vendorId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.vendorStatusChange(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "status change vendor",
            auth: "AdminAuth",
            validate: {
                params: Joi.object({
                    vendorId: Joi.string().required()
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

    //block vendor status change
    {
        method: "POST",
        path: "/admin/vendor-block/{vendorId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.vendorStatusChangeBlock(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "status change vendor block",
            auth: "AdminAuth",
            validate: {
                params: Joi.object({
                    vendorId: Joi.string().required()
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

    //reject vendor
    {
        method: "POST",
        path: "/admin/vendor-reject",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.vendorReject(request.payload)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "status change vendor reject",
            auth: "AdminAuth",
            validate: {
                payload: Joi.object({
                    vendorId: Joi.string().required(),
                    reason: Joi.string().required()
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
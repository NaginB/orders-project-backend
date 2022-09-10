const { OfferController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require("joi");
const Config = require('../Config');

module.exports = [
    //create offer
    {
        method: 'POST',
        path: '/admin/offer',
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(null, await Controller.createOffer(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'create offer API',
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    name: Joi.string().required(),
                    discountType: Joi.string().valid("PERCENTAGE", "AMOUNT").required(),
                    discountCodeMethod: Joi.string().valid("CODE", "AUTOMATIC").required(),
                    discountCode: Joi.string().required(),
                    minimumPurchaseAmount: Joi.number().required(),
                    discountValue: Joi.number().required(),
                    numberOfPurchase: Joi.number(),
                    limitOfPurchaseUser: Joi.number(),
                    startDate: Joi.date().iso(),
                    endDate: Joi.date().iso()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
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


    //get offer
    {
        method: 'GET',
        path: '/admin/offer',
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(null, await Controller.fetchOffer(request.query, userData))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'fetch offer API',
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
                    search: Joi.string(),
                    status: Joi.string().valid("ACTIVE", "EXPIRY"),
                    schedule: Joi.boolean()
                }),
                headers: UniversalFunctions.authorizationHeaderObj,
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
]
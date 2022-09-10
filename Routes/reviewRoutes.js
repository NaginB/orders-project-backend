const { ReviewController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require("joi");
const Config = require('../Config');

module.exports = [

    //add Review
    {
        method: 'POST',
        path: '/user/review',
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(null, await Controller.addReview(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'review API',
            auth: "UserAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    productId: Joi.string().required(),
                    vendorId: Joi.string().required(),
                    rating: Joi.number().required(),
                    review: Joi.string()
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


    //get review
    {
        method: "GET",
        path: "/admin/review",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchReview(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch Review",
            auth: "AdminAuth",
            validate: {
                query: Joi.object({
                    skip: Joi.number(),
                    limit: Joi.number(),
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

    //delete review
    {
        method: "DELETE",
        path: "/admin/review/{reviewId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteReviewById(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete review by id",
            auth: "AdminAuth",
            tags: ["api", "review"],
            validate: {
                params: Joi.object({
                    reviewId: Joi.string().required()
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
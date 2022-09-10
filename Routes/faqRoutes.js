const { FaqController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require("joi");
const Config = require('../Config');

module.exports = [
    //add edit faq
    {
        method: 'POST',
        path: '/admin/faq',
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(null, await Controller.addEditFaq(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'create faq API',
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    name: Joi.string(),
                    faqs: Joi.array().items(
                        Joi.object({
                            question: Joi.string().required(),
                            answer: Joi.string().required(),
                        })
                    ),
                    faqId: Joi.string(),
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

    //get faqs
    {
        method: "GET",
        path: "/faq",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.fetchFaqs(request.query)
                    );
                } catch (e) {
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Fetch faqs",
            tags: ["api", "faqs"],
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

    //delete faq
    {
        method: "DELETE",
        path: "/admin/faq/{faqId}",
        config: {
            handler: async function (request, h) {
                try {
                    return await UniversalFunctions.sendSuccess(
                        null,
                        await Controller.deleteFaqById(request.params)
                    );
                } catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e);
                }
            },
            description: "Delete faq by id",
            auth: "AdminAuth",
            tags: ["api", "faq"],
            validate: {
                params: Joi.object({
                    faqId: Joi.string().required()
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

    //update faq question
    {
        method: 'POST',
        path: '/admin/faq/{faqId}',
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(null, await Controller.updateFaqQuestion(request.params, request.payload))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'Update faq question API',
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    questionId: Joi.string().required(),
                    question: Joi.string(),
                    answer: Joi.string(),
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

    //delete faq question
    {
        method: 'DELETE',
        path: '/admin/faq/question/{faqId}',
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(null, await Controller.deleteFaqQuestion(request.params, request.query))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'Delete faq question API',
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                query: Joi.object({
                    questionId: Joi.string().required(),
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
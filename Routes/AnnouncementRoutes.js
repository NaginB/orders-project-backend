const { AnnouncementController: Controller } = require('../Controllers');
const UniversalFunctions = require('../Utils/UniversalFunction');
const Joi = require("joi");
const Config = require('../Config');

module.exports = [

    //add Announcement
    {
        method: 'POST',
        path: '/admin/announcement',
        config: {
            handler: async function (request, h) {
                try {
                    const userData =
                        request.auth &&
                        request.auth.credentials &&
                        request.auth.credentials.userData;
                    return UniversalFunctions.sendSuccess(null, await Controller.announcement(request.payload, userData))
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'announcement API',
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    title: Joi.string().required(),
                    description: Joi.string(),
                    image: Joi.string()
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

    //fetch Announcement
    {
        method: 'GET',
        path: '/announcement',
        config: {
            handler: async function (request, h) {
                try {
                    return UniversalFunctions.sendSuccess(null, await Controller.fetchAnnouncement())
                }
                catch (e) {
                    console.log(e);
                    return await UniversalFunctions.sendError(e)
                }
            },
            description: 'announcement API',
            auth: "AdminAuth",
            tags: ['api'],
            validate: {
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
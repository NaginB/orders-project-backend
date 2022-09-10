const Service = require("../Services").queries;
const UniversalFunctions = require("../Utils/UniversalFunction");
const Config = require("../Config");
const TokenManager = require("../Lib/TokenManager");
const mongoose = require("mongoose");
const Model = require("../Models");
const CodeGenerator = require("../Lib/CodeGenerator");
const emailFunction = require("../Lib/email");

//vendor register
async function vendorRegister(payloadData) {
    try {
        if (await Service.findOne(Model.Users, { email: payloadData.email })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS);
        }
        if (await Service.findOne(Model.Users, { mobile: payloadData.mobile })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);
        }
        if (await Service.findOne(Model.Vendor, { email: payloadData.email })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS);
        }
        if (await Service.findOne(Model.Vendor, { mobile: payloadData.mobile })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);
        }
        if (await Service.findOne(Model.Admin, { email: payloadData.email })) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_ALREADY_EXISTS);
        }
        const password = await UniversalFunctions.CryptData(payloadData.password)
        payloadData.password = password
        let vendor = await Service.saveData(Model.Vendor, payloadData)
        if (!vendor) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        }
        vendor = JSON.parse(JSON.stringify(vendor));
        delete vendor.password
        return vendor
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//vendor login
async function vendorLogin(payloadData) {
    try {
        let vendor = await Service.findOne(Model.Vendor, { email: payloadData.email })
        if (!vendor) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.VENDOR_NOT_EXISTS);
        }
        if (vendor.isBlocked || !vendor.isPublished) {
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED);
        }
        const validate = await UniversalFunctions.comparePassword(payloadData.password.toString(), vendor.password);
        if (!validate) {
            return Promise.reject(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PASSWORD);
        }
        tokenData = await TokenManager.setToken(
            {
                _id: vendor._id,
                type: Config.APP_CONSTANTS.DATABASE.USER_TYPE.VENDOR,
            },
        )
        vendor = JSON.parse(JSON.stringify(vendor));
        vendor.accessToken = tokenData.accessToken;
        if (vendor.isReject) {
            delete vendor.accessToken
        }
        delete vendor.password
        return vendor
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//vendor forgot password
async function forgotPassword(payloadData) {
    try {
        let criteria = false;
        if (payloadData.email) {
            criteria = { email: payloadData.email };
        }
        let user = await Service.findOne(Model.Vendor, criteria, {}, { lean: true });
        if (!user)
            return Promise.reject(
                Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PHONE_EMAIL
            );

        const verificationCode = await CodeGenerator.generateCode(6, "numeric");
        // const verificationCode = '123456';
        let otpData = {
            code: verificationCode,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
        };
        if (payloadData.email) {
            otpData.email = payloadData.email;
            const body = Config.APP_CONSTANTS.SERVER.otpEmail.body.replace(
                "{otp}",
                verificationCode
            );
            let email = emailFunction.sendEmail(
                payloadData.email,
                Config.APP_CONSTANTS.SERVER.otpEmail.subject,
                body,
                []
            );
        }

        const data = await Service.findAndUpdate(
            Model.OtpCodes,
            { email: payloadData.email },
            { $set: { ...otpData } },
            { upsert: true }
        );

        return {
            statusCode: 200,
            customMessage: "OTP Sent on Email",
            type: "OTP_SENT_ON_EMAIL",
        };
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//validate-otp
async function verifyOTP(payloadData) {
    try {
        const { code, email } = payloadData;
        const data = await Service.findOne(Model.OtpCodes, {
            email: email,
            code: code,
            status: 1,
            type: Config.APP_CONSTANTS.DATABASE.OTP_TYPE.FORGOT_PASSWORD,
        });
        if (!data) return { valid: false };
        return { valid: true };
    }
    catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

// change password
async function changePassword(payloadData) {
    try {
        const {
            STATUS_MSG: {
                SUCCESS: { UPDATED },
                ERROR: { IMP_ERROR, INVALID_OTP },
            },
            DATABASE: {
                USER_TYPE: { VENDOR },
                OTP_TYPE: { FORGOT_PASSWORD },
            },
        } = Config.APP_CONSTANTS;
        const { email, code, password } = payloadData;

        let otpObj = await Service.findAndUpdate(
            Model.OtpCodes,
            { email: email, code: code, status: 1, type: FORGOT_PASSWORD },
            { lean: true }
        );
        if (!otpObj) return Promise.reject(INVALID_OTP);
        const user = await Service.findAndUpdate(
            Model.Vendor,
            { email: email },
            {
                $set: {
                    password: await UniversalFunctions.CryptData(password),
                },
            },
            { lean: true, new: true }
        );
        if (user) {
            const tokenData = await TokenManager.setToken({
                _id: user._id,
                type: VENDOR,
            });
            return UPDATED;
        }
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//fetch vendor
async function fetchVendor(queryData, userData) {
    try {
        const { skip = undefined, limit = undefined, search, active = undefined,
            isBlocked = undefined, isReject = undefined, isPublished = undefined } = queryData;
        let query = { isDeleted: false }
        let projection = { isDeleted: 0, __v: 0, password: 0, accessToken: 0 }
        let options = { sort: { _id: -1 } };
        if (typeof skip !== "undefined" && typeof limit !== "undefined")
            options = { skip: skip, limit: limit, sort: { _id: -1 } };
        if (search)
            query.fullName = new RegExp(search, "ig");
        if (typeof active !== "undefined")
            query.active = active;
        if (typeof isBlocked !== "undefined")
            query.isBlocked = isBlocked;
        if (typeof isReject !== "undefined")
            query.isReject = isReject;
        if (typeof isPublished !== "undefined")
            query.isPublished = isPublished;
        let data = await Service.getData(Model.Vendor, query, projection, options)
        let total = await Service.count(Model.Vendor, query)
        return {
            vendorData: data,
            total: total
        }
    } catch (err) {
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//vendor status change
async function vendorStatusChange(paramsData) {
    try {
        let find = await Service.findOne(Model.Vendor, { _id: paramsData.vendorId })
        if (!find)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_EXIST)
        let isPublished
        if (find.isPublished)
            isPublished = false
        else
            isPublished = true
        let data = await Service.findAndUpdate(Model.Vendor, { _id: paramsData.vendorId }, { isPublished: isPublished, isReject: false }, { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        if (isPublished)
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.PUBLISHED;
        else
            return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.UNPUBLISHED;

    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}

//vendor status change block
async function vendorStatusChangeBlock(paramsData) {
    try {
        let data = await Service.findAndUpdate(Model.Vendor,
            { _id: paramsData.vendorId },
            { isBlocked: true },
            { lean: true, new: true })
        if (!data)
            return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.VENDOR_BLOCK;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


//vendorReject
async function vendorReject(payloadData) {
    try {
        const vendor = await Service.findAndUpdate(Model.Vendor, { _id: payloadData.vendorId, isDeleted: false },
            {
                isReject: true,
                isPublished: true
            },
            {
                new: true
            })
        const body = Config.APP_CONSTANTS.SERVER.RejectEmail.body.replace(
            "{reason}",
            payloadData.reason
        );
        let email = emailFunction.sendEmail(
            vendor.email,
            Config.APP_CONSTANTS.SERVER.RejectEmail.subject,
            body,
            []
        );
        return Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT;
    } catch (err) {
        console.log(err);
        return Promise.reject(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
    }
}


module.exports = {
    vendorRegister,
    vendorLogin,
    forgotPassword,
    verifyOTP,
    changePassword,
    fetchVendor,
    vendorStatusChange,
    vendorStatusChangeBlock,
    vendorReject
}


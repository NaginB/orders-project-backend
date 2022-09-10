let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Vendor = new Schema({
    fullName: {
        type: String
    },
    userName: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String
    },
    gstNo: {
        type: String
    },
    idProof: {
        adharCardFront: { type: String },
        adharCardBack: { type: String },
        addressProof: { type: String }
    },
    pickupAddress: {
        pincode: { type: String },
        address: { type: String },
        location: { type: String },
        city: { type: String },
        state: { type: String }
    },
    bankDetails: {
        bankName: { type: String },
        accountNo: { type: String },
        ifsc: { type: String },
        accountHolderName: { type: String },
        cancelCheck: { type: String }
    },
    isBlocked: { type: Boolean, default: false },
    isReject: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    accessToken: { type: String, trim: true, index: true, sparse: true, default: null },

}, {
    timestamps: true
});

module.exports = mongoose.model('Vendor', Vendor);





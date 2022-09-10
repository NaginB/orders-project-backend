let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config');

let Offer = new Schema({
    name: { type: String, unique: true, trim: true },
    discountType: { type: String, enum: Object.values(Config.APP_CONSTANTS.DATABASE.DISCOUNT_TYPE) },
    offerStatus: { type: String, enum: Object.values(Config.APP_CONSTANTS.DATABASE.OFFER_STATUS) },
    discountCode: { type: String, unique: true, trim: true },
    discountCodeMethod: { type: String, enum: Object.values(Config.APP_CONSTANTS.DATABASE.DISCOUNT_CODE_METHOD) },
    discountValue: { type: Number },
    minimumPurchaseAmount: { type: Number },
    numberOfPurchase: { type: Number },
    limitOfPurchaseUser: { type: Number },
    numberOfUse: { type: Number, default: 0 },
    startDate: { type: String },
    endDate: { type: String },
    addedBy: { type: Schema.ObjectId, ref: 'Admin' },
    isDeleted: { type: Boolean, default: false },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Offer', Offer);
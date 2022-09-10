let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config');

let UserCoupon = new Schema({
    userId: { type: Schema.ObjectId, ref: 'Users' },
    coupon: { type: String },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('UserCoupon', UserCoupon);
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config');

let Orders = new Schema({
    addedBy: { type: Schema.ObjectId, ref: 'Users', index: true },
    orderStatus: { type: String, trim: true, enum: Object.values(Config.APP_CONSTANTS.DATABASE.ORDER_STATUS), default: Config.APP_CONSTANTS.DATABASE.ORDER_STATUS.PENDING },
    orderNumber: { type: String, unique: true, trim: true },
    paymentMode: { type: String, trim: true, enum: Object.values(Config.APP_CONSTANTS.DATABASE.PAYMENT_MODE) },
    cartId: { type: Schema.ObjectId, ref: 'Cart', index: true, trim: true },
    addressId: { type: Schema.ObjectId, ref: 'Users', trim: true },
    productId: { type: Schema.ObjectId, ref: 'Product' },
    quantity: { type: Number },
    price: { type: Number },
    variantId: { type: Schema.ObjectId, ref: 'Product' },
    vendorId: { type: Schema.ObjectId, ref: 'Vendor', index: true },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Orders', Orders);
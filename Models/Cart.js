let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config').APP_CONSTANTS;

let Cart = new Schema({
    addedBy: { type: Schema.ObjectId, ref: 'Users', index: true },
    status: { type: Number, default: 1 }, //1 - use ,2 - unUsed,
    item: [{
        productId: { type: Schema.ObjectId, ref: 'Product' },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
        variantId: { type: Schema.ObjectId, ref: 'Product' },
        vendorId: { type: Schema.ObjectId, ref: 'Vendor', index: true },
    },
    ],
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', Cart);





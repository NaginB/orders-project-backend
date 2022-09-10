let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Wishlist = new Schema({
    addedBy: { type: Schema.ObjectId, ref: 'Users', index: true },
    items: [{ type: Schema.ObjectId, ref: 'Product' }],
}, {
    timestamps: true
});

module.exports = mongoose.model('Wishlist', Wishlist);





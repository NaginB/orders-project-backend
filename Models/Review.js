let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Review = new Schema({
    productId: {
        type: Schema.ObjectId, ref: 'Product'
    },
    isDeleted: {
        type: Boolean, default: false
    },
    review: {
        type: String
    },
    rating: {
        type: Number
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: 'Users'
    },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Review', Review);
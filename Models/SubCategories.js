let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Config = require('../Config');

let SubCategories = new Schema({
    name: { type: String, trim: true, required: true, index: true },
    icon: { type: String },
    active: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    categoryId: { type: Schema.ObjectId, ref: 'Categories' },
    addedBy: { type: Schema.ObjectId, ref: 'Users', index: true },
},
    {
        timestamps: true
    });

module.exports = mongoose.model('SubCategories', SubCategories);
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Announcement = new Schema({
    title: { type: String },
    description: { type: String },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
    addedBy: { type: Schema.ObjectId, ref: 'Admin' }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Announcement', Announcement);
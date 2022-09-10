let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let Brand = new Schema(
    {
        name: { type: String, required: true },
        addedBy: { type: Schema.ObjectId, ref: 'Admin', index: true },
        active: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Brand", Brand);
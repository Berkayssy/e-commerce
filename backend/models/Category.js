const moongoose = require('mongoose');

const categorySchema = new moongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    parent: {
        type: moongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    image: {
        type: {
            public_id: { type: String },
            url: { type: String },
            width: { type: Number },
            height: { type: Number },
            format: { type: String },
            resource_type: { type: String },
            bytes: { type: Number },
            created_at: { type: Date },
            original_filename: { type: String }
        },
        default: null
    }
}, { timestamps: true });

module.exports = moongoose.model("Category", categorySchema);
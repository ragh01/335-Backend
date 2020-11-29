const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    mrp: {
        type: Number,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    size: {
        type: Number
    },
    code: {
        type: Number
    },
    color: {
        type: String
    }
    ,
    quantity: {
        type: Number
    }
    
}, {
    timestamps: true
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product
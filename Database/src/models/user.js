const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Product = require('./product')
//var messagebird = require('messagebird')('1LJkKm1MQJB8A2PA1r4ie23pS')
const serviceID = "VA07cdab6c5ea0975d0674fcfabfc27ed0"
const accountSID = "AC3910fc0e90e373d96185d7024f4e424c"
const authToken = "4f35332b9142bab9cdf86a7e04a7bb9e"

const client = require('twilio')(accountSID,authToken)

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone_no: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isMobilePhone(value)) {
                throw new Error('Phone number is invalid')
            }
        }
    },
    previous_orders:{
        type:Object
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.phone_no
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// userSchema.methods.generateOTP = async function (phone_no) {
//     const user = this

//     const otp = client
//                     .verify
//                     .services(serviceID)
//                     .verifications
//                     .create({
//                         to:`+91${phone_no}`,
//                         channel:sms
//                     })
//             return otp
// }

// userSchema.methods.verifyOTP = async function (otp) {
    
//     const ver_OTP= client
//                     .verify
//                     .services(serviceID)
//                     .verificationChecks
//                     .create({
//                         to:`+91${phone_no}`,
//                         code:otp
//                     })
//         return ver_OTP            
// }

// userSchema.statics.findByCredentials = async (name, phone_no) => {
//     const user = await User.findOne({ phone_no })

//     if (!user) {
//         throw new Error('Unable to login')
//     }

//     const isMatch = await bcrypt.compare(phone_no, user.phone_no)

//     if (!isMatch) {
//         throw new Error('Unable to login')
//     }

//     return user
// }

userSchema.statics.findByCredentials = async (phone_no) => {
    const user = await User.findOne({ phone_no })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = true

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}



// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user products when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Product.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
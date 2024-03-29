const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const privateKey = process.env.JWT_KEY;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) throw new Error('Invalid email');
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
});

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'owner',
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
    return user;
};

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, privateKey, {
        expiresIn: '7 days',
    });
    user.tokens.push({ token });
    await user.save();
    return token;
};

userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject._id;
    delete userObject.tokens;
    delete userObject.__v;
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = { User, privateKey };

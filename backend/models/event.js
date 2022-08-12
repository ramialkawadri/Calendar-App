const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        startTimestamp: {
            type: Number,
            required: true,
        },
        endTimestamp: {
            type: Number,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

eventSchema.methods.toJSON = function () {
    const eventObject = this.toObject();
    delete eventObject._id;
    delete eventObject.__v;
    delete eventObject.owner;
    return eventObject;
};

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;

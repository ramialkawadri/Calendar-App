const express = require('express');
const { default: mongoose } = require('mongoose');
const { auth } = require('../middleware/auth');
const Event = require('../models/event');

const router = new express.Router();

// Check if the operations sent by the body is valid, returns a bool
const checkValidOperation = function (body) {
    const validOperations = [
        'title',
        'description',
        'startTimestamp',
        'endTimestamp',
        '_id',
    ];
    const bodyKeys = Object.keys(body);
    return bodyKeys.every((key) => validOperations.includes(key));
};

// Creating an event
router.post('/event', auth, async (req, res) => {
    if (!checkValidOperation(req.body)) {
        res.status(400).send();
        return;
    }

    try {
        const event = new Event({ ...req.body, owner: req.user._id });
        await event.save();
        res.send(event);
    } catch (e) {
        res.status(400).send();
    }
});

// Editing an event
router.patch('/event/:id', auth, async (req, res) => {
    if (!checkValidOperation(req.body)) {
        res.status(400).send();
        return;
    }

    try {
        const event = await Event.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!event) res.status(404).send('Event not found!');
        else {
            const operationsKeys = Object.keys(req.body);
            operationsKeys.forEach((key) => (event[key] = req.body[key]));
            await event.save();
            res.send(event);
        }
    } catch (e) {
        res.status(400).send();
    }
});

// Removing an event
router.delete('/event/:id', auth, async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            owner: req.user._id,
        });
        if (!event) throw new Error();
        await event.remove();
        res.send();
    } catch (e) {
        res.status(400).send();
    }
});

// Returns the events that the user has, you can add the following queries:
// start=value, end=value
router.get('/event', auth, async (req, res) => {
    try {
        const user = req.user;
        const match = {};
        if (req.query.start)
            match.startTimestamp = {
                $gte: req.query.start,
            };
        if (req.query.end)
            match.endTimestamp = {
                $lte: req.query.end,
            };

        await user.populate({
            path: 'events',
            match,
        });
        res.send(user.events);
    } catch (e) {
        res.status(400).send();
    }
});

// Returns an object id
router.get('/generateID', (req, res) => {
    const id = new mongoose.Types.ObjectId();
    res.send(id);
});

module.exports = router;

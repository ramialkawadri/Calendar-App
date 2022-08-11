const express = require('express');
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
    ];
    const bodyKeys = Object.keys(body);
    return bodyKeys.every((key) => validOperations.includes(key));
};

// Creating an event
router.post('/createEvent', auth, async (req, res) => {
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
router.patch('/editEvent/:id', auth, async (req, res) => {
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

module.exports = router;

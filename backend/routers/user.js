const express = require('express');
const jwt = require('jsonwebtoken');
const { User, privateKey } = require('../models/user');
const { auth } = require('../middleware/auth');

const router = new express.Router();

// Creating user
router.post('/createUser', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ token, user });
    } catch (e) {
        res.status(500).send();
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        if (!user) throw new Error();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

// Checks if a token is valid
router.post('/token', async (req, res) => {
    try {
        const token = req.body.token;
        const decoded = jwt.verify(token, privateKey);
        const user = User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) res.status(400).send();
        else res.send();
    } catch (e) {
        res.status(400).send();
    }
});

// Logout
router.post('/logout', auth, async (req, res) => {
    const user = req.user;
    user.tokens = user.tokens.filter((token) => token.token !== req.token);
    await user.save();
    res.send();
});

router.post('/logoutAll', auth, async (req, res) => {
    const user = req.user;
    user.tokens = [];
    await user.save();
    res.send();
});

module.exports = router;

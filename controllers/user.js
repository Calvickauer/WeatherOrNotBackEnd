// Imports
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { JWT_SECRET } = process.env;

// DB Models
const User = require('../models/user');

// Controllers
router.get('/test', (req, res) => {
    res.json({ message: 'User endpoint OK! ✅' });
});

router.post('/signup', (req, res) => {
    // POST - adding the new user to the database
    console.log('===> Inside of /signup');
    console.log('===> /register -> req.body',req.body);

    User.findOne({ email: req.body.email })
    .then(user => {
        // if email already exists, a user will come back
        if (user) {
            // send a 400 response
            return res.status(400).json({ message: 'Email already exists' });
        } else {
            // Create a new user
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            // Salt and hash the password - before saving the user
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    console.log('==> Error inside of genSalt', err);
                    return res.status(500).json({ message: 'Error occurred during user registration' });
                }

                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        console.log('==> Error inside of hash', err);
                        return res.status(500).json({ message: 'Error occurred during user registration' });
                    }
                    // Change the password in newUser to the hash
                    newUser.password = hash;
                    newUser.save()
                    .then(createdUser => res.json({ user: createdUser }))
                    .catch(err => {
                        console.log('==> Error saving user', err);
                        res.json({ message: 'Error occurred... Please try again.' });
                    });
                });
            });
        }
    })
    .catch(err => { 
        console.log('==> Error finding user', err);
        res.json({ message: 'Error occurred... Please try again.' });
    })
});


router.post('/login', async (req, res) => {
    const foundUser = await User.findOne({ email: req.body.email });

    if (foundUser) {
        let isMatch = await bcrypt.compare(req.body.password, foundUser.password);
        
        if (isMatch) {
            const payload = {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                if (err) {
                    return res.status(400).json({ success: false, message: 'Session has ended, please log in again' });
                }
                const legit = jwt.verify(token, JWT_SECRET);
                return res.json({ success: true, token: `Bearer ${token}`, userData: legit });
            });

        } else {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
    } else {
        return res.status(400).json({ success: false, message: 'User not found' });
    }
});

// private
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('====> inside /profile');
    console.log(req.body);
    console.log('====> user')
    console.log(req.user);
    const { id, name, email } = req.user; // object with user object inside
    res.json({ id, name, email });
});

router.get('/messages', passport.authenticate('jwt', { session: false }), async (req, res) => {
    console.log('====> inside /messages');
    console.log(req.body);
    console.log('====> user')
    console.log(req.user);
    const { id, name, email } = req.user; // object with user object inside
    const userIdToAccess = 'your_specific_user_id'; // Change this to the specific user ID you want to allow access to

    if (id === userIdToAccess) {
        const messageArray = ['message 1', 'message 2', 'message 3', 'message 4', 'message 5', 'message 6', 'message 7', 'message 8', 'message 9'];
        const sameUser = await User.findById(id);
        res.json({ id, name, email, message: messageArray, sameUser });
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
});

// Exports
module.exports = router;
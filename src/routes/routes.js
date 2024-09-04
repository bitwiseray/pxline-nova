const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');
const { checkAuth, checkNotAuth } = require('../config/validators');
const initGateway = require('../config/auth');

const getViewFilePath = (fileName) => path.resolve(__dirname, '..', '..', 'client', 'src', 'views', fileName);
initGateway();

router.get('/login', (request, reply) => {
    reply.sendFile(getViewFilePath('login.html'));
});

router.get('/me', (request, reply) => {
    reply.sendFile(getViewFilePath('login.html'));
});

router.get('/', checkAuth, async (request, reply) => {
    reply.send({ message: `Hello, ${request.user?.display_name}!` });
});

router.post('/login', checkNotAuth, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect(`/login?error=${info.message}`);
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/signup', (request, reply) => {
    reply.sendFile(getViewFilePath('signup.html'));
});

module.exports = router;
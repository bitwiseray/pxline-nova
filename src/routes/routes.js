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

router.get('/chat', checkAuth, (request, reply) => {
    reply.sendFile(getViewFilePath('index.html'));
});

router.get('/', checkAuth, (request, reply) => {
    reply.redirect('/chat/me');
});

router.get('/chat/me', checkAuth, (request, reply) => {
    reply.sendFile(getViewFilePath('index.html'));
});

router.get('/settings', checkAuth, async (request, reply) => {
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
            return res.redirect('/chat/me');
        });
    })(req, res, next);
});

router.get('/signup', (request, reply) => {
    reply.sendFile(getViewFilePath('signup.html'));
});

router.get('/logout', checkAuth, (request, reply) => {
    request.logOut((err) => {
        if (err) {
            request.flash('error', 'Something went wrong');
            reply.redirect('/');
            return console.error({ at: '/logout', error: err });
        }
        request.flash('success', 'Logged out successfully');
        reply.redirect('/login');
    });
});

module.exports = router;
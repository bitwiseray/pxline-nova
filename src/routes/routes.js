const express = require('express');
const router = express.Router();
const path = require('path');
const getViewFilePath = (fileName) => path.resolve(__dirname, '..', '..', 'client', 'src', 'views', fileName);

router.get('/login', (request, reply) => {
    reply.sendFile(getViewFilePath('login.html'));
});

router.get('/signup', (request, reply) => {
    reply.sendFile(getViewFilePath('signup.html'));
});


module.exports = router;

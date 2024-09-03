const express = require('express');
const router = express.Router();
const path = require('path');
const getViewFilePath = (fileName) => path.resolve(__dirname, '../../../client/src/views', fileName);

router.get('/login', (request, reply) => {
    console.log(getViewFilePath('login.html'))
    reply.sendFile(getViewFilePath('login.html'));
});

router.get('/', (request, reply) => {
    reply.send({ msg: 'Hello my lord' });
});

module.exports = router;

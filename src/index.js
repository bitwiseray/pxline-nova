const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
require('dotenv').config();
const listerApp = express();
const server = http.createServer(listerApp);
const io = socket(server);

listerApp.use(express.static(path.join(__dirname, '..', 'client', 'src')));

listerApp.use(express.json());
// listerApp.use('/api/v1', require('./routes/source-routes'));
listerApp.use('/', require('./routes/routes'));

server.listen(8080, async () => {
    // await mongoose.connect(process.env.srv);
    console.log(`Server is running on http://localhost:8080`);
});

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const http = require('http');
const flash = require('express-flash');
const socket = require('socket.io');
require('dotenv').config();
const listerApp = express();
const server = http.createServer(listerApp);
const io = socket(server);

listerApp.use(express.static(path.join(__dirname, '..', 'client', 'src')));
listerApp.use(express.json());
listerApp.use(express.urlencoded({ extended: true }));
listerApp.use(session({
    secret: process.env.sessionkey,
    resave: false,
    saveUninitialized: false,
}));
listerApp.use(passport.initialize());
listerApp.use(passport.session());
listerApp.use(flash());
listerApp.use('/api/v1', require('./routes/source-routes'));
listerApp.use('/', require('./routes/routes'));

require('./sockets/message')(io);

server.listen(8080, async () => {
    await mongoose.connect(process.env.srv);
    console.log(`Server is running on http://localhost:8080`);
});

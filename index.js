const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const socket = require('socket.io');
const listerApp = express();

listerApp.use('/api/v1', require('./routes/source-routes'));
listerApp.use('/', require('./routes/routes'));
require('dotenv');
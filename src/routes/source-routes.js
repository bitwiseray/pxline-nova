const express = require('express');
// const multer = require('multer');
const router = express.Router();
const CardinalSource = require('../utils/source');
const { checkAuth, checkNotAuth } = require('../config/validators');
// const { storage, clearCache } = require('../utils/upload-sys');
const fs = require('fs');
const path = require('path');
const SourceRooms = require('../utils/source-rooms');
const SourceProfiles = require('../utils/source-users');

router.get('/indexes', checkAuth, async (request, reply) => {
    try {
        const offload = await CardinalSource.getIndexes(request.user);
        let collectedChatIds = [];
        offload.rooms.forEach(room => {
            collectedChatIds.push(room.chats.chat_id);
        });
        offload.users.forEach(user => {
            let obj = user.chats.find(thisObj => thisObj.user_id == request.user._id);
            if (obj) collectedChatIds.push(obj.chat_id);
        });
        const lastMessages = await CardinalSource.getLastMessages(collectedChatIds);
        let toSendData = {
            user: request.user,
            extusers: offload.users,
            extrooms: offload.rooms,
            lastMessages: lastMessages,
            // friends: friends
        }
        reply.status(200).json(toSendData);
    } catch (error) {
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Something went wrong while fetching data', error: error });
    }
});

router.get('/chat/:id/', checkAuth, async (request, reply) => {
    try {
        const id = request.params.id;
        const type = await CardinalSource.checkIdType(id);
        if (type === 'room') {
            const offload = await SourceRooms.loadRoom(id);
            const toSendData = {
                type: 'room',
                extusers: offload.members,
                room: offload.room,
                chats: offload.chats,
                user: request.user
            }
            reply.status(200).json(toSendData);
        } else {
            await CardinalSource.checkChats(request.user._id.toString(), id, 'DM');
            const usrOffload = await SourceProfiles.loadUser(id, request.user._id, '_id user_name display_name image chats createdAt');
            const toSendData = {
                type: 'DM',
                extusers: usrOffload.user,
                chats: usrOffload.chats,
                room: null,
                user: request.user
            };
            reply.status(200).json(toSendData);
        }
    } catch (e) {
        reply.status(500).send({ code: 'INTERNAL_ERROR', message: 'Something went wrong while fetching data', error: e });
        console.error({ at: '/api/v1/chat', error: e });
    }
});

module.exports = router;
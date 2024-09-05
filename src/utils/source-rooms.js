const Room = require('../models/Room');
const Chat = require('../models/Chat');
const Profiles = require('../models/Profile');

class SourceRooms {
    static async loadRoom(id, loads) {
        try {
            const room = await Room.findById(id);
            if (!room) return { code: 'NO_ROOM_FOUND' };
            const chats = await Chat.findById(room.chats.chat_id);
            const members = await Profiles.find({ _id: { $in: room.members } }, loads);
            return { room, chats, members };
        } catch (error) {
            return { error: error, code: 'INTERNAL_ERROR' };
        }
    }
    static async getRoomsFromChats(ids) {
        try {
            const rooms = await Room.find({ _id: { $in: ids } }, '_id title icon members settings chats');
            return rooms;
        } catch (error) {
            return { error: error, code: 'INTERNAL_ERROR' };
        }
    }
}

module.exports = SourceRooms;
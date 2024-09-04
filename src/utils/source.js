const Room = require('../models/Room');
const Chat = require('../models/Chat');
const Profiles = require('../models/Profile');
const SourceRooms = require('./source-rooms');
const SourceProfiles = require('./source-users');

class CardinalSource {
    static async getIndexes(user) {
        if (!user || !user.chats) return { status: 'REJECTED', code: 'INVALID_CREDS' };
        const roomChatIds = user.chats.filter(chat => chat.chat_type === 'room').map(chat => chat.chat_id);
        const rooms = await SourceRooms.getRoomsFromChats(roomChatIds);
        const chatIds = user.chats.map(chat => chat.user_id || chat.chat_id);
        const users = await SourceProfiles.getUsersWithId(chatIds);
        return { rooms, users };
    }
    static async getLastMessages(entityIds) {
        let toReturnArray = [];
        await Promise.all(entityIds.map(async (entity) => {
            if (entity) {
                let chat = await Chat.findById(entity.toString());
                if (!chat) return { status: 'HALTED', code: 'NOT_FOUND', message: 'Chat does not exist' };
                const lastObj = chat.svd_chats[chat.svd_chats.length - 1];
                if (!lastObj) return toReturnArray.push([]);
                const username = await Profiles.findById(lastObj.sender, 'display_name');
                toReturnArray.push({
                    id: entity,
                    content: lastObj.content.text,
                    createdAt: lastObj.content.timestamp,
                    sender: username.display_name,
                });
            }
        }));
        return toReturnArray;
    }
    static async checkIdType(id) {
        try {
          if (!id.match(/^[0-9a-fA-F]{24}$/)) return;
          const user = await Profiles.findOne({ _id: id });
          if (user) {
            return 'user';
          }
          const room = await Room.findOne({ _id: id });
          if (room && room.members) {
            return 'room';
          }
          return null;
        } catch (error) {
          console.error('Error checking ID type:', error);
          return null;
        }
      }
}

module.exports = CardinalSource;
const Profiles = require('../models/Profile');
const Chat = require('../models/Chat');

class SourceProfiles {
    static async loadUser(target, meId, loads) {
        try {
            const user = await Profiles.findById(target, loads);
            if (!user) {
                return 'NO_USER_FOUND';
            }
            if (!meId) {
                return user;
            }
            const chatId = user.chats.find(chat => chat.user_id === meId.toString())?.chat_id;
            const chats = await Chat.findById(chatId);
            return { user, chats };
        } catch (error) {
            return { error: error, code: 'INTERNAL_ERROR' };
        }
    }
    static async getUsersWithId(objectIds) {
        try {
            const users = await Profiles.find({ _id: { $in: objectIds } }, '_id user_name display_name image chats');
            return users;
        } catch (error) {
            return { error: error, code: 'INTERNAL_ERROR' };
        }
    }
}

module.exports = SourceProfiles;
const socket = io('/');
const ext = JSON.parse(localStorage.getItem('ext'));

if (!ext || !ext.type || !ext.chats) {
    throw { status: 'SYSTEM_ERROR', code: 'NO_EXT_LOAD_FOUND' };
}

const { type, room, chats, user } = ext;


class FactorSocketChats {
    static getSnowflakes() {
        if (type === 'room') {
            return { id: room?._id, chatId: chats?._id, idType: 'unique' };
        } else if (type === 'DM') {
            return { id: chats?._id, chatId: chats?._id, idType: 'same' };
        }
        return { status: 'FAILED', code: 'PUBLIC_INSTANCE_ERROR' };
    }

    static deleteMessage(id) {
        if (!id || !user?._id) {
            throw { status: 'HALTED', code: 'INVALID_OR_MISSING_DATA' };
        }
        socket.emit('delete', { id: id, by: user._id });
    }

    static joinRoom() {
        const { id, chatId } = this.getSnowflakes() || {};
        if (chatId) {
            socket.emit('joinRoom', { _id: id, chatLoad: chatId });
            console.log({ status: 'SUCCESS', code: null });
        } else {
            throw { status: 'HALTED', code: 'INVALID_OR_MISSING_DATA' };
        }
    }
}

class Socketinit {
    constructor() {
        this.setupSocketEvents();
        FactorSocketChats.joinRoom();
    }
    setupSocketEvents() {
        socket.on('messageCreate', (message) => {
            MessageHandler.fillMessage(message.author.displayname, message.author.image, message.content.text, message.attachments, message.content.timestamp, message.id)
        });
    }
}

try {
    new Socketinit();
} catch (err) {
    console.error(`Error: ${err.status} - ${err.code}`);
}

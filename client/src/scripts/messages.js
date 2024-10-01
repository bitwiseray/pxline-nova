const socket = io('/');
const ext = JSON.parse(localStorage.getItem('ext'));

if (!ext || !ext.type || !ext.chats) {
    throw { status: 'SYSTEM_ERROR', code: 'NO_EXT_LOAD_FOUND' };
    showErrorModal();
}

const { type, room, chats, user } = ext;
const input = document.querySelector('.input-field');

class FactorSocketChats {
    static getSnowflakes() {
        if (type === 'room') {
            return { id: room?._id, chatId: chats?._id, idType: 'unique' };
        } else if (type === 'DM') {
            return { id: chats?._id, chatId: chats?._id, idType: 'same' };
        }
        throw { status: 'FAILED', code: 'PUBLIC_INSTANCE_ERROR' };
    }
    static deleteMessage(id) {
        if (!id || !user?._id) {
            throw { status: 'HALTED', code: 'INVALID_OR_MISSING_DATA' };
        }
        socket.emit('delete', { id: id, by: user._id });
        return { status: 'SUCCESS'}
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
    static async sendMessage() {
        let contents = input.value.trim();
        // let attachments = file;
        // let url = '';
        // if (attachments) {
        //   url = await uploadMedia(attachments);
        // }
        if (!contents && !attachments) return;
        let chatDetails;
        if (type === 'room') {
            chatDetails = {
                id: room._id,
                name: room.title,
                image: room.icon,
                members: room.members,
                chat_id: this.getSnowflakes().chatId,
            };
        } else {
            chatDetails = {
                id: extusers._id,
                name: extusers.display_name,
                image: extusers.image,
                members: null,
                chat_id: this.getSnowflakes().chatId,
            };
        }
        socket.emit('message', {
            content: { text: contents, timestamp: Date.now() },
            author: {
                id: user._id,
                displayname: user.display_name,
                username: user.user_name,
                image: user.image,
            },
            room: chatDetails,
            // attachments: url?.data?.url || null,
        });
        input.value = '';
        // clearMediaFeedback();
    }
}

class Socketinit {
    constructor() {
        this.setupSocketEvents();
        this.setupSend();
        FactorSocketChats.joinRoom();
    }
    setupSocketEvents() {
        socket.on('messageCreate', (message) => {
            MessageHandler.fillMessage(message.author.displayname, message.author.image, message.content.text, message.attachments, message.content.timestamp, message.author.id)
        });
    }
    setupSend() {
        document.addEventListener('keydown', (e) => {
            input.focus();
            if (e.key === 'Enter' && !e.shiftKey) {
                if (!input.value) return;
                e.preventDefault();
                FactorSocketChats.sendMessage();
            }
        });
    }
}

try {
    new Socketinit();
} catch (err) {
    showErrorModal();
    console.error(`Error: ${err.status} - ${err.code}`);
}

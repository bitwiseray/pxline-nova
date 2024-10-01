class MessageHandler {
    static firstTime = true;
    static fillMessage(senderName, image, content, attachment, timestamp, id) {
        const isMe = id === document.querySelector('.nav-icon').id;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (isMe) {
            messageDiv.classList.add('me');
        } else {
            const profilePic = document.createElement('img');
            profilePic.src = image;
            profilePic.alt = `${senderName}'s profile picture`;
            profilePic.classList.add('message-pic');
            messageDiv.appendChild(profilePic);
        }
        if (attachment) {
            const attachImg = document.createElement('img');
            attachImg.src = attachment;
            attachImg.classList.add('message-image');
            messageDiv.appendChild(attachImg);
        }
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        if (/^[\p{Emoji_Presentation}\p{Emoji}\u200d\ufe0f]+$/u.test(content.text)) {
            messageBubble.style.background = 'none';
            messageBubble.style.fontSize = '35px';
        }        
        messageBubble.innerHTML = `<p>${content}</p><span class="timestamp">${formatTimestamp(timestamp, true)}</span>`;
        messageDiv.appendChild(messageBubble);
        messageDiv.classList.add('animate');
        let container = document.querySelector('.chat-content');
        container.appendChild(messageDiv);
        if (MessageHandler.firstTime || container.scrollTop + container.clientHeight === container.scrollHeight) {
            container.scrollTop = container.scrollHeight;
            MessageHandler.firstTime = false;
        }
    }
}

class MessageActionMenu {
    static delete(id) {
        let fall = FactorSocketChats.deleteMessage(id);
        if (fall.status === 'SUCCESS') {
            document.getElementById(id).remove();
        } else {
            throw { status: 'FAILED' };
        }
    }
    static async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            return { status: 'SUCCESS' };
        } catch (error) {
            throw { status: 'FAILED' };
        }
    }    
}
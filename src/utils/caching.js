const Chat = require('../models/Chat');
const Cache = new Map();

function isMatchFn(chats, svdChatsFromDB) {
  if (!svdChatsFromDB || !Array.isArray(svdChatsFromDB)) return false;
  return chats.some(localChat => 
    svdChatsFromDB.some(chatFromDB => 
      localChat.content.text === chatFromDB.content.text &&
      Math.abs(Number(localChat.content.timestamp) - Number(chatFromDB.content.timestamp)) < 50 && localChat.sender === chatFromDB.sender)
  );
}

async function saveChats(id) {
  if (!id) return { status: 'FAILED', code: 'INVALID_ID', error: 'Invalid or missing id' };
  try {
    const chat = await Chat.findById(id);
    const cachedChats = Cache.get(id);
    if (!chat || !cachedChats) {
      return { status: 'FAILED', code: 'NOT_FOUND', error: 'No cached entry or global entry for the provided id found' };
    }
    const isMatch = isMatchFn(cachedChats.svd_chats, chat.svd_chats);
    if (!isMatch) {
      await Chat.findByIdAndUpdate(id, {
        $push: {
          svd_chats: { $each: cachedChats.svd_chats }
        }
      }, { new: true });
    }
    Cache.delete(id);
    return { status: 'SUCCESS', code: 'CHATS_SAVED', error: null };
  } catch (error) {
    console.error('Error saving chats:', error);
    return { status: 'FAILED', code: 'SYSTEM_ERROR', error: error.message };
  }
}

function handleCache(forId, handle) {
  if (handle === 'delete') {
    Cache.delete(forId);
  } else if (handle === 'create') {
    Cache.set(forId, {
      timestamp: Date.now(),
      svd_chats: []
    });
  }
}

function cacheChats(id, chat) {
  if (!chat) return { status: 'FAILED', code: 'NOT_FOUND', error: 'No message object found' };
  if (!Cache.has(id)) {
    handleCache(id, 'create');
  }
  const toAppendObj = {
    content: {
      text: chat.content.text,
      timestamp: chat.content.timestamp,
    },
    sender: chat.author.id,
    attachments: chat.attachments
  };
  const existingCache = Cache.get(id);
  existingCache.svd_chats.push(toAppendObj);
  Cache.set(id, existingCache);
  return { status: 'SUCCESS', code: 'CHAT_CACHED', error: null };
}

async function deleteMessage(id, by, chatId) {
  if (!id || !by || !chatId) {
    return { status: 'FAILED', code: 'INVALID_DATA', error: 'Missing required parameters' };
  }
  let cache = Cache.get(chatId);
  if (cache?.svd_chats?.length > 0) {
    const initialLength = cache.svd_chats.length;
    cache.svd_chats = cache.svd_chats.filter(message => message.sender !== by || message.content._id !== id);
    if (cache.svd_chats.length < initialLength) {
      Cache.set(chatId, cache);
      return { status: 'SUCCESS', code: 'MESSAGE_DELETED', error: null };
    }
  }
  try {
    const result = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { svd_chats: { _id: id, sender: by } } },
      { new: true }
    );
    if (!result) {
      return { status: 'FAILED', code: 'NOT_FOUND', error: 'Chat not found' };
    }
    return { status: 'SUCCESS', code: 'MESSAGE_DELETED', error: null };
  } catch (error) {
    console.error('Error deleting message:', error);
    return { status: 'FAILED', code: 'DATABASE_ERROR', error: error.message };
  }
}

module.exports = { saveChats, cacheChats, deleteMessage };
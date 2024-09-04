const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String },
  members: { type: [mongoose.Schema.Types.ObjectId], ref: 'Profile' },
  roles: { type: Object },
  settings: { type: Object },
  createdAt: { type: Number, default: Date.now },
  socials: { bio: String },
  chats: {
    chat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    chat_type: { type: String }
  }
});

roomSchema.methods.addMember = async function (userId) {
  if (this.members.includes(userId)) {
    throw { code: 'HALTED', message: `User \`${userId}\` is already a member` };
  }

  try {
    this.members.push(userId);
    const user = await mongoose.model('Profile').findById(userId);
    if (!user) throw new Error(`[ERROR] User ID: ${userId} not found`);
    user.chats.push({ chat_id: this._id.toString(), chat_type: 'room' });
    await this.save();
    await user.save();
    return { code: 'SUCCESS', message: `User \`${userId}\` successfully added to room` };
  } catch (error) {
    throw { error: error, code: 'INTERNAL_SERVER_ERROR' };
  }
};

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
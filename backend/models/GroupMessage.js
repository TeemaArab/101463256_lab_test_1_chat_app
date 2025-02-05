
const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    username: { type: String, required: true },
    room: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GroupMessage', GroupMessageSchema);

import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: false,
        index: true,
    },
    title: {
        type: String,
        required: true,
        default: 'New Chat',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
    messageCount: {
        type: Number,
        default: 0,
    }
});

ConversationSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

export default mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

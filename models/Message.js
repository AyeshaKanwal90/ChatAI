import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'assistant', 'system'],
    },
    content: {
        type: String,
        required: true,
    },
    id: {
        type: String, // Client-side ID
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);

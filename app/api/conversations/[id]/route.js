import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });

        return NextResponse.json({
            ...conversation.toObject(),
            id: conversation._id.toString(),
            messages: messages.map(m => ({ ...m.toObject(), id: m.id || m._id.toString() }))
        });
    } catch (error) {
        console.error('Fetch conversation detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch conversation details' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        await Conversation.findByIdAndDelete(id);
        await Message.deleteMany({ conversationId: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete conversation error:', error);
        return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { title } = await req.json();

        const conversation = await Conversation.findByIdAndUpdate(
            id,
            { title },
            { new: true }
        );

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, conversation });
    } catch (error) {
        console.error('Update conversation error:', error);
        return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
    }
}

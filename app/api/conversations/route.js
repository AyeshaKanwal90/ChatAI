import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

export async function GET() {
    try {
        await dbConnect();
        // Sort by lastMessageAt or updatedAt desc
        const conversations = await Conversation.find({}).sort({ updatedAt: -1 });

        const formattedConversations = conversations.map(conv => ({
            ...conv.toObject(),
            id: conv._id.toString(),
            _id: undefined
        }));

        return NextResponse.json(formattedConversations);
    } catch (error) {
        console.error('Fetch conversations error:', error);
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        const conversation = await Conversation.create({
            title: body.title || 'New Chat',
        });
        return NextResponse.json({ ...conversation.toObject(), id: conversation._id.toString() });
    } catch (error) {
        console.error('Create conversation error:', error);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await dbConnect();
        // Clear both collections
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Clear chats error:', error);
        return NextResponse.json({ error: 'Failed to clear chats' }, { status: 500 });
    }
}

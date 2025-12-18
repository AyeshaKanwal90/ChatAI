import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { after } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

// Vercel Hobby plan limit is 10s. For Pro, it's more.
// We remove maxDuration because Hobby doesn't support setting it above 10.
export async function POST(req) {
    const { messages, chatId, saveUserMessage = true, assistantMessageId } = await req.json();

    // Get the last message (user's message)
    const lastMessage = messages[messages.length - 1];

    try {
        await dbConnect();

        let conversation;
        if (chatId) {
            conversation = await Conversation.findById(chatId).catch(() => null);
        }

        // Create new conversation if none exists (must do this before stream to get ID)
        if (!conversation) {
            conversation = await Conversation.create({
                title: lastMessage.content.slice(0, 30) + (lastMessage.content.length > 30 ? '...' : ''),
            });
        }

        // Generate Stream IMMEDIATELY
        const result = streamText({
            model: openai('gpt-4o-mini'),
            messages,
        });

        // Use 'after' to handle DB operations in the background
        after(async () => {
            try {
                await dbConnect();

                // 1. Save User Message
                if (saveUserMessage) {
                    await Message.create({
                        conversationId: conversation._id,
                        role: 'user',
                        content: lastMessage.content,
                        id: lastMessage.id,
                        createdAt: new Date(),
                    });

                    await Conversation.findByIdAndUpdate(conversation._id, {
                        $inc: { messageCount: 1 },
                        lastMessageAt: new Date()
                    });
                }

                // 2. Wait for stream to finish and save assistant message
                const { text } = await result;

                // Check if updating an existing message (regeneration)
                if (assistantMessageId) {
                    const existingMsg = await Message.findOne({
                        conversationId: conversation._id,
                        id: assistantMessageId
                    });

                    if (existingMsg) {
                        existingMsg.content = text;
                        existingMsg.createdAt = new Date();
                        await existingMsg.save();
                        return;
                    }
                }

                // Create new assistant message
                await Message.create({
                    conversationId: conversation._id,
                    role: 'assistant',
                    content: text,
                    id: assistantMessageId,
                    createdAt: new Date(),
                });

                // Update conversation metadata
                await Conversation.findByIdAndUpdate(conversation._id, {
                    $inc: { messageCount: 1 },
                    lastMessageAt: new Date(),
                    updatedAt: new Date()
                });
            } catch (dbError) {
                console.error("Background DB error:", dbError);
            }
        });

        return result.toTextStreamResponse({
            headers: {
                'x-chat-id': conversation._id.toString()
            }
        });
    } catch (error) {
        console.error("Error in chat route:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

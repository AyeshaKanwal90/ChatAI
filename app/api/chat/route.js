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

    const lastMessage = messages[messages.length - 1];

    try {
        await dbConnect();
        console.log("Connected to MongoDB for chat save");

        let conversation;
        if (chatId) {
            conversation = await Conversation.findById(chatId).catch(() => null);
        }

        // 1. Create new conversation if none exists (SYNC)
        if (!conversation) {
            conversation = await Conversation.create({
                title: lastMessage.content.slice(0, 30) + (lastMessage.content.length > 30 ? '...' : ''),
            });
            console.log("Created new conversation:", conversation._id);
        }

        // 2. Save User Message (SYNC)
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
                lastMessageAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Saved user message for conversation:", conversation._id);
        }

        // 3. Generate Stream
        const result = streamText({
            model: openai('gpt-4o-mini'),
            messages,
        });

        // 4. Save Assistant Message (ASYNC / Background)
        after(async () => {
            try {
                // Ensure helper is called in background context if needed
                await dbConnect();

                const { text } = await result;

                if (assistantMessageId) {
                    const existingMsg = await Message.findOne({
                        conversationId: conversation._id,
                        id: assistantMessageId
                    });

                    if (existingMsg) {
                        existingMsg.content = text;
                        existingMsg.createdAt = new Date();
                        await existingMsg.save();
                        console.log("Updated assistant message:", assistantMessageId);
                        return;
                    }
                }

                await Message.create({
                    conversationId: conversation._id,
                    role: 'assistant',
                    content: text,
                    id: assistantMessageId,
                    createdAt: new Date(),
                });

                await Conversation.findByIdAndUpdate(conversation._id, {
                    $inc: { messageCount: 1 },
                    lastMessageAt: new Date(),
                    updatedAt: new Date()
                });
                console.log("Saved assistant message for conversation:", conversation._id);
            } catch (dbError) {
                console.error("Background DB error during assistant save:", dbError);
            }
        });

        return result.toTextStreamResponse({
            headers: {
                'x-chat-id': conversation._id.toString()
            }
        });
    } catch (error) {
        console.error("Critical error in chat route:", error);
        return new Response(JSON.stringify({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

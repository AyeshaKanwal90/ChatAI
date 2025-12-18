import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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

        // Create new conversation if none exists
        if (!conversation) {
            conversation = await Conversation.create({
                title: lastMessage.content.slice(0, 30) + (lastMessage.content.length > 30 ? '...' : ''),
            });
        }

        // Save User Message
        if (saveUserMessage) {
            await Message.create({
                conversationId: conversation._id,
                role: 'user',
                content: lastMessage.content,
                id: lastMessage.id, // Client-side ID
                createdAt: new Date(),
            });

            // Increment message count on conversation
            await Conversation.findByIdAndUpdate(conversation._id, {
                $inc: { messageCount: 1 },
                lastMessageAt: new Date()
            });
        }

        // Generate Stream
        const result = streamText({
            model: openai('gpt-4o-mini'),
            messages,
            onFinish: async (completion) => {
                await dbConnect();

                // Check if updating an existing message (regeneration)
                if (assistantMessageId) {
                    const existingMsg = await Message.findOne({
                        conversationId: conversation._id,
                        id: assistantMessageId
                    });

                    if (existingMsg) {
                        existingMsg.content = completion.text;
                        existingMsg.createdAt = new Date();
                        await existingMsg.save();
                        return;
                    }
                }

                // Create new assistant message
                await Message.create({
                    conversationId: conversation._id,
                    role: 'assistant',
                    content: completion.text,
                    id: assistantMessageId,
                    createdAt: new Date(),
                });

                // Update conversation metadata
                await Conversation.findByIdAndUpdate(conversation._id, {
                    $inc: { messageCount: 1 },
                    lastMessageAt: new Date(),
                    updatedAt: new Date()
                });
            },
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

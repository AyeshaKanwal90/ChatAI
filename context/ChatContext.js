'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]); // This will now hold metadata only
    const [currentMessages, setCurrentMessages] = useState([]); // This hold messages for the active chat
    const [currentChatId, setCurrentChatId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatResetTrigger, setChatResetTrigger] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [wasIdUpgraded, setWasIdUpgraded] = useState(false);

    // Fetch conversations from DB on mount
    useEffect(() => {
        fetchConversations();
    }, []);

    // Fetch messages when currentChatId changes
    useEffect(() => {
        if (currentChatId) {
            // If it's a real MongoDB ID (24 chars), fetch from API
            if (currentChatId.length === 24) {
                if (wasIdUpgraded) {
                    // This was an upgrade from local temp ID to real ID
                    // We already have the messages in state, so don't fetch (avoid race condition)
                    setWasIdUpgraded(false);
                    return;
                }
                fetchChatDetails(currentChatId);
            }
        } else {
            setCurrentMessages([]);
            setWasIdUpgraded(false);
        }
    }, [currentChatId]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/conversations');
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        }
    };

    const fetchChatDetails = async (id) => {
        try {
            const res = await fetch(`/api/conversations/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCurrentMessages(data.messages || []);
                // If the metadata in sidebar is missing title or other info, we could update it here
            }
        } catch (error) {
            console.error('Failed to fetch chat details:', error);
        }
    };

    const createNewChat = () => {
        setCurrentChatId(null);
        setSearchQuery('');
        setCurrentMessages([]);
        setChatResetTrigger(prev => prev + 1);
    };

    const renameChat = async (chatId, newTitle) => {
        setConversations(prev => prev.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
        ));

        try {
            await fetch(`/api/conversations/${chatId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
        } catch (error) {
            console.error('Failed to rename chat:', error);
            fetchConversations();
        }
    };

    const deleteChat = async (chatId) => {
        setConversations(prev => {
            const newChats = prev.filter(c => c.id !== chatId);
            if (currentChatId === chatId) {
                setCurrentChatId(null);
                setCurrentMessages([]);
            }
            return newChats;
        });

        try {
            await fetch(`/api/conversations/${chatId}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete chat:', error);
            fetchConversations();
        }
    };

    const clearAllChats = async () => {
        setConversations([]);
        setCurrentChatId(null);
        setCurrentMessages([]);

        try {
            await fetch('/api/conversations', { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to clear chats:', error);
            fetchConversations();
        }
    };

    const streamResponse = async (chatId, messagesPayload, assistantMsgId, options = {}) => {
        setIsLoading(true);
        try {
            const isTempId = !isNaN(chatId) && chatId.length < 20;
            const payloadChatId = isTempId ? undefined : chatId;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messagesPayload,
                    chatId: payloadChatId,
                    assistantMessageId: assistantMsgId,
                    ...options
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Server error: ${response.status} ${errText}`);
            }

            if (!response.body) throw new Error('No response body');

            const serverChatId = response.headers.get('x-chat-id');

            if (isTempId && serverChatId) {
                setConversations(prev => prev.map(chat => {
                    if (chat.id === chatId) {
                        return { ...chat, id: serverChatId };
                    }
                    return chat;
                }));
                setWasIdUpgraded(true);
                setCurrentChatId(serverChatId);
                chatId = serverChatId;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                accumulatedContent += text;

                setCurrentMessages(prev => prev.map(m =>
                    m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m
                ));
            }

        } catch (error) {
            console.error('Streaming error:', error);
            setCurrentMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: m.content + '\n[Error generating response]' } : m
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const addMessageToCurrentChat = async (role, content, activeChatId = currentChatId) => {
        if (!content.trim()) return;

        let chatId = activeChatId;
        const userMsgId = Date.now().toString();
        const userMsg = { id: userMsgId, role, content, createdAt: new Date().toISOString() };

        if (!chatId) {
            const tempId = Date.now().toString();
            const newTitle = content.slice(0, 30) + (content.length > 30 ? '...' : '');

            const newChat = {
                id: tempId,
                title: newTitle,
                createdAt: new Date().toISOString(),
            };

            setConversations(prev => [newChat, ...prev]);
            setCurrentChatId(tempId);
            setCurrentMessages([userMsg]);
            chatId = tempId;
        } else {
            setCurrentMessages(prev => [...prev, userMsg]);
        }

        if (role === 'user') {
            const assistantMsgId = (Date.now() + 1).toString();
            const assistantMsg = {
                id: assistantMsgId,
                role: 'assistant',
                content: '',
                createdAt: new Date().toISOString()
            };

            setCurrentMessages(prev => [...prev, assistantMsg]);

            // Full Payload
            const messagesPayload = [...currentMessages, userMsg];

            await streamResponse(chatId, messagesPayload, assistantMsgId);
        }
    };

    const regenerateChatResponse = async (chatId, messageId) => {
        const msgIndex = currentMessages.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return;

        const messageToRegenerate = currentMessages[msgIndex];
        if (messageToRegenerate.role !== 'assistant') return;

        const historyToUse = currentMessages.slice(0, msgIndex);

        setCurrentMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, content: '' } : m
        ));

        await streamResponse(chatId, historyToUse, messageId, { saveUserMessage: false });
    };

    const updateMessageInCurrentChat = (msgId, newContent) => {
        setCurrentMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, content: newContent } : m
        ));
    };

    const updateMessageMetadata = (chatId, msgId, metadata) => {
        setCurrentMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, ...metadata } : m
        ));
    };

    const deleteMessage = (chatId, msgId) => {
        setCurrentMessages(prev => prev.filter(m => m.id !== msgId));
    };

    const filteredConversations = conversations.filter(c =>
        (c.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeChat = conversations.find(c => c.id === currentChatId);

    return (
        <ChatContext.Provider value={{
            conversations: filteredConversations,
            allConversationsCount: conversations.length,
            currentMessages, // Exposed new state
            currentChatId,
            setCurrentChatId,
            activeChat,
            createNewChat,
            deleteChat,
            clearAllChats,
            addMessageToCurrentChat,
            updateMessageInCurrentChat,
            updateMessageMetadata,
            deleteMessage,
            searchQuery,
            setSearchQuery,
            chatResetTrigger,
            renameChat,
            regenerateChatResponse,
            isLoading
        }}>
            {children}
        </ChatContext.Provider>
    );
};

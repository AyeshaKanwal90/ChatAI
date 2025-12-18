'use client';
import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Chip, Stack, Tooltip } from '@mui/material';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton } from '@mui/material';



import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import { useChat } from '@/context/ChatContext';

const ChatContainer = ({ onMenuClick, isSidebarOpen, setIsSidebarOpen }) => {
    const { activeChat, currentMessages, addMessageToCurrentChat, currentChatId, deleteMessage, chatResetTrigger, regenerateChatResponse, isLoading } = useChat();
    const messagesEndRef = React.useRef(null);

    const handleRegenerate = async (messageId = null) => {
        if (currentMessages.length === 0) return;

        if (messageId) {
            await regenerateChatResponse(currentChatId, messageId);
        } else {
            const lastMsg = currentMessages[currentMessages.length - 1];
            if (lastMsg.role === 'assistant') {
                await regenerateChatResponse(currentChatId, lastMsg.id);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [currentMessages, isLoading]);

    const handleSend = async (text) => {
        await addMessageToCurrentChat('user', text);
    };


    const messages = currentMessages;


    const [suggestion, setSuggestion] = useState("");

    const suggestions = [
        "What are you working on?",
        "What's on your mind today?",
        "Ready when you are.",
        "Where should we begin?"
    ];

    React.useEffect(() => {
        const random = suggestions[Math.floor(Math.random() * suggestions.length)];
        setSuggestion(random);
    }, [currentChatId, chatResetTrigger]);

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {/* Mobile Header with Hamburger */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, p: 2, alignItems: 'center' }}>
                <IconButton onClick={onMenuClick} edge="start" sx={{ mr: 2 }}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">CHAT A.I+</Typography>
            </Box>

            {/* Desktop Open Sidebar Button */}
            {!isSidebarOpen && (
                <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                    <Tooltip title="Open Sidebar">
                        <IconButton
                            onClick={() => setIsSidebarOpen(true)}
                            sx={{
                                bgcolor: 'white',
                                border: '1px solid rgba(0,0,0,0.08)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        >
                            <ViewSidebarOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            <Box
                sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#5D5CDE',
                    color: 'white',
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                    py: 4,
                    width: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    boxShadow: '-4px 0 10px rgba(0,0,0,0.1)',
                    zIndex: 10
                }}
            >
                <Typography
                    sx={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontWeight: 600,
                        letterSpacing: 1,
                        transform: 'rotate(180deg)'
                    }}
                >
                    Upgrade to Pro
                </Typography>
                <AutoAwesomeIcon fontSize="small" />
            </Box>

            {/* Messages Area */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                px: 2,
                pt: 4,
                maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
            }} className="no-scrollbar">
                <Container maxWidth="md">
                    {messages.length === 0 && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '60vh',
                            gap: 3
                        }}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(93, 92, 222, 0.1)', borderRadius: '50%', mb: 2 }}>
                                <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                            </Box>
                            <Typography variant="h5" fontWeight="600" color="text.primary">
                                {suggestion}
                            </Typography>
                        </Box>
                    )}
                    {messages.map((msg, index) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isLast={index === messages.length - 1}
                            onRegenerate={handleRegenerate}
                            isLoading={isLoading}
                        />
                    ))}
                    {isLoading && (!messages.length || messages[messages.length - 1].role !== 'assistant' || messages[messages.length - 1].content.length === 0) && (
                        <Box sx={{ display: 'flex', ml: '52px', mb: 4, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                Thinking...
                            </Typography>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Container>
            </Box>

            {/* Input Area */}
            <Container maxWidth="md">
                <MessageInput onSend={handleSend} />
            </Container>
        </Box>
    );
};

export default ChatContainer;

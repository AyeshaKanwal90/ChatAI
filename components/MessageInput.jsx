'use client';
import React, { useState } from 'react';
import { Box, Paper, InputBase, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const MessageInput = ({ onSend }) => {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ p: 2, pb: 3, position: 'relative' }}>
            <Paper
                elevation={3}
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '56px',
                    width: '80%',
                    ml: '10%',
                    borderRadius: '30px',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                }}
            >
                <IconButton sx={{ p: '10px' }} aria-label="menu">
                    <img src="/brain-default.png" alt="Brain" style={{ width: 35, height: 35 }} />
                </IconButton>
                <InputBase
                    sx={{ flex: 1 }}
                    placeholder="What's in your mind?..."
                    multiline
                    maxRows={4}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <IconButton
                    color="primary"
                    sx={{ p: '10px', bgcolor: 'primary.main', color: 'white', mr: 0.5, '&:hover': { bgcolor: 'primary.dark' } }}
                    onClick={handleSend}
                >
                    <SendIcon />
                </IconButton>
            </Paper>
        </Box>
    );
};

export default MessageInput;

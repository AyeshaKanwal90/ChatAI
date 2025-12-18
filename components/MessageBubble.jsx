'use client';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    Stack,
    Button,
    TextField,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Paper
} from '@mui/material';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';


import { useChat } from '@/context/ChatContext';

const MessageBubble = ({ message, isLast, onRegenerate, isLoading }) => {
    const isUser = message.role === 'user';
    const { updateMessageInCurrentChat, updateMessageMetadata, deleteMessage, currentChatId } = useChat();
    const [isEditing, setIsEditing] = useState(false);

    // Hide actions only if this is the last message and AI is currently thinking/streaming
    const showActions = !(isLast && isLoading) && !isUser;
    const [editContent, setEditContent] = useState(message.content);
    const [isCopied, setIsCopied] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        handleMenuClose();
    };

    const handleEditStart = () => {
        setEditContent(message.content);
        setIsEditing(true);
    };

    const handleEditSave = () => {
        updateMessageInCurrentChat(message.id, editContent);
        setIsEditing(false);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setEditContent(message.content);
    };

    const handleLike = () => {
        const newRating = message.rating === 'liked' ? null : 'liked';
        updateMessageMetadata(currentChatId, message.id, { rating: newRating });
    };

    const handleDislike = () => {
        const newRating = message.rating === 'disliked' ? null : 'disliked';
        updateMessageMetadata(currentChatId, message.id, { rating: newRating });
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        deleteMessage(currentChatId, message.id);
        handleMenuClose();
    };


    if (isUser) {
        return (
            <Box sx={{ mb: 4 }}>
                {/* User row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Avatar
                        src="/static/images/avatar/1.jpg"
                        sx={{ width: 36, height: 36 }}
                    />

                    {isEditing ? (
                        <Box sx={{ flexGrow: 1 }}>
                            <TextField
                                fullWidth
                                multiline
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                sx={{ bgcolor: 'white' }}
                            />
                            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                <IconButton size="small" onClick={handleEditSave} sx={{ color: 'success.main' }}><CheckIcon /></IconButton>
                                <IconButton size="small" onClick={handleEditCancel} sx={{ color: 'error.main' }}><CloseIcon /></IconButton>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography
                                variant="body1"
                                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                            >
                                {message.content}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, opacity: 0.7, ml: 'auto' }}>
                                <IconButton size="small" onClick={handleEditStart} sx={{ p: 0.5 }}>
                                    <EditOutlinedIcon fontSize="small" sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton size="small" onClick={handleCopy} sx={{ p: 0.5 }}>
                                    {isCopied ? <CheckIcon fontSize="small" sx={{ fontSize: 16, color: 'success.main' }} /> : <ContentCopyIcon fontSize="small" sx={{ fontSize: 16 }} />}
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }


    return (
        <Box sx={{ mb: 4, ml: '52px' }}>
            {/* AI Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.7 }}>
                <Typography variant="caption" fontWeight={600} color="primary.main" fontStyle={'italic'}>CHAT A.I +</Typography>
                <ArrowDownwardIcon fontSize="small" sx={{ fontSize: 16, color: 'primary.main', cursor: 'pointer' }} />
            </Box>


            <Typography
                variant="body1"
                sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6
                }}
            >
                {message.content}
            </Typography>


            {showActions && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 4
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: 'transparent',
                            gap: 2,

                        }}
                    >

                        <Paper
                            elevation={0}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: 'white',
                                borderRadius: 6,
                                borderColor: 'divider',
                                overflow: 'hidden',
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={handleLike}
                                sx={{ borderRadius: 0 }}
                            >
                                {message.rating === 'liked' ? (
                                    <ThumbUpOffAltIcon fontSize="small" sx={{ color: 'primary.main' }} />
                                ) : (
                                    <ThumbUpOffAltIcon fontSize="small" />
                                )}
                            </IconButton>

                            <Divider orientation="vertical" flexItem />

                            <IconButton
                                size="small"
                                onClick={handleDislike}
                                sx={{ borderRadius: 0 }}
                            >
                                {message.rating === 'disliked' ? (
                                    <ThumbDownOffAltIcon fontSize="small" sx={{ color: 'error.main' }} />
                                ) : (
                                    <ThumbDownOffAltIcon fontSize="small" />
                                )}
                            </IconButton>

                            <Divider orientation="vertical" flexItem />

                            <IconButton
                                size="small"
                                onClick={handleCopy}
                                sx={{ borderRadius: 0 }}
                            >
                                {isCopied ? (
                                    <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
                                ) : (
                                    <ContentCopyIcon fontSize="small" />
                                )}
                            </IconButton>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                bgcolor: 'white',
                                borderRadius: '50%',
                                borderColor: 'divider'
                            }}
                        >
                            <IconButton size="small" onClick={handleMenuClick}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Paper>
                    </Paper>


                    {/* More Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleCopy}>
                            <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Copy</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDelete}>
                            <ListItemIcon><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Delete</ListItemText>
                        </MenuItem>
                    </Menu>


                    {showActions && (
                        <Button
                            startIcon={<RefreshIcon />}
                            size="small"
                            onClick={() => onRegenerate(message.id)}
                            sx={{
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                color: 'text.secondary',
                                bgcolor: 'white',
                                borderRadius: 4,
                                px: 2
                            }}
                        >
                            Regenerate
                        </Button>
                    )}
                </Box>
            )}
            {(isUser || !showActions) && <Divider sx={{ my: 4 }} />}
        </Box>

    );
};
export default MessageBubble;


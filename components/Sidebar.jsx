'use client';
import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Avatar, IconButton, Drawer, InputBase, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Tooltip } from '@mui/material';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const DRAWER_WIDTH = 300;
const MAIN_BG_COLOR = '#f0f4f9';

import { useChat } from '@/context/ChatContext';

const SidebarContent = ({ onClose, isMobile, isSidebarOpen, setIsSidebarOpen }) => {
    const {
        conversations,
        currentChatId,
        setCurrentChatId,
        createNewChat,
        deleteChat,
        searchQuery,
        setSearchQuery,
        renameChat,
        clearAllChats
    } = useChat();

    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [editingChatId, setEditingChatId] = React.useState(null);
    const [editTitle, setEditTitle] = React.useState('');
    const [openClearDialog, setOpenClearDialog] = React.useState(false);

    const handleSelectChat = (id) => {
        if (editingChatId) return;
        setCurrentChatId(id);
        if (isMobile && onClose) onClose();
    };

    const handleEditStart = (e, chat) => {
        e.stopPropagation();
        setEditingChatId(chat.id);
        setEditTitle(chat.title);
    };

    const handleRenameSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (editTitle.trim()) {
            renameChat(editingChatId, editTitle.trim());
        }
        setEditingChatId(null);
        setEditTitle('');
    };

    const handleRenameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRenameSubmit(e);
        } else if (e.key === 'Escape') {
            e.stopPropagation();
            setEditingChatId(null);
        }
    };

    const handleDeleteClick = (e, chatId) => {
        e.stopPropagation();
        deleteChat(chatId);
    };

    const handleClearAllClick = () => {
        setOpenClearDialog(true);
    };

    const handleConfirmClear = () => {
        clearAllChats();
        setOpenClearDialog(false);
        if (isMobile && onClose) onClose();
    };

    const handleCancelClear = () => {
        setOpenClearDialog(false);
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100% - 20px)',
            mt: '10px',
            mb: '10px',
            mr: 0,
            bgcolor: 'white',
            borderRadius: '28px',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Header */}
            <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, fontSize: '1.2rem' }}>
                        CHAT A.I+
                    </Typography>
                    {isMobile ? (
                        <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    ) : (
                        <Tooltip title="Close Sidebar">
                            <IconButton onClick={() => setIsSidebarOpen(false)}>
                                <ViewSidebarOutlinedIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, height: 50 }}>
                    {!isSearchOpen ? (
                        <>
                            <Box
                                component="img"
                                src="/newchat-bar.png"
                                alt="New Chat"
                                onClick={createNewChat}
                                sx={{
                                    height: '100%',
                                    width: '100%',
                                    objectFit: 'contain',
                                    cursor: 'pointer',
                                    flexGrow: 1,
                                    maxWidth: 'calc(100% - 60px)'
                                }}
                            />
                            <Box
                                component="img"
                                src="/search-circle.png"
                                alt="Search"
                                onClick={() => setIsSearchOpen(true)}
                                sx={{
                                    height: '100%',
                                    width: 'auto',
                                    cursor: 'pointer'
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <Box
                                component="img"
                                src="/newchat-circle.png"
                                alt="New Chat"
                                onClick={() => {
                                    createNewChat();
                                    setIsSearchOpen(false);
                                }}
                                sx={{
                                    height: '100%',
                                    width: 'auto',
                                    cursor: 'pointer'
                                }}
                            />
                            <Box sx={{
                                flexGrow: 1,
                                bgcolor: '#f0f4f9',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                px: 2
                            }}>
                                <InputBase
                                    placeholder="Search..."
                                    fullWidth
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    sx={{ fontSize: '0.95rem' }}
                                />
                                <IconButton size="small" onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </>
                    )}
                </Box>



            </Box>


            <List sx={{
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: 0,
                py: 0,
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',  /* IE and Edge */
                scrollbarWidth: 'none',  /* Firefox */
                maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
            }}>
                {(() => {
                    const getSafeTime = (dateStr) => {
                        if (!dateStr) return 0;
                        const time = new Date(dateStr).getTime();
                        return isNaN(time) ? 0 : time;
                    };

                    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                    const recentChats = conversations.filter(c => {
                        const createdAt = getSafeTime(c.createdAt);
                        return !c.createdAt || createdAt > sevenDaysAgo;
                    });
                    const olderChats = conversations.filter(c => {
                        const createdAt = getSafeTime(c.createdAt);
                        return c.createdAt && createdAt <= sevenDaysAgo;
                    });

                    const renderChats = (chats) => chats.map((chat) => {
                        const isSelected = chat.id === currentChatId;
                        return (
                            <ListItem key={chat.id} disablePadding sx={{ mb: 0.5, position: 'relative' }}>
                                <ListItemButton
                                    onClick={() => handleSelectChat(chat.id)}
                                    sx={{
                                        py: 1.5,
                                        pl: 3,
                                        transition: 'all 0.2s',
                                        ...(isSelected ? {
                                            bgcolor: MAIN_BG_COLOR,
                                            color: '#5D5CDE',
                                            mx: 0,
                                            borderTopLeftRadius: '0px',
                                            borderBottomLeftRadius: '0px',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: '-20px',
                                                right: 0,
                                                width: '20px',
                                                height: '20px',
                                                bgcolor: 'transparent',
                                                borderBottomRightRadius: '20px',
                                                boxShadow: `10px 10px 0 10px ${MAIN_BG_COLOR}`,
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                bottom: '-20px',
                                                right: 0,
                                                width: '20px',
                                                height: '20px',
                                                bgcolor: 'transparent',
                                                borderTopRightRadius: '20px',
                                                boxShadow: `10px -10px 0 10px ${MAIN_BG_COLOR}`,
                                            }
                                        } : {
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                                        })
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 35 }}>
                                        <ChatBubbleOutlineIcon sx={{ fontSize: 20, color: isSelected ? '#5D5CDE' : 'text.secondary' }} />
                                    </ListItemIcon>
                                    {editingChatId === chat.id ? (
                                        <InputBase
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onBlur={handleRenameSubmit}
                                            onKeyDown={handleRenameKeyDown}
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{
                                                flexGrow: 1,
                                                fontFamily: 'inherit',
                                                fontSize: '0.875rem',
                                                fontWeight: 700,
                                                color: '#5D5CDE',
                                                mr: 2
                                            }}
                                        />
                                    ) : (
                                        <ListItemText
                                            primary={chat.title}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontWeight: isSelected ? 700 : 500,
                                                noWrap: true
                                            }}
                                        />
                                    )}
                                    {isSelected && !editingChatId && (
                                        <Box sx={{ display: 'flex', gap: 0.5, mr: 3 }}>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleDeleteClick(e, chat.id)}
                                                sx={{ p: 0.5, minWidth: 0, '&:hover': { color: 'error.main' } }}
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleEditStart(e, chat)}
                                                sx={{ p: 0.5, minWidth: 0, '&:hover': { color: 'primary.main' } }}
                                            >
                                                <EditOutlinedIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                                            </IconButton>
                                        </Box>
                                    )}
                                </ListItemButton>

                                {isSelected && (
                                    <Box sx={{
                                        position: 'absolute',
                                        right: -14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                        pointerEvents: 'none'
                                    }}>
                                        <img
                                            src="/dot-default.png"
                                            alt="active"
                                            style={{ width: 44, height: 44, objectFit: 'contain' }}
                                        />
                                    </Box>
                                )}
                            </ListItem>
                        );
                    });

                    return (
                        <>
                            {/* Recent Conversations */}
                            <Divider sx={{ my: 2, mx: -2 }} />
                            <Box sx={{ px: 2, pt: 1, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Your conversations</Typography>
                                <Typography
                                    variant="caption"
                                    onClick={handleClearAllClick}
                                    sx={{
                                        color: '#5D5CDE',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    Clear All
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2, mx: -2 }} />
                            {renderChats(recentChats)}


                            {/* Older Conversations */}
                            {olderChats.length > 0 && (
                                <>
                                    <Box sx={{ px: 3, pt: 3, pb: 1 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Last 7 Days</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 1, mx: 3 }} />
                                    {renderChats(olderChats)}
                                    <Divider sx={{ mt: 1, mx: 3 }} />
                                </>
                            )}
                        </>
                    );
                })()}
            </List>

            {/* Footer Items */}
            <Box sx={{ p: 2, mt: 'auto' }}>
                <ListItemButton sx={{
                    borderRadius: '50px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    mb: 1.5,
                    py: 1
                }}>
                    <ListItemIcon sx={{ minWidth: 32 }}><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Settings" primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
                </ListItemButton>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    pl: 1.5,
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '50px'
                }}>
                    <Avatar src="/avatar.jpg" sx={{ width: 32, height: 32, mr: 1.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Andrew Neilson</Typography>
                </Box>
            </Box>

            {/* Clear All Confirmation Dialog */}
            <Dialog
                open={openClearDialog}
                onClose={handleCancelClear}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    sx: { borderRadius: '20px', padding: 1 }
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 700 }}>
                    {"Clear all conversations?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This will permanently delete all your chat history. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCancelClear} sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmClear}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none'
                        }}
                        autoFocus
                    >
                        Delete All
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

const Sidebar = ({ mobileOpen, handleDrawerToggle, isSidebarOpen, setIsSidebarOpen }) => {
    return (
        <Box component="nav" sx={{
            width: { md: isSidebarOpen ? DRAWER_WIDTH : 0 },
            flexShrink: { md: 0 },
            bgcolor: MAIN_BG_COLOR,
            transition: 'width 0.3s ease',
            overflow: 'hidden'
        }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                }}
            >
                <SidebarContent onClose={handleDrawerToggle} isMobile={true} />
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        borderRight: 'none',
                        bgcolor: 'transparent',
                        display: isSidebarOpen ? 'block' : 'none',
                        overflow: 'hidden', // Prevent outer scrollbar
                        '&::-webkit-scrollbar': { display: 'none' }, // Double safety
                        scrollbarWidth: 'none',
                    },
                }}
                open
            >
                <SidebarContent
                    isMobile={false}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
            </Drawer>
        </Box>
    );
};

export default Sidebar;
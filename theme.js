'use client';
import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const theme = createTheme({
    typography: {
        fontFamily: inter.style.fontFamily,
        button: {
            textTransform: 'none',
        },
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#5D5CDE', 
        },
        background: {
            default: '#F3F5FA', 
            paper: '#FFFFFF', 
        },
        text: {
            primary: '#343541',
            secondary: '#6c757d',
        },
        action: {
            hover: 'rgba(0, 0, 0, 0.04)',
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        }
    },
});

export default theme;

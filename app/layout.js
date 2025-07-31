'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
import theme from './theme/theme';
import './globals.css';

// Styled components for the header and layout
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#000000', // Pure black background
  boxShadow: 'none',
  height: '90px', // Increased from 70px to 90px
  position: 'fixed',
  top: 0,
  width: '100%',
  zIndex: 1100,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(4), // Generous horizontal padding
  paddingRight: theme.spacing(4),
  height: '90px', // Increased from 70px to 90px
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    flex: 1,
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
    transition: 'opacity 0.3s ease',
  },
}));

const LogoImage = styled(Image)(({ theme }) => ({
  height: 'auto',
  maxHeight: '75px', // Increased from 60px to 75px
  width: 'auto',
  [theme.breakpoints.down('sm')]: {
    maxHeight: '65px', // Increased from 50px to 65px
  },
}));

const NavSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '20px', // Space between navigation links
  marginLeft: '40px', // Space from the logo
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const NavLink = styled(Button)(({ theme }) => ({
  color: '#ffffff', // White text
  textTransform: 'none', // Keep original casing
  fontWeight: 'bold', // Bold font weight
  fontSize: '1.1rem', // Slightly increased font size
  fontFamily: 'sans-serif',
  padding: theme.spacing(1, 2), // Standard padding
  position: 'relative',
  borderBottom: '2px solid #ffffff', // Fixed white underline
  borderRadius: 0,
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle hover background
    transition: 'background-color 0.3s ease',
  },
}));

const SignInButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1e1e1e', // Dark gray background
  color: '#ffffff', // Bold white text
  fontWeight: 'bold',
  borderRadius: '8px', // Slightly rounded corners
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#2c2c2c',
  },
}));

const GetStartedButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ffffff', // White background
  color: '#2c2c2c', // Bold black/dark gray text
  fontWeight: 'bold',
  borderRadius: '8px', // Rounded corners
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

const LayoutWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  overflow: 'hidden',
  paddingTop: '90px', // Increased from 70px to 90px to account for navbar height
}));

const MotionBox = styled(motion.div)(() => ({
  width: '100%',
  height: '100%',
  flex: 1,
}));

const MobileLogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2, 0),
}));

// Framer Motion animation settings
const slideAnimation = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-100%', opacity: 0 },
  transition: { duration: 0.5, ease: 'easeInOut' },
};

export default function RootLayout({ children }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigation handler
  const navigateTo = (path) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      router.push(path);
    }
    setMobileOpen(false); // Close the drawer on navigation
  };

  const navItems = [
    { label: 'About', path: '/About' },
    { label: 'TOS', path: 'https://docs.google.com/document/d/1uRIVq-5sjqlqClBLtHeM9BBjasEvHIWjmCABTgF-cTk/edit?tab=t.0#heading=h.hsmqdl49czwx' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LayoutWrapper>
            {/* Header */}
            <StyledAppBar position="fixed">
              <StyledToolbar>
                {/* Left Section - Logo + Navigation */}
                <LeftSection>
                  <LogoSection onClick={() => navigateTo('/')}>
                    <LogoImage
                      src="/serkyu-logo.png"
                      alt="Serkyu Logo"
                      width={200} // Increased from 150 to 200
                      height={75}  // Increased from 60 to 75
                      priority
                    />
                  </LogoSection>

                  {/* Navigation Links - 10px from logo */}
                  <NavSection>
                    {navItems.map((item) => (
                      <NavLink key={item.label} onClick={() => navigateTo(item.path)}>
                        {item.label}
                      </NavLink>
                    ))}
                  </NavSection>
                </LeftSection>

                {/* Right Section - Buttons */}
                <RightSection>
                  <SignInButton onClick={() => console.log('Sign in clicked')}>
                    Sign In
                  </SignInButton>
                  <GetStartedButton onClick={() => navigateTo('/')}>
                    Get Started
                  </GetStartedButton>
                </RightSection>

                {/* Mobile Navigation */}
                <IconButton
                  color="inherit"
                  edge="end"
                  onClick={handleDrawerToggle}
                  sx={{
                    display: { md: 'none' },
                    color: '#ffffff'
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </StyledToolbar>
            </StyledAppBar>

            {/* Mobile Drawer */}
            <Drawer
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              sx={{
                '& .MuiDrawer-paper': {
                  width: 280,
                  backgroundColor: '#000000',
                  color: '#ffffff',
                },
              }}
            >
              <Box sx={{ textAlign: 'center', pt: 2, pb: 2 }}>
                <MobileLogoContainer>
                  <LogoImage
                    src="/serkyu-logo.png"
                    alt="Serkyu Logo"
                    width={150} // Increased from 120 to 150
                    height={65}  // Increased from 50 to 65
                  />
                </MobileLogoContainer>
                <List>
                  {navItems.map((item) => (
                    <ListItem
                      button
                      key={item.label}
                      onClick={() => navigateTo(item.path)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        sx={{
                          color: '#ffffff',
                          textAlign: 'center',
                          '& .MuiTypography-root': {
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: '1.1rem'
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
                    <SignInButton onClick={() => console.log('Sign in clicked')}>
                      Sign In
                    </SignInButton>
                    <GetStartedButton onClick={() => navigateTo('/')}>
                      Get Started
                    </GetStartedButton>
                  </Box>
                </List>
              </Box>
            </Drawer>

            {/* Animated Page Transitions */}
            <AnimatePresence mode="wait">
              <MotionBox
                key={router.pathname} // Track the current page for transitions
                initial="initial"
                animate="animate"
                exit="exit"
                variants={slideAnimation}
              >
                {children}
              </MotionBox>
            </AnimatePresence>
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
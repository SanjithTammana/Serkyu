'use client';

import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

// Main container with periwinkle background and proper responsive behavior
const MainContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#aab0e5', // Periwinkle/lavender background
  minHeight: 'calc(100vh - 90px)', // Minimum height to fill screen
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2, 0),
  // On desktop/laptop - content fits without scrolling naturally
  // On mobile - allows scrolling if content exceeds viewport
}));

// Content container with responsive sizing
const ContentContainer = styled(Container)(({ theme }) => ({
  maxWidth: '800px',
  padding: theme.spacing(2, 4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  // Optimized spacing for desktop to fit in viewport
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 3),
    gap: theme.spacing(2.5),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 2),
    gap: theme.spacing(3),
    // More generous spacing on mobile for readability
  },
}));

// Responsive heading that scales appropriately
const MainHeading = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(2.2rem, 4vw, 2.8rem)', // Scales between 2.2rem and 2.8rem
  fontWeight: 800,
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  color: '#1a1a1a',
  textAlign: 'left',
  marginBottom: theme.spacing(1),
  lineHeight: 1.1,
  [theme.breakpoints.down('sm')]: {
    fontSize: 'clamp(2rem, 6vw, 2.5rem)',
    lineHeight: 1.2,
  },
}));

// Body text with responsive sizing
const BodyText = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', // Slightly scales with viewport
  fontWeight: 700,
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  color: '#1a1a1a',
  lineHeight: 1.5,
  marginBottom: theme.spacing(1.5),
  textAlign: 'left',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    marginBottom: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    lineHeight: 1.7,
    marginBottom: theme.spacing(2.5),
  },
}));

// Emphatic text with responsive sizing
const EmphaticText = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(1rem, 1.5vw, 1.1rem)',
  fontWeight: 700,
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  color: '#1a1a1a',
  textAlign: 'left',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: {
    fontSize: '1.2rem',
    marginBottom: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem',
    marginBottom: theme.spacing(2.5),
  },
}));

// Built by section with responsive sizing
const BuiltByText = styled(Typography)(({ theme }) => ({
  fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
  fontWeight: 700,
  fontFamily: 'sans-serif',
  fontStyle: 'normal',
  color: '#1a1a1a',
  textAlign: 'left',
  lineHeight: 1.4,
  margin: 0,
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
}));

const AboutPage = () => {
  return (
    <MainContainer>
      <ContentContainer>
        {/* Main Heading */}
        <MainHeading variant="h1">
          About Us
        </MainHeading>

        {/* Combined Paragraph */}
        <BodyText>
          Our mission is to reduce barriers to entry in engineering through innovative, 
          machine-learning-powered tools that make complex technical concepts accessible 
          to everyone. We believe that technology should empower creativity and learning, 
          not create additional obstacles. By combining cutting-edge artificial intelligence 
          with intuitive design, we're building solutions that adapt to each user's unique 
          learning style and pace. At the heart of our approach is human-centered support that complements our 
          technological capabilities. We understand that while AI can process information 
          and generate solutions at unprecedented speeds, the human element remains crucial 
          for understanding context, providing empathy, and ensuring that our tools serve 
          real-world needs. Our platform bridges the gap between advanced machine learning 
          and practical engineering education, making sophisticated concepts approachable 
          for learners at all levels.
        </BodyText>

        {/* Emphatic Statement */}
        <EmphaticText>
          Together, we're democratizing engineering education and fostering innovation.
        </EmphaticText>

        {/* Built By Section */}
        <BuiltByText>
          Built by: Arjun Addaypally, Krish Nair, Sanjith Tammana, 
          Nimalan Rajkumar, and Mourya Karukonda
        </BuiltByText>
      </ContentContainer>
    </MainContainer>
  );
};

export default AboutPage;
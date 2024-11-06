import React from 'react';
import { Box } from '@mui/material';

const TypingIndicator = () => {
    const dotStyle = {
        height: '20px',
        width: '20px',
        backgroundColor: '#FFF', // or any color you prefer
        borderRadius: '50%',
        display: 'inline-block',
        margin: '0 2px',
        animationName: 'pulse',
        animationDuration: '1.4s',
        animationIterationCount: 'infinite',
        animationFillMode: 'both'
    };

    const pulseKeyframes = `
        @keyframes pulse {
            0% { transform: scale(0.5); }
            50% { transform: scale(1); }
            100% { transform: scale(0.5); }
        }
    `;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'left', alignItems: 'left' }}>
            <style>{pulseKeyframes}</style>
            <span style={{ ...dotStyle, animationDelay: '0s' }}></span>
            <span style={{ ...dotStyle, animationDelay: '0.2s' }}></span>
            <span style={{ ...dotStyle, animationDelay: '0.4s' }}></span>
        </Box>
    );
};

export default TypingIndicator;
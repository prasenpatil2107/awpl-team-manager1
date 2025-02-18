import React from 'react';
import { Box, Typography } from '@mui/material';

interface DebugProps {
    data: any;
    label?: string;
}

const Debug: React.FC<DebugProps> = ({ data, label }) => {
    if (process.env.NODE_ENV === 'production') return null;

    return (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                Debug: {label || 'Data'}
            </Typography>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </Box>
    );
};

export default Debug; 
import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface ErrorMessageProps {
    error: string | string[];
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
    if (!error) return null;

    const errors = Array.isArray(error) ? error : [error];

    return (
        <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {errors.map((err, index) => (
                <div key={index}>{err}</div>
            ))}
        </Alert>
    );
};

export default ErrorMessage; 
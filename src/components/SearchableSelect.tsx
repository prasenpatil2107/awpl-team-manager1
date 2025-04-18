import React, { useState } from 'react';
import {
    TextField,
    Autocomplete,
    Box,
    Typography,
    Paper,
} from '@mui/material';

interface Option {
    id: number;
    label: string;
}

interface SearchableSelectProps {
    label: string;
    options: Option[];
    value: number | '';
    onChange: (value: number | '') => void;
    placeholder?: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    label,
    placeholder,
    error,
    helperText,
    required,
    disabled
}) => {
    const [inputValue, setInputValue] = useState('');
    
    // Find the selected option
    const selectedOption = options.find(opt => opt.id === value) || null;

    return (
        <Autocomplete
            value={selectedOption}
            onChange={(_, newValue) => {
                onChange(newValue ? newValue.id : '');
            }}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
            }}
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    error={error}
                    helperText={helperText}
                    required={required}
                />
            )}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    <Typography variant="body1">{option.label}</Typography>
                </Box>
            )}
            disabled={disabled}
            fullWidth
            disablePortal
            PaperComponent={({ children }) => (
                <Paper elevation={8} sx={{ maxHeight: 300 }}>
                    {children}
                </Paper>
            )}
        />
    );
};

export default SearchableSelect; 
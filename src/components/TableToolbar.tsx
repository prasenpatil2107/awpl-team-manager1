import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';

interface Filter {
    field: string;
    label: string;
    options: { value: string; label: string }[];
}

interface TableToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filters?: Filter[];
    activeFilters: Record<string, any>;
    onFilterChange: (field: string, value: any) => void;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
    searchTerm,
    onSearchChange,
    filters = [],
    activeFilters,
    onFilterChange,
}) => {
    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
                label="Search"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                sx={{ minWidth: 200 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={() => onSearchChange('')}>
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {filters.map((filter) => (
                <FormControl key={filter.field} sx={{ minWidth: 120 }}>
                    <InputLabel>{filter.label}</InputLabel>
                    <Select
                        value={activeFilters[filter.field] || ''}
                        onChange={(e) => onFilterChange(filter.field, e.target.value)}
                        label={filter.label}
                    >
                        <MenuItem value="">All</MenuItem>
                        {filter.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ))}
        </Box>
    );
};

export default TableToolbar; 
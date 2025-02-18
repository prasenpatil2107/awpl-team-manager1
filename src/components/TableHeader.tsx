import React from 'react';
import { TableCell, TableSortLabel } from '@mui/material';

interface TableHeaderProps {
    label: string;
    field: string;
    sortable?: boolean;
    sortConfig?: { key: string; direction: 'asc' | 'desc' };
    onSort?: (field: string) => void;
    align?: 'left' | 'right' | 'center';
}

const TableHeader: React.FC<TableHeaderProps> = ({
    label,
    field,
    sortable = true,
    sortConfig,
    onSort,
    align = 'left',
}) => {
    return (
        <TableCell align={align}>
            {sortable && onSort ? (
                <TableSortLabel
                    active={sortConfig?.key === field}
                    direction={sortConfig?.key === field ? sortConfig.direction : 'asc'}
                    onClick={() => onSort(field)}
                >
                    {label}
                </TableSortLabel>
            ) : (
                label
            )}
        </TableCell>
    );
};

export default TableHeader; 
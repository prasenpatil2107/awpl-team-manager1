import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
    key: string;
    direction: SortDirection;
}

interface TableFeaturesOptions {
    defaultSort?: {
        key: string;
        direction: 'asc' | 'desc';
    };
    defaultPageSize?: number;
}

export function useTableFeatures<T extends Record<string, any>>(data: T[] | undefined | null, options: TableFeaturesOptions = {}) {
    const [sortConfig, setSortConfig] = useState<TableFeaturesOptions['defaultSort']>(options.defaultSort);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(options.defaultPageSize || 10);

    const sortData = (items: T[]) => {
        if (!sortConfig) return items;

        return [...items].sort((a: any, b: any) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const filterData = (items: T[]) => {
        return items.filter(item => {
            // Search across all string and number fields
            const matchesSearch = Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Apply filters
            const matchesFilters = Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                return String((item as any)[key]).toLowerCase() === String(value).toLowerCase();
            });

            return matchesSearch && matchesFilters;
        });
    };

    const processedData = useMemo(() => {
        // Handle undefined or null data
        let result = Array.isArray(data) ? [...data] : [];
        result = filterData(result);
        result = sortData(result);
        return result;
    }, [data, sortConfig, searchTerm, filters]);

    const paginatedData = useMemo(() => {
        const start = page * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, page, pageSize]);

    const requestSort = (key: string) => {
        let direction: SortDirection = 'asc';
        if (sortConfig?.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return {
        items: paginatedData,
        totalItems: processedData.length,
        page,
        setPage,
        pageSize,
        setPageSize,
        requestSort,
        sortConfig,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
    };
} 
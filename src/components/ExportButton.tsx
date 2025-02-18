import React from 'react';
import { Button } from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';

interface ExportButtonProps {
    onExport: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
    return (
        <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={onExport}
        >
            Export
        </Button>
    );
};

export default ExportButton; 
// ActionCellRenderer.tsx
import React from 'react';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { Box } from '@mui/material';
import type { ICellRendererParams } from 'ag-grid-community';

interface ActionCellRendererProps extends ICellRendererParams {
  onEditClick?: (vendorId: number) => void;
}

export default function ActionCellRenderer(params: ActionCellRendererProps) {
  const vendorId = params.data?.vendor_id;

  const onEdit = () => {
    if (params.context?.onEditClick && vendorId) {
      params.context.onEditClick(vendorId);
    }
  };

  return (
    <Box style={{ display: 'flex', gap: '5px' }}>
      <IconButton onClick={onEdit} size="small" color="primary">
        <EditIcon />
      </IconButton>
    </Box>
  );
}
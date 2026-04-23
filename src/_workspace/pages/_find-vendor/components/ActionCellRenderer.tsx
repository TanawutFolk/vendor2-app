// ActionCellRenderer.tsx
import React from 'react';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import { Box } from '@mui/material';
import type { ICellRendererParams } from 'ag-grid-community';

interface ActionCellRendererProps extends ICellRendererParams {
  onEditClick?: (vendorId: number, data: any) => void;
  onRegisterClick?: (vendorId: number, data: any) => void;
}

export default function ActionCellRenderer(params: ActionCellRendererProps) {
  const vendorId = params.data?.vendor_id;
  const isAlreadyRegistered = params.data?.status_check === 'Registered';
  const isInProgress = params.data?.status_check === 'In Progress';

  const isCannotRegister = params.data?.status_check === 'Cannot Register';

  const onEdit = () => {
    // Permission check is done at parent level (SearchResult.tsx) via context
    if (params.context?.onEditClick && vendorId) {
      params.context.onEditClick(vendorId, params.data);
    }
  };

  const onRegister = () => {
    if (params.context?.onRegisterClick && vendorId) {
      params.context.onRegisterClick(vendorId, params.data);
    }
  };

  return (
    <Box style={{ display: 'flex', gap: '5px' }}>
      {!isAlreadyRegistered && !isInProgress && !isCannotRegister && (
        <IconButton onClick={onRegister} size="small" color="warning" title="Send Register Request">
          <ForwardToInboxIcon />
        </IconButton>
      )}
      <IconButton onClick={onEdit} size="small" color="primary" title="View Details">
        <VisibilityIcon />
      </IconButton>
    </Box>
  );
}

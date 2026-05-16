// ActionCellRenderer.tsx
import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import type { IconButtonProps } from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import { Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import type { ICellRendererParams } from 'ag-grid-community';
import { ToastMessageError } from '@/components/ToastMessage';

type VendorActionRow = {
  vendor_id?: number;
  status_check?: string;
  INUSE?: number;
  [key: string]: unknown;
};

interface ActionCellRendererProps extends ICellRendererParams<VendorActionRow> {
  onEditClick?: (vendorId: number, data: VendorActionRow) => void;
  onRegisterClick?: (vendorId: number, data: VendorActionRow) => void;
  onVendorEditClick?: (vendorId: number, data: VendorActionRow) => void;
  onVendorDeleteClick?: (vendorId: number, data: VendorActionRow) => void;
  canRegister?: (data: VendorActionRow) => boolean;
  registerDisabled?: (data: VendorActionRow) => boolean;
  registerColor?: IconButtonProps['color'];
  registerTitle?: string;
  showMoreActions?: boolean;
}

export default function ActionCellRenderer(params: ActionCellRendererProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const vendorId = params.data?.vendor_id;
  const isAlreadyRegistered = params.data?.status_check === 'Registered';
  const isInProgress = params.data?.status_check === 'In Progress';

  const isCannotRegister = params.data?.status_check === 'Cannot Register';
  const isActiveVendor = Number(params.data?.INUSE ?? 1) === 1;
  const showMoreActions = params.showMoreActions !== false;
  const canOpenMenu = showMoreActions && Boolean(vendorId);
  const canShowRegister = params.data
    ? params.canRegister?.(params.data) ?? (!isAlreadyRegistered && !isInProgress && !isCannotRegister)
    : false;
  const isRegisterDisabled = params.data ? params.registerDisabled?.(params.data) ?? false : false;

  const onEdit = (event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    const handler = params.onEditClick ?? params.context?.onEditClick;

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data);
    }
  };

  const onRegister = (event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation();
    const handler = params.onRegisterClick ?? params.context?.onRegisterClick;

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data);
    }
  };

  const onMenuOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const showActionUnavailableToast = (action: string, message?: string) => {
    ToastMessageError({
      title: 'Vendor Action',
      message: message || `Cannot open ${action}. Please check your permission or try again.`
    });
  };

  const onVendorEdit = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const handler = params.onVendorEditClick ?? params.context?.onVendorEditClick;

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data);
    } else {
      showActionUnavailableToast('Edit');
    }
    setAnchorEl(null);
  };

  const onVendorDelete = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const handler = params.onVendorDeleteClick ?? params.context?.onVendorDeleteClick;

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data);
    } else {
      showActionUnavailableToast('Delete');
    }
    setAnchorEl(null);
  };

  return (
    <Box
      style={{
        display: 'grid',
        gridTemplateColumns: showMoreActions ? '32px 32px 32px' : '32px 32px',
        columnGap: '5px',
        alignItems: 'center'
      }}
    >
      {canShowRegister ? (
        <Tooltip title={params.registerTitle ?? 'Send Register Request'}>
          <span style={{ display: 'flex', width: 32, height: 32 }}>
            <IconButton
              onClick={onRegister}
              size="small"
              color={params.registerColor ?? 'warning'}
              disabled={isRegisterDisabled}
            >
              <ForwardToInboxIcon />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Box component="span" sx={{ width: 32, height: 32 }} />
      )}
      <Tooltip title="View Details">
        <span style={{ display: 'flex', width: 32, height: 32 }}>
          <IconButton onClick={onEdit} size="small" color="primary">
            <VisibilityIcon />
          </IconButton>
        </span>
      </Tooltip>
      {showMoreActions && (
        canOpenMenu ? (
          <Tooltip title="More actions">
            <span style={{ display: 'flex', width: 32, height: 32 }}>
              <IconButton size="small" onClick={onMenuOpen}>
                <i className="tabler-dots-vertical" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Box component="span" sx={{ width: 32, height: 32 }} />
        )
      )}
      <Menu
        keepMounted
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        open={Boolean(anchorEl)}
      >
        <MenuItem onClick={onVendorEdit}>
          <ListItemIcon><i className="tabler-edit text-xl" /></ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        {isActiveVendor && <Divider />}
        {isActiveVendor && (
          <MenuItem onClick={onVendorDelete}>
            <ListItemIcon><i className="tabler-trash text-xl text-red-600" /></ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

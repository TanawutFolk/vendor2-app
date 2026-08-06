// ActionCellRenderer.tsx
import type { MouseEvent } from 'react'
import IconButton from '@mui/material/IconButton'
import VisibilityIcon from '@mui/icons-material/Visibility'
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox'
import { Box, Tooltip, Typography } from '@mui/material'
import OptionMenu from '@core/components/option-menu'
import { ToastMessageError } from '@/components/ToastMessage'
import type { OptionType } from '@core/components/option-menu/types'
import type { ActionCellRendererProps } from '@/_workspace/types/vendor/VendorTypes'
import { isVendorStatusMaster } from '@/_workspace/utils/vendorStatusIdentity'

export default function ActionCellRenderer(params: ActionCellRendererProps) {
  const vendorId = params.data?.VENDORS_ID
  const vendorStatusIds = params.vendorStatusIds ?? params.context?.vendorStatusIds
  const isAlreadyRegistered = isVendorStatusMaster(params.data, vendorStatusIds?.REGISTERED)
  const isInProgress = isVendorStatusMaster(params.data, vendorStatusIds?.IN_PROGRESS)
  const isCannotRegister = isVendorStatusMaster(params.data, vendorStatusIds?.CANNOT_REGISTER)
  const isActiveVendor = Number(params.data?.INUSE ?? 1) === 1
  const showMoreActions = params.showMoreActions !== false
  const canOpenMenu = showMoreActions && Boolean(vendorId)
  const canShowRegister = params.data
    ? (params.canRegister?.(params.data) ?? (!isAlreadyRegistered && !isInProgress && !isCannotRegister))
    : false
  const isRegisterDisabled = params.data ? (params.registerDisabled?.(params.data) ?? false) : false

  // Callers may restrict which vendors are editable (find-vendor allows only "Not Registered").
  // Defaults to editable so existing callers keep their behaviour.
  const canEditVendor = params.data ? (params.canEdit?.(params.data) ?? true) : false
  const editDisabledReason = params.editDisabledReason ?? 'Cannot edit this vendor.'

  // Only offer Delete when the caller actually wired a handler for it.
  const hasDeleteHandler = Boolean(params.onVendorDeleteClick ?? params.context?.onVendorDeleteClick)

  const onEdit = (event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    const handler = params.onEditClick ?? params.context?.onEditClick

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data)
    }
  }

  const onRegister = (event?: MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    const handler = params.onRegisterClick ?? params.context?.onRegisterClick

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data)
    }
  }

  const showActionUnavailableToast = (action: string, message?: string) => {
    ToastMessageError({
      title: 'Vendor Action',
      message: message || `Cannot open ${action}. Please check your permission or try again.`
    })
  }

  const onVendorEdit = () => {
    // Keep the menu item clickable for feedback, but never let a restricted vendor
    // reach the edit handler.
    if (!canEditVendor) {
      showActionUnavailableToast('Edit', editDisabledReason)
      return
    }

    const handler = params.onVendorEditClick ?? params.context?.onVendorEditClick

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data)
    } else {
      showActionUnavailableToast('Edit')
    }
  }

  const onVendorDelete = () => {
    const handler = params.onVendorDeleteClick ?? params.context?.onVendorDeleteClick

    if (handler && vendorId && params.data) {
      handler(vendorId, params.data)
    } else {
      showActionUnavailableToast('Delete')
    }
  }

  const menuOptions: OptionType[] = [
    {
      text: 'Edit',
      icon: 'tabler-edit text-xl',
      // Keep the action clickable so restricted vendors can explain the reason via Toast.
      // onVendorEdit still blocks the edit handler when canEditVendor is false.
      menuItemProps: { onClick: onVendorEdit, className: 'gap-2' }
    },
    ...(isActiveVendor && hasDeleteHandler
      ? ([
          { divider: true },
          {
            text: (
              <Typography variant='body2' color='error.main'>
                Delete
              </Typography>
            ),
            icon: 'tabler-trash text-xl text-red-600',
            menuItemProps: { onClick: onVendorDelete, className: 'gap-2' }
          }
        ] as OptionType[])
      : [])
  ]

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
              size='small'
              color={params.registerColor ?? 'warning'}
              disabled={isRegisterDisabled}
            >
              <ForwardToInboxIcon />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Box component='span' sx={{ width: 32, height: 32 }} />
      )}
      <Tooltip title='View Details'>
        <span style={{ display: 'flex', width: 32, height: 32 }}>
          <IconButton onClick={onEdit} size='small' color='primary'>
            <VisibilityIcon />
          </IconButton>
        </span>
      </Tooltip>
      {showMoreActions &&
        (canOpenMenu ? (
          // The cell clips overflow, so the menu has to be portaled out of the grid.
          <Box sx={{ display: 'flex' }} onClick={event => event.stopPropagation()}>
            <OptionMenu
              usePortal
              tooltipProps={{ title: 'More actions' }}
              options={menuOptions}
              // Let the menu size to its items rather than forcing a fixed width.
              paperProps={{ sx: { borderRadius: 1.5, '& .MuiMenuItem-root': { minHeight: 'auto' } } }}
            />
          </Box>
        ) : (
          <Box component='span' sx={{ width: 32, height: 32 }} />
        ))}
    </Box>
  )
}

import React from 'react'

import { DialogActions, Button, CircularProgress } from '@mui/material'
import type { VendorModalFooterActionsProps } from '@_workspace/types/_find-vendor/FindVendorTypes'



const VendorModalFooterActions = ({
    editingMode,
    loading,
    saving,
    onSaveClick,
    onClose,
}: VendorModalFooterActionsProps) => {
    return (
        <DialogActions
            sx={{ justifyContent: 'flex-start', p: 3, gap: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}
        >
            {editingMode === 'edit' && (
                <Button
                    onClick={onSaveClick}
                    variant="contained"
                    disabled={loading || saving}
                    startIcon={saving ? <CircularProgress size={16} /> : <i className='tabler-device-floppy' />}
                    sx={{ fontWeight: 700 }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            )}
            <Button
                onClick={onClose}
                disabled={saving}
                variant="tonal"
                color="secondary"
                sx={{ fontWeight: 700 }}
            >
                {editingMode === 'edit' ? 'Cancel' : 'Close'}
            </Button>
        </DialogActions>
    )
}

export default VendorModalFooterActions

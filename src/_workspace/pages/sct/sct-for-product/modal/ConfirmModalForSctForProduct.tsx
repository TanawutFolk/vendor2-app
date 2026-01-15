import type { ReactElement, Ref } from 'react'
import React, { forwardRef, useEffect } from 'react'

// ** MUI Imports

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import { Box, Slide, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import CustomTextField from '@/components/mui/TextField'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },

  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

const ConfirmModalForSctForProduct = ({
  show,
  onConfirmClick,
  onCloseClick,
  isLoading,
  isDelete,
  sctStatusProgressId,
  setValue
}: any) => {
  let imageConfirm

  if (isDelete) {
    imageConfirm = '/images/common/undraw_clean_up_re_504g.svg'
  } else {
    imageConfirm = '/images/common/undraw_notify_re_65on.svg'
  }

  useEffect(() => {
    // Reset cancel reason when modal is opened
    if (show) {
      setValue('cancelReason', '')
    }
  }, [show])

  return (
    <>
      <Dialog
        maxWidth='xs'
        fullWidth={true}
        open={show}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        TransitionComponent={Transition}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            onCloseClick
          }
        }}
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogContent>
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
            <image src={imageConfirm} height={120} width={150} alt='' />
          </Box>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant='h5'>Are You Sure ?</Typography>
            <Typography variant='h5' sx={{ mb: 3, color: 'text.secondary' }}>
              ยืนยัน การ{isDelete ? 'ลบ' : 'บันทึก'}ข้อมูลหรือไม่ ?
            </Typography>
          </Box>
          {sctStatusProgressId === 1 && (
            <CustomTextField
              className='w-full'
              label='Cancel Reason'
              onChange={e => {
                setValue('cancelReason', e.target.value)
              }}
            ></CustomTextField>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            borderTop: 'none'
          }}
        >
          <LoadingButton
            onClick={onConfirmClick}
            loading={isLoading}
            loadingIndicator={isDelete ? 'Deleting...' : 'Saving...'}
            variant='contained'
            color={isDelete ? 'error' : 'success'}
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            <span>Yes, {isDelete ? 'Delete' : 'Save'} !</span>
          </LoadingButton>
          <Button variant='tonal' color='secondary' onClick={onCloseClick} disabled={isLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfirmModalForSctForProduct

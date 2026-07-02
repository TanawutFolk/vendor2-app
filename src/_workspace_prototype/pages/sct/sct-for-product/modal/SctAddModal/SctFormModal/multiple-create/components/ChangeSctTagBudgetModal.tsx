import type { ReactElement, Ref } from 'react'
import React, { forwardRef } from 'react'

// ** MUI Imports

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import { Box, Slide, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },

  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

const ChangeSctTagBudgetModal = ({ show, onConfirmClick, onCloseClick, isLoading, isDelete }: any) => {
  let imageConfirm

  if (isDelete) {
    imageConfirm = '/images/common/undraw_clean_up_re_504g.svg'
  } else {
    imageConfirm = '/images/common/undraw_notify_re_65on.svg'
  }

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
            <Typography variant='h5'>การอัพเดทข้อมูล ?</Typography>
            <Typography variant='h5' sx={{ mb: 3, color: 'text.secondary' }}>
              ต้องการย้าย Tag Budget มาที่ SCT ตัวใหม่ ?
            </Typography>
          </Box>
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
          >
            <span>ใช่, ต้องการย้าย</span>
          </LoadingButton>
          <Button variant='tonal' color='secondary' onClick={onCloseClick} disabled={isLoading}>
            ไม่ต้องการย้าย
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ChangeSctTagBudgetModal

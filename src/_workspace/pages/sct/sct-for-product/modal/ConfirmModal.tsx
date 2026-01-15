import type { ReactElement, Ref } from 'react'
import React, { forwardRef } from 'react'

// ** MUI Imports
//import Image from 'next/image'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { LinearProgressProps, SlideProps } from '@mui/material'
import { Box, LinearProgress, Slide, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import undraw_clean_up_re_504g from '@assets/images/common/undraw_clean_up_re_504g.svg'
import undraw_notify_re_65on from '@assets/images/common/undraw_notify_re_65on.svg'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },

  ref: Ref<unknown>
) {
  return <Slide direction='down' ref={ref} {...props} />
})

const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
  return (
    <div className='flex items-center gap-3'>
      <div className='is-full'>
        <LinearProgress variant='determinate' {...props} />
      </div>
      <Typography
        variant='body2'
        color='text.secondary'
        className='font-medium'
      >{`${Math.round(props.value)}%`}</Typography>
    </div>
  )
}

const ConfirmModal = ({
  show,
  onConfirmClick,
  onCloseClick,
  isLoading,
  isDelete,
  countSctCalFinished,
  setCountSctCalFinished,
  countSctCal,
  setCountSctCal
}: any) => {
  let imageConfirm

  if (isDelete) {
    imageConfirm = undraw_clean_up_re_504g
  } else {
    imageConfirm = undraw_notify_re_65on
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
            <img src={imageConfirm} height={120} width={150} alt='' />
          </Box>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant='h5'>Are You Sure ?</Typography>
            <Typography variant='h5' sx={{ color: 'text.secondary' }}>
              ยืนยัน การ{isDelete ? 'ลบ' : 'บันทึก'}ข้อมูลหรือไม่ ?
            </Typography>
          </Box>
          {/* {countSctCal} */}
          {/* {countSctCalFinished} */}
          {countSctCal !== 0 && (
            <>
              {countSctCalFinished} / {countSctCal}
              <LinearProgressWithLabel value={(countSctCalFinished / countSctCal) * 100} />
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            borderTop: 'none',
            mb: 4
          }}
        >
          <LoadingButton
            onClick={onConfirmClick}
            loading={isLoading}
            loadingIndicator={isDelete ? 'Deleting...' : 'Saving...'}
            variant='contained'
            color={isDelete ? 'error' : 'success'}
            sx={{ mr: 4 }}
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

export default ConfirmModal

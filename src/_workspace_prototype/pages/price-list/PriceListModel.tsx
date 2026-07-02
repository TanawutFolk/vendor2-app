import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Button, Col, Modal, ModalBody, Row, Spinner } from 'reactstrap'
// ** Images
import deleteImg from '@src/assets/images/common/undraw_clean_up_re_504g.svg'
import editImg from '../../../../../public/images/common/undraw_notify_re_65on.svg'
import { Dialog, DialogActions, DialogContent, Typography, Box } from '@mui/material'
import Transition from '@/components/TransitionDialog'

import LoadingButton from '@mui/lab/LoadingButton'

const PriceListConfirmModal = ({ show, onConfirmClick, onCloseClick, isLoading, isDelete }) => {
  let imageConfirm

  if (isDelete) {
    imageConfirm = '/images/common/undraw_clean_up_re_504g.svg'
  } else {
    imageConfirm = '/images/common/undraw_notify_re_65on.svg'
  }
  return (
    <>
      <Dialog
        isOpen={show}
        toggle={onCloseClick}
        centered={false}
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
          <Typography sx={{ mb: 4, textAlign: 'center' }} variant='h5'>
            Export Data ?
          </Typography>
          <Typography variant='h5' sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
            ยืนยัน การ{isDelete ? 'ลบ' : 'ส่งออก'}ข้อมูลหรือไม่ ?
          </Typography>
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
            color={'success'}
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            <span>Yes, {isDelete ? 'Delete' : 'Export'} !</span>
          </LoadingButton>
          <LoadingButton
            onClick={onCloseClick}
            loading={isLoading}
            variant='contained'
            color={'error'}
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            <span>Cancel</span>
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

PriceListConfirmModal.propTypes = {
  onCloseClick: PropTypes.func,
  onConfirmClick: PropTypes.func,
  show: PropTypes.any
}

export default PriceListConfirmModal

import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'

import { MRT_Row } from 'material-react-table'

import { Controller, useForm } from 'react-hook-form'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import CustomTextField from '@/components/mui/TextField'

import { FlowTypeI } from '@/_workspace/types/flow/FlowType'

import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import StatusOption from '@/libs/react-select/option/StatusOption'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Props
interface ViewModalProps {
  openModalView: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<FlowTypeI> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<FlowTypeI> | null>>
}

const FlowTypeViewModal = ({ openModalView, setOpenModalView, rowSelected, setRowSelected }: ViewModalProps) => {
  // Hooks : react-hook-form
  const { control } = useForm({
    defaultValues: {
      FLOW_TYPE_NAME: rowSelected?.original.FLOW_TYPE_NAME,
      FLOW_TYPE_ALPHABET: rowSelected?.original.FLOW_TYPE_ALPHABET,
      INUSE: StatusOption.find(item => item.value == rowSelected?.original.INUSE)
    }
  })

  // Functions
  const handleClose = () => {
    setOpenModalView(false)
    setRowSelected(null)
    // reset()
  }

  return (
    <>
      <Dialog
        maxWidth='sm'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openModalView}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            View Flow Type
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
            <Controller
              name='FLOW_TYPE_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Flow Type Name'
                  placeholder='Enter Flow Type Name'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='FLOW_TYPE_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Flow Type Alphabet'
                  placeholder='Enter Flow Type Alphabet'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-5'>
            <Controller
              name='INUSE'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <SelectCustom
                  {...fieldProps}
                  options={StatusOptionForEdit}
                  isClearable
                  label='Status'
                  classNamePrefix='select'
                  isDisabled={true}
                />
              )}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default FlowTypeViewModal

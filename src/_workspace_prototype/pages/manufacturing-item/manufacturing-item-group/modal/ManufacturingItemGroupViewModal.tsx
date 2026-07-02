import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import type { SlideProps } from '@mui/material'
import { Grid, Slide } from '@mui/material'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports

import { number, object, string } from 'valibot'

import type { Input } from 'valibot'

import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { MRT_Row } from 'material-react-table'

import { ManufacturingItemGroupI } from '@/_workspace/types/manufacturing-item/ManufacturingItemGroup'
import CustomTextField from '@/components/mui/TextField'
import StatusOption from '@/libs/react-select/option/StatusOption'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

type FormData = Input<typeof schema>

const schema = object({
  status: object(
    {
      value: number(),
      label: string()
    },
    requiredFieldMessage({ fieldName: 'Status' })
  )
})

interface ManufacturingItemGroupModalProps {
  openViewModal: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ManufacturingItemGroupI> | null
}
interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ManufacturingItemGroupViewModal = ({
  openViewModal,
  setOpenModalView,
  rowSelected,
  isEnableFetching,
  setIsEnableFetching
}: Props & ManufacturingItemGroupModalProps) => {
  // useState

  const handleClickOpen = () => setOpenModalView(true)
  const handleClose = () => {
    setOpenModalView(false)
    //reset()
  }

  // Hooks : react-hook-form

  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ITEM_GROUP_NAME: rowSelected?.original.ITEM_GROUP_NAME,
      status: StatusOption.find(item => item.value == rowSelected?.original?.INUSE)?.label
    }
  })
  const { errors, isDirty } = useFormState({
    control
  })

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
        open={openViewModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            View Manufacturing Item Group
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              control={control}
              name='ITEM_GROUP_NAME'
              render={({ field: { ...fieldProps } }) => (
                <CustomTextField
                  label='Manufacturing Item Group Name'
                  {...fieldProps}
                  fullWidth
                  placeholder='Enter ...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid>
            <Controller
              name='status'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <CustomTextField label='Status' {...fieldProps} disabled fullWidth autoComplete='off' />
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

export default ManufacturingItemGroupViewModal

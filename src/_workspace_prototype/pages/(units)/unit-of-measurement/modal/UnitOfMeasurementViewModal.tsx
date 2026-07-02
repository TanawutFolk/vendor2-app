import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction } from 'react'

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

import { UnitOfMeasurementI } from '@/_workspace/types/unit/UnitOfMeasurement'

import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Props
interface UnitOfMeasurementViewModalProps {
  openModalView: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<UnitOfMeasurementI> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<UnitOfMeasurementI> | null>>
}

const UnitOfMeasurementViewModal = ({
  openModalView,
  setOpenModalView,
  rowSelected,
  setRowSelected
}: UnitOfMeasurementViewModalProps) => {
  console.log(rowSelected?.original)
  // Hooks : react-hook-form
  const { control } = useForm({
    defaultValues: {
      unitOfMeasurementName: rowSelected?.original.UNIT_OF_MEASUREMENT_NAME,
      symbol: rowSelected?.original.SYMBOL,
      status: StatusOption.find(item => item.value == rowSelected?.original.inuseForSearch)
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
            View Unit of Measurement
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='unitOfMeasurementName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Unit of Measurement Name'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='symbol'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Unit Of Measurement Code'
                  placeholder='Enter...'
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

export default UnitOfMeasurementViewModal

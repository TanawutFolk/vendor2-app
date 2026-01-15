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

import { type Input } from 'valibot'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import CustomTextField from '@/components/mui/TextField'

import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

import { CustomerShipToInterface } from '@/_workspace/types/customer/CustomerShipTo'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

type FormData = Input<typeof schema>

// Props
interface ViewModalProps {
  openModalView: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<CustomerShipToInterface> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const CustomerShipToViewModal = ({ openModalView, setOpenModalView, rowSelected }: ViewModalProps) => {
  // States : Dialog

  // Hooks : react-hook-form
  const { control } = useForm<FormData>({
    // resolver: valibotResolver(schema),
    defaultValues: {
      CUSTOMER_SHIP_TO_NAME: rowSelected?.original?.CUSTOMER_SHIP_TO_NAME,
      CUSTOMER_SHIP_TO_ALPHABET: rowSelected?.original.CUSTOMER_SHIP_TO_ALPHABET,
      INUSE: StatusOption.find(item => item.value == rowSelected?.original?.inuseForSearch)
    }
  })

  // Functions

  const handleClose = () => {
    setOpenModalView(false)
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
            View Customer Ship To
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='CUSTOMER_SHIP_TO_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Customer Ship To Name'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='CUSTOMER_SHIP_TO_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Customer Order From Alphabet'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid>
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

export default CustomerShipToViewModal

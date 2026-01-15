import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

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

import { maxLength, minLength, nonEmpty, number, object, pipe, regex, string } from 'valibot'

import type { Input } from 'valibot'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { MRT_Row } from 'material-react-table'

import { OrderTypeI } from '@/_workspace/types/production-control/OrderType'
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
  ORDER_TYPE_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Order Type Name', typeName: 'String' })),
    nonEmpty('Order Type Name is required'),
    minLength(2, minLengthFieldMessage({ fieldName: 'Order Type Name', minLength: 2 })),
    maxLength(50, maxLengthFieldMessage({ fieldName: 'Order Type Name', maxLength: 50 }))
  ),
  ORDER_TYPE_ALPHABET: pipe(
    string(),
    nonEmpty('Order Type Alphabet is required'),
    minLength(1, minLengthFieldMessage({ fieldName: 'Order Type Alphabet', minLength: 1 })),
    maxLength(1, maxLengthFieldMessage({ fieldName: 'Order Type Alphabet', maxLength: 1 })),
    regex(/[A-Z]/, 'Order Type Alphabet must contain a uppercase letter')
  ),
  status: object(
    {
      value: number(),
      label: string()
    },
    requiredFieldMessage({ fieldName: 'Status' })
  )
})

interface OrderTypeModalProps {
  openViewModal: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<OrderTypeI> | null
}
interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const OrderTypeViewModal = ({
  openViewModal,
  setOpenModalView,
  rowSelected,
  isEnableFetching,
  setIsEnableFetching
}: Props & OrderTypeModalProps) => {
  // useState

  // States : Modal
  const [activeList, setActiveList] = useState('1')
  const toggleList = (list: any) => {
    if (activeList !== list) {
      setActiveList(list)
    }
  }

  const [dataRow, setData] = useState([])

  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalView(true)
  const handleClose = () => {
    setOpenModalView(false)
    //reset()
  }

  // Hooks : react-hook-form

  const { control, getValues, handleSubmit } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      ORDER_TYPE_NAME: rowSelected?.original.ORDER_TYPE_NAME,
      ORDER_TYPE_ALPHABET: rowSelected?.original.ORDER_TYPE_ALPHABET,
      status: StatusOption.find(item => item.value == rowSelected?.original?.inuseForSearch)?.label
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
            View Order Type
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              control={control}
              name='ORDER_TYPE_NAME'
              render={({ field: { ...fieldProps } }) => (
                <CustomTextField
                  label='Order Type Name'
                  {...fieldProps}
                  fullWidth
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='ORDER_TYPE_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Order Type Alphabet'
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

export default OrderTypeViewModal

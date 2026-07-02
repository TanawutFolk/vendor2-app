// React Imports
import type { Ref, ReactElement, Dispatch, SetStateAction } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { SlideProps } from '@mui/material'
import { Grid, Slide } from '@mui/material'
import type { SubmitErrorHandler } from 'react-hook-form'
import { Controller, useForm, useFormContext, useFormState } from 'react-hook-form'
import type { FadeProps } from '@mui/material/Fade'
import Fade from '@mui/material/Fade'
import AsyncSelect from 'react-select/async'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import AddIcon from '@mui/icons-material/Add'

import {
  object,
  string,
  nullable,
  number,
  unknown,
  array,
  boolean,
  picklist,
  optional,
  record,
  minLength,
  maxLength
} from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { MRT_Row } from 'material-react-table'
import { PREFIX_QUERY_KEY, useDelete } from '@/_workspace/react-query/hooks/useOrderType'

import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { OrderTypeI } from '@/_workspace/types/production-control/OrderType'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface OrderTypeModalProps {
  openDeleteModal: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<OrderTypeI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

// Types
const OrderTypeDeleteModal = ({
  openDeleteModal,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: OrderTypeModalProps) => {
  // useState

  // States : Modal
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalDelete(true)
  const handleClose = () => {
    setOpenModalDelete(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useFormContext<FormData>()
  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    setConfirmModal(true)
  }

  // Functions
  const handleDeleteOrderType = () => {
    setConfirmModal(false)

    const dataItem = {
      ORDER_TYPE_ID: rowSelected?.original?.ORDER_TYPE_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Order Type'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      handleClose()
    } else {
      const message = {
        title: 'Delete Order Type',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useDelete(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('error', data)
  }

  const queryClient = useQueryClient()

  return (
    <>
      <ConfirmModal
        show={openDeleteModal}
        onConfirmClick={handleDeleteOrderType}
        onCloseClick={() => setOpenModalDelete(false)}
        isDelete={true}
      />
    </>
  )
}

export default OrderTypeDeleteModal

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
import { Controller, useForm, useFormState } from 'react-hook-form'
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
  // toTrimmed
} from 'valibot'
import type { Input } from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import ConfirmModal from '@components/ConfirmModal'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'
import { MRT_Row } from 'material-react-table'
import { PREFIX_QUERY_KEY, useDeleteProductTypeAndItem } from '@/_workspace/react-query/hooks/useProductTypeData'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = Input<typeof schema>

const schema = object({
  productMain: object(
    {
      PRODUCT_MAIN_ID: number(typeFieldMessage({ fieldName: 'Product Main Name', typeName: 'Number' })),
      PRODUCT_MAIN_NAME: string(typeFieldMessage({ fieldName: 'Product Main Name', typeName: 'String' }))
    },
    requiredFieldMessage({ fieldName: 'Product Main' })
  ),
  productCategory: object(
    {
      PRODUCT_CATEGORY_ID: number(typeFieldMessage({ fieldName: 'Product Category Name', typeName: 'Number' })),
      PRODUCT_CATEGORY_NAME: string(typeFieldMessage({ fieldName: 'Product Category Name', typeName: 'String' }))
    },
    requiredFieldMessage({ fieldName: 'Product Category' })
  )
})

interface ProductSubDeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ProductTypeI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

// Types
const ProductTypeDeleteModal = ({
  openModalDelete,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: ProductSubDeleteModalProps) => {
  // useState

  // States : Modal
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalDelete(true)

  const handleClose = () => {
    setOpenModalDelete(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {}
    // defaultValues: {
    //   customerOrderFromName: rowSelected?.original.CUSTOMER_ORDER_FROM_NAME,
    //   customerOrderFromAlphabet: rowSelected?.original.CUSTOMER_ORDER_FROM_ALPHABET
    // }
  })
  const { errors } = useFormState({
    control
  })

  // Functions
  const handleDelete = () => {
    setConfirmModal(false)

    const dataItem = {
      PRODUCT_TYPE_ID: rowSelected?.original.PRODUCT_TYPE_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    // console.log('DATA-ITEM', dataItem)
    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Product Main'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      // reset()
      handleClose()
    } else {
      const message = {
        title: 'Delete Product Main',
        message: data.data.Message.startsWith('1062')
          ? 'Duplicate Product Main'
          : 'Data is duplicate. Please change Sub Process'
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      reset()
      handleClose()
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useDeleteProductTypeAndItem(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('error', data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  // useEffect(() => {
  //   console.log(watch('productMain.PRODUCT_MAIN_ID'))
  // }, [watch('productMain')?.PRODUCT_MAIN_ID])

  return (
    <>
      <ConfirmModal
        show={openModalDelete}
        onConfirmClick={handleDelete}
        onCloseClick={() => setOpenModalDelete(false)}
        isDelete={true}
      />
    </>
  )
}

export default ProductTypeDeleteModal

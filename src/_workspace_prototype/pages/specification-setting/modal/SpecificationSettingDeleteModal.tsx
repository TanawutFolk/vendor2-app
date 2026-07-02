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

import ConfirmModal from '@components/ConfirmModal'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

import { MRT_Row } from 'material-react-table'
import { PREFIX_QUERY_KEY, useDeleteBoiUnit } from '@/_workspace/react-query/hooks/useBoiUnitData'

import { BoiNameForMaterialConsumableI } from '@/_workspace/types/boi/BoiNameForMaterialConsumable'
import { useDeleteBoiNameForMaterialConsumable } from '@/_workspace/react-query/hooks/useBoiNameForMaterialConsumableData'
import { useDeleteSpecificationSetting } from '@/_workspace/react-query/hooks/useSpecificationSettingData'
import { SpecificationSettingI } from '@/_workspace/types/specification-setting/SpecificationSetting'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})
export type FormData = Input<typeof schema>

const schema = object({
  // productCategory: object({
  //   PRODUCT_CATEGORY_ID: coerce(string([toTrimmed()])
  // }),
  // boiUnitName: string([]),
  // boiUnitSymbol: string([])
})

interface SpecificationSettingDeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<SpecificationSettingI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const SpecificationSettingDeleteModal = ({
  openModalDelete,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: SpecificationSettingDeleteModalProps) => {
  // useState

  // States : Modal
  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalDelete(true)

  const handleClose = () => {
    setOpenModalDelete(false)
    reset()
  }
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema)
    // defaultValues: {
    //   customerOrderFromName: rowSelected?.original.CUSTOMER_ORDER_FROM_NAME,
    //   customerOrderFromAlphabet: rowSelected?.original.CUSTOMER_ORDER_FROM_ALPHABET
    // }
  })
  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    console.log('ok')

    setConfirmModal(true)
  }
  const handleDeleteSpecificationSetting = () => {
    setConfirmModal(false)

    const dataItem = {
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: rowSelected?.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    // console.log('DATA-ITEM', dataItem)
    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Product Main'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
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
  const mutation = useDeleteSpecificationSetting(onMutateSuccess, onMutateError)

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
        onConfirmClick={handleDeleteSpecificationSetting}
        onCloseClick={() => setOpenModalDelete(false)}
        isDelete={true}
      />
    </>
  )
}
export default SpecificationSettingDeleteModal

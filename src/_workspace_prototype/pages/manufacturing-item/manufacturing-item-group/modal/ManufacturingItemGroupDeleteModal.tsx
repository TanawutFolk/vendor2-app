// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

// MUI Imports

import type { SlideProps } from '@mui/material'
import { Slide } from '@mui/material'
import type { SubmitErrorHandler } from 'react-hook-form'
import { useFormContext, useFormState } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { PREFIX_QUERY_KEY, useDelete } from '@/_workspace/react-query/hooks/useManufacturingItemGroupData'
import { MRT_Row } from 'material-react-table'

import { ManufacturingItemGroupI } from '@/_workspace/types/manufacturing-item/ManufacturingItemGroup'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface ManufacturingItemGroupModalProps {
  openDeleteModal: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ManufacturingItemGroupI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

// Types
const ManufacturingItemGroupDeleteModal = ({
  openDeleteModal,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: ManufacturingItemGroupModalProps) => {
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
      ITEM_GROUP_ID: rowSelected?.original?.ITEM_GROUP_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Manufacturing Item Group'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      handleClose()
    } else {
      const message = {
        title: 'Delete Manufacturing Item Group',
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

export default ManufacturingItemGroupDeleteModal

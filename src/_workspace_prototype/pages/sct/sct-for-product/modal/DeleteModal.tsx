// React Imports
import { useState, type Dispatch, type SetStateAction } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import ConfirmModal from '@components/ConfirmModal'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

import { MRT_Row } from 'material-react-table'

import {
  PREFIX_QUERY_KEY,
  useChangeSctProgress,
  useDeleteSctData
} from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import { StandardCostForProductI } from '@/_workspace/types/sct/StandardCostForProductType'
import AxiosResponseI, { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'
import { useDxContext } from '@/_template/DxContextProvider'
import ConfirmModalForSctForProduct from './ConfirmModalForSctForProduct'
import { useForm } from 'react-hook-form'
import list from '@/@core/theme/overrides/list'

interface SctDataDeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<StandardCostForProductI> | null
}

// Types
const SctDataDeleteModal = ({ setOpenModalDelete, rowSelected, openModalDelete }: SctDataDeleteModalProps) => {
  const { setIsEnableFetching } = useDxContext()

  const reactUseForm = useForm({
    defaultValues: {
      cancelReason: ''
    }
  })

  // Functions
  const handleClose = () => {
    setOpenModalDelete(false)
  }

  const handleDelete = () => {
    const dataItem = {
      SCT_ID: [rowSelected?.original.SCT_ID],
      SCT_STATUS_PROGRESS_ID: 1,
      UPDATE_BY: getUserData().EMPLOYEE_CODE,
      CANCEL_REASON: reactUseForm.getValues('cancelReason') ?? '',
      listStatusSctProgress: [{ SCT_STATUS_PROGRESS_ID: rowSelected?.original.SCT_STATUS_PROGRESS_ID }]
    }

    if (!reactUseForm.getValues('cancelReason') || reactUseForm.getValues('cancelReason').trim() === '') {
      const message = {
        title: 'SCT Data',
        message: 'โปรดกรอกเหตุผลในการยกเลิก'
      }

      ToastMessageError(message)

      return
    }

    changeProgressMutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: AxiosResponseI<null>) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Sct Data'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Delete Sct Data',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Delete Sct Data' : 'Data is duplicate.'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (e: AxiosResponseWithErrorI) => {
    const message = {
      title: 'Add Delete Sct Data',
      message: e.message
    }

    ToastMessageError(message)
  }

  const changeProgressMutation = useChangeSctProgress(onMutateSuccess, onMutateError)

  // Hooks : react-query
  const queryClient = useQueryClient()

  return (
    <>
      <ConfirmModalForSctForProduct
        show={openModalDelete}
        setValue={reactUseForm.setValue}
        sctStatusProgressId={1}
        onConfirmClick={handleDelete}
        onCloseClick={handleClose}
        isDelete={false}
        isLoading={changeProgressMutation.isPending}
      />
    </>
  )
}

export default SctDataDeleteModal

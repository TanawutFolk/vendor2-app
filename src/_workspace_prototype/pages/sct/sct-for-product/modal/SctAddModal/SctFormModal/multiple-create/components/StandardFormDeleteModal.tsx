import { Dispatch, SetStateAction, useEffect } from 'react'

import { MRT_Row } from 'material-react-table'

import { useQueryClient } from '@tanstack/react-query'

import ConfirmModal from '@/components/ConfirmModal'

import { StandardCostFormI } from '@/_workspace/types/sct/StandardCostForProductType'

import { PREFIX_QUERY_KEY, useDeleteSctForm } from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

interface DeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<StandardCostFormI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const StandardFormDeleteModal = ({
  openModalDelete,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: DeleteModalProps) => {
  const queryClient = useQueryClient()

  const handleClose = () => {
    setOpenModalDelete(false)
  }

  // Functions
  const handleDelete = () => {
    const dataItem = {
      SCT_F_ID: rowSelected?.original.SCT_F_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Sct Form'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Delete Sct Form',
        message: data.data.Message
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    }
  }

  const onMutateError = (data: any) => {
    console.log('onMutateError')

    const message = {
      title: 'Delete Sct Form',
      message: data.data.Message
    }

    ToastMessageError(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

    handleClose()
  }

  const mutation = useDeleteSctForm(onMutateSuccess, onMutateError)

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

export default StandardFormDeleteModal

import { Dispatch, SetStateAction, useEffect } from 'react'

import { MRT_Row } from 'material-react-table'

import { useQueryClient } from '@tanstack/react-query'

import ConfirmModal from '@/components/ConfirmModal'

import { ItemCategoryI } from '@/_workspace/types/item-master/ItemCategory'
import { PREFIX_QUERY_KEY, useDelete } from '@/_workspace/react-query/hooks/useItemCategory'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

interface DeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ItemCategoryI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ItemCategoryDeleteModal = ({
  openModalDelete,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: DeleteModalProps) => {
  useEffect(() => {
    if (rowSelected?.original.INUSE === 0) {
      setOpenModalDelete(false)

      const message = {
        message: 'Cannot delete because already deleted !',
        title: 'Delete Item Category'
      }

      ToastMessageError(message)
    }
  }, [])

  const queryClient = useQueryClient()

  const handleClose = () => {
    setOpenModalDelete(false)
  }

  // Functions
  const handleDelete = () => {
    const dataItem = {
      ITEM_CATEGORY_ID: rowSelected?.original.ITEM_CATEGORY_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Item Category'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Delete Item Category',
        message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')

    const message = {
      title: 'Delete Item Category',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

    handleClose()
  }

  const mutation = useDelete(onMutateSuccess, onMutateError)

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

export default ItemCategoryDeleteModal

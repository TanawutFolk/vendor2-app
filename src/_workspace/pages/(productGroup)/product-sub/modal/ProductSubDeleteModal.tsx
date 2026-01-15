// React Imports
import type { Dispatch, SetStateAction } from 'react'
// Components Imports
import { useQueryClient } from '@tanstack/react-query'
import ConfirmModal from '@components/ConfirmModal'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'
import { MRT_Row } from 'material-react-table'
import { PREFIX_QUERY_KEY, useDeleteProductSub } from '@/_workspace/react-query/hooks/useProductSubData'
import { ProductSubI } from '@/_workspace/types/productGroup/ProductSub'

interface ProductSubDeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<ProductSubI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

// Types
const ProductSubDeleteModal = ({
  openModalDelete,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: ProductSubDeleteModalProps) => {
  const handleClose = () => {
    setOpenModalDelete(false)
  }

  // Functions
  const handleDeleteCustomerOrderFrom = () => {
    const dataItem = {
      PRODUCT_SUB_ID: rowSelected?.original.PRODUCT_SUB_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

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
      handleClose()
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useDeleteProductSub(onMutateSuccess, onMutateError)

  const queryClient = useQueryClient()

  return (
    <>
      <ConfirmModal
        show={openModalDelete}
        onConfirmClick={handleDeleteCustomerOrderFrom}
        onCloseClick={() => setOpenModalDelete(false)}
        isDelete={true}
      />
    </>
  )
}

export default ProductSubDeleteModal

// React Imports
import type { Dispatch, SetStateAction } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import ConfirmModal from '@components/ConfirmModal'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

import { MRT_Row } from 'material-react-table'

import { PREFIX_QUERY_KEY, useDelete } from '@/_workspace/react-query/hooks/useProductMainData'

import { SearchResultType } from '../SearchResult'
import AxiosResponseI, { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'
import { useDxContext } from '@/_template/DxContextProvider'

interface ProductMainDeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<SearchResultType> | null
}

// Types
const ProductMainDeleteModal = ({ setOpenModalDelete, rowSelected, openModalDelete }: ProductMainDeleteModalProps) => {
  const { setIsEnableFetching } = useDxContext()

  // Functions

  const handleClose = () => {
    setOpenModalDelete(false)
  }

  const handleDelete = () => {
    const dataItem = {
      PRODUCT_MAIN_ID: rowSelected?.original.PRODUCT_MAIN_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutate(dataItem)
  }

  const onMutateSuccess = (data: AxiosResponseI<null>) => {
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
    }
  }

  const onMutateError = (e: AxiosResponseWithErrorI) => {
    const message = {
      title: 'Add Product Main',
      message: e.message
    }

    ToastMessageError(message)
  }

  const { mutate, isPending } = useDelete(onMutateSuccess, onMutateError)

  // Hooks : react-query
  const queryClient = useQueryClient()

  return (
    <>
      <ConfirmModal
        show={openModalDelete}
        onConfirmClick={handleDelete}
        onCloseClick={handleClose}
        isDelete={true}
        isLoading={isPending}
      />
    </>
  )
}

export default ProductMainDeleteModal

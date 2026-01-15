// React Imports
import type { Dispatch, SetStateAction } from 'react'
import type { SubmitErrorHandler } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import ConfirmModal from '@components/ConfirmModal'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'
import { MRT_Row } from 'material-react-table'
import { PREFIX_QUERY_KEY, useDelete } from '@/_workspace/react-query/hooks/useStandardPrice'
import { StandardPriceI } from '@/_workspace/types/manufacturing-item/StandardPrice'

interface Props {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<StandardPriceI>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const StandardPriceDeleteModal = ({ openModalDelete, setOpenModalDelete, rowSelected, setIsEnableFetching }: Props) => {
  const handleClose = () => {
    setOpenModalDelete(false)
  }

  // Functions
  const handleDelete = () => {
    const dataItem = {
      ITEM_M_S_PRICE_ID: rowSelected.original.ITEM_M_S_PRICE_ID,
      // IS_CURRENT: rowSelected.original.IS_CURRENT,
      // FISCAL_YEAR: rowSelected.original.FISCAL_YEAR,
      // SCT_PATTERN_ID: rowSelected.original.SCT_PATTERN_ID,
      // ITEM_CODE_FOR_SUPPORT_MES: rowSelected.original.ITEM_CODE_FOR_SUPPORT_MES,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Manufacturing Item Price'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      handleClose()
    } else {
      const message = {
        message: data.data.Message,
        title: 'Delete Manufacturing Item Price'
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      handleClose()
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useDelete(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('error', data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

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

export default StandardPriceDeleteModal

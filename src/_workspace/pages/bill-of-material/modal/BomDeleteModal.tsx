import { PREFIX_QUERY_KEY, useDelete } from '@/_workspace/react-query/hooks/useBomData'
import { BomI } from '@/_workspace/types/bom/Bom'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useQueryClient } from '@tanstack/react-query'
import { MRT_Row } from 'material-react-table'
import { Dispatch, SetStateAction, useEffect } from 'react'

interface DeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<BomI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const BomDeleteModal = ({
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
        title: 'Delete Process'
      }

      ToastMessageError(message)
    }
  }, [])

  const queryClient = useQueryClient()

  const handleClose = () => {
    setOpenModalDelete(false)
  }

  const handleDelete = () => {
    const dataItem = {
      BOM_ID: rowSelected?.original.BOM_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Bom'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Delete Bom',
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
      title: 'Delete Bom',
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

export default BomDeleteModal

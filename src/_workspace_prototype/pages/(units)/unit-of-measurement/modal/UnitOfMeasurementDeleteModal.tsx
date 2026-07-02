import { Dispatch, SetStateAction, useEffect } from 'react'

import { MRT_Row } from 'material-react-table'

import { useQueryClient } from '@tanstack/react-query'

import ConfirmModal from '@/components/ConfirmModal'

import { UnitOfMeasurementI } from '@/_workspace/types/unit/UnitOfMeasurement'
import { PREFIX_QUERY_KEY, useDeleteUnitOfMeasurement } from '@/_workspace/react-query/hooks/useUnitOfMeasurement'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

interface UnitOfMeasurementDeleteModalProps {
  openModalDelete: boolean
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<UnitOfMeasurementI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const UnitOfMeasurementDeleteModal = ({
  openModalDelete,
  setOpenModalDelete,
  rowSelected,
  setIsEnableFetching
}: UnitOfMeasurementDeleteModalProps) => {
  useEffect(() => {
    if (rowSelected?.original.INUSE === 0) {
      setOpenModalDelete(false)

      const message = {
        message: 'Cannot delete because already deleted !',
        title: 'Delete Unit of Measurement'
      }

      ToastMessageError(message)
    }
  }, [])

  const queryClient = useQueryClient()

  const handleClose = () => {
    setOpenModalDelete(false)
  }

  // Functions
  const handleDeleteUnitOfMeasurement = () => {
    const dataItem = {
      UNIT_OF_MEASUREMENT_ID: rowSelected?.original.UNIT_OF_MEASUREMENT_ID,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Delete Unit of Measurement'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Delete Unit of Measurement',
        message: data.data.Message
      }

      ToastMessageError(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')

    const message = {
      title: 'Delete Unit of Measurement',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

    handleClose()
  }

  const mutation = useDeleteUnitOfMeasurement(onMutateSuccess, onMutateError)

  return (
    <>
      <ConfirmModal
        show={openModalDelete}
        onConfirmClick={handleDeleteUnitOfMeasurement}
        onCloseClick={() => setOpenModalDelete(false)}
        isDelete={true}
      />
    </>
  )
}

export default UnitOfMeasurementDeleteModal

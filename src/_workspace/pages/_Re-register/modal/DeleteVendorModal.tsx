import ConfirmModal from '@components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useDeleteReRegisterVendor } from '@/_workspace/react-query/hooks/useReRegister'

interface DeleteVendorModalProps {
  open: boolean
  vendorId: number | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteVendorModal({ open, vendorId, onClose, onSuccess }: DeleteVendorModalProps) {
  const deleteMutation = useDeleteReRegisterVendor(
    data => {
      ToastMessageSuccess({ title: 'Delete Vendor', message: data?.Message || 'Vendor deleted successfully' })
      onSuccess()
      onClose()
    },
    (error: Error) => {
      ToastMessageError({ title: 'Delete Vendor', message: error.message || 'Failed to delete vendor' })
    }
  )

  const handleConfirm = () => {
    if (!vendorId) {
      ToastMessageError({ title: 'Delete Vendor', message: 'Vendor ID is missing' })
      return
    }

    deleteMutation.mutate({
      VENDORS_ID: vendorId,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE || 'SYSTEM'
    })
  }

  return (
    <ConfirmModal
      show={open}
      onCloseClick={onClose}
      onConfirmClick={handleConfirm}
      isLoading={deleteMutation.isPending}
      isDelete
    />
  )
}

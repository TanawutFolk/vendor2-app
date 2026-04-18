import React from 'react'

import ConfirmModal from '../../components/ConfirmModal'
import SuccessModal from '../../components/SuccessModal'
import ErrorModal from '../../components/ErrorModal'

interface VendorModalStateModalsProps {
    confirmModalOpen: boolean
    setConfirmModalOpen: (open: boolean) => void
    onConfirmSave: () => void
    saving: boolean
    successModalOpen: boolean
    setSuccessModalOpen: (open: boolean) => void
    successData: any
    errorModalOpen: boolean
    setErrorModalOpen: (open: boolean) => void
    onRetry: () => void
    errorMessage: string
    errorDetails: string
}

const VendorModalStateModals = ({
    confirmModalOpen,
    setConfirmModalOpen,
    onConfirmSave,
    saving,
    successModalOpen,
    setSuccessModalOpen,
    successData,
    errorModalOpen,
    setErrorModalOpen,
    onRetry,
    errorMessage,
    errorDetails,
}: VendorModalStateModalsProps) => {
    return (
        <>
            <ConfirmModal
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={onConfirmSave}
                loading={saving}
                title="Confirm Save Changes"
                message="Do you want to save changes to this vendor?"
            />

            <SuccessModal
                open={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title="Saved successfully"
                message="Vendor data has been updated."
                updatedData={successData}
            />

            <ErrorModal
                open={errorModalOpen}
                onClose={() => setErrorModalOpen(false)}
                onRetry={onRetry}
                title="An error occurred"
                message={errorMessage}
                errorDetails={errorDetails}
            />
        </>
    )
}

export default VendorModalStateModals

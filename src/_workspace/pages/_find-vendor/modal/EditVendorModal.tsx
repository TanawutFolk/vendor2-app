'use client'

// React Imports
import React, { useCallback } from 'react'

// MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    CircularProgress,
    Box,
    Typography,
    Slide,
    Alert,
    AlertTitle
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

// Third-party Imports
import { FormProvider } from 'react-hook-form'

// Components Imports
import AddProductGroupModal from '../../_add-vendor/modal/AddProductGroupModal'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import VendorProfileSection from './components/VendorProfileSection'
import ContactsSection from './components/ContactsSection'
import ProductsSection from './components/ProductsSection'
import VendorModalHeaderBar from './components/VendorModalHeaderBar'
import VendorModalFooterActions from './components/VendorModalFooterActions'
import VendorModalStateModals from './components/VendorModalStateModals'

// Services & Utils Imports
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'

import type { EditVendorSchemaType } from './validateSchema'
import { useEditVendorForm } from './useEditVendorForm'

interface EditVendorModalProps {
    open: boolean
    onClose: () => void
    vendorId: number | null
    rowData?: any
    forceRefreshOnEdit?: boolean
    onSuccess?: () => void
}

const EditVendorModal = ({
    open,
    onClose,
    vendorId,
    rowData,
    forceRefreshOnEdit = false,
    onSuccess: onSaveSuccess,
}: EditVendorModalProps) => {
    const {
        formMethods,
        control,
        editingMode,
        loading,
        saving,
        originalData,
        vendorFftCode,
        vendorStatusCheck,
        contactFields,
        productFields,
        appendContact,
        appendProduct,
        removeContact,
        removeProduct,
        showAddProductGroupModal,
        setShowAddProductGroupModal,
        productGroupRefreshKey,
        confirmModalOpen,
        setConfirmModalOpen,
        successModalOpen,
        setSuccessModalOpen,
        errorModalOpen,
        setErrorModalOpen,
        successData,
        errorMessage,
        errorDetails,
        toggleEditMode,
        handleSaveClick,
        handleConfirmSave,
        handleErrorRetry,
        handleClose,
        handleProductGroupAdded,
    } = useEditVendorForm({
        open,
        vendorId,
        rowData,
        forceRefreshOnEdit,
        onClose,
        onSaveSuccess,
    })


    // Dropdown fetcher for vendor types (following SearchFilter.tsx pattern)
    const fetchVendorTypes = useCallback(async (inputValue: string) => {
        try {
            const response = await FindVendorServices.getVendorTypes()
            if (response.data.Status) {
                return response.data.ResultOnDb.filter(item =>
                    item.label.toLowerCase().includes(inputValue.toLowerCase())
                )
            }
            return []
        } catch (error) {
            console.error('Error fetching vendor types:', error)
            return []
        }
    }, [])

    return (
        <>
            <FormProvider {...formMethods}>
            <Dialog
                maxWidth='sm'
                fullWidth={true}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose()
                    }
                }}
                TransitionComponent={Transition}
                open={open}
                PaperProps={{ sx: { bgcolor: 'background.default' } }}
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogTitle>
                    <Typography variant='h5' component='span'>
                        {editingMode === 'edit' ? 'Edit Vendor' : 'Vendor Details'}
                    </Typography>
                    <DialogCloseButton onClick={handleClose} disableRipple>
                        <i className='tabler-x' />
                    </DialogCloseButton>
                </DialogTitle>
                <VendorModalHeaderBar
                    control={control}
                    originalData={originalData}
                    vendorFftCode={vendorFftCode}
                    vendorStatusCheck={vendorStatusCheck}
                    editingMode={editingMode}
                    loading={loading}
                    onToggleEditMode={toggleEditMode}
                />
                <DialogContent dividers sx={{ p: 3, maxHeight: '75vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                            <CircularProgress />
                            <Typography variant="body1" sx={{ ml: 2 }}>Loading vendor details...</Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Reject Reason Alert */}
                            {originalData?.status_check === 'Cannot Register' && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    <AlertTitle>Cannot Register</AlertTitle>
                                    <strong>Reject Reason:</strong> {originalData.reject_reason || 'No reason specified'}
                                </Alert>
                            )}

                            <VendorProfileSection
                                editingMode={editingMode}
                                originalData={originalData}
                                fetchVendorTypes={fetchVendorTypes}
                            />

                            <ContactsSection
                                editingMode={editingMode}
                                contactFields={contactFields}
                                removeContact={removeContact}
                                appendContact={appendContact}
                            />

                            <ProductsSection
                                editingMode={editingMode}
                                productFields={productFields}
                                removeProduct={removeProduct}
                                appendProduct={appendProduct}
                                productGroupRefreshKey={productGroupRefreshKey}
                                onOpenAddProductGroup={() => setShowAddProductGroupModal(true)}
                            />
                        </>
                    )}
                </DialogContent>
                <VendorModalFooterActions
                    editingMode={editingMode}
                    loading={loading}
                    saving={saving}
                    onSaveClick={handleSaveClick}
                    onClose={handleClose}
                />

                <VendorModalStateModals
                    confirmModalOpen={confirmModalOpen}
                    setConfirmModalOpen={setConfirmModalOpen}
                    onConfirmSave={handleConfirmSave}
                    saving={saving}
                    successModalOpen={successModalOpen}
                    setSuccessModalOpen={setSuccessModalOpen}
                    successData={successData}
                    errorModalOpen={errorModalOpen}
                    setErrorModalOpen={setErrorModalOpen}
                    onRetry={handleErrorRetry}
                    errorMessage={errorMessage}
                    errorDetails={errorDetails}
                />
            </Dialog>
            <AddProductGroupModal
                open={showAddProductGroupModal}
                onClose={() => setShowAddProductGroupModal(false)}
                onSuccess={handleProductGroupAdded}
            />
            </FormProvider>
        </>
    )
}

export default EditVendorModal

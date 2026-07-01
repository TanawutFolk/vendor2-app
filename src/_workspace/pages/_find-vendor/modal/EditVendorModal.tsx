'use client'

// React Imports
import React, { useCallback, useRef } from 'react'

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
    props: SlideProps & { children?: ReactElement },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

// Third-party Imports
import { FormProvider } from 'react-hook-form'

// Components Imports
import AddProductGroupModal from '../../_add-vendor/modal/AddProductGroupModal'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import SkeletonCustom from '@components/SkeletonCustom'
import VendorProfileSection from './components/VendorProfileSection'
import ContactsSection from './components/ContactsSection'
import ProductsSection from './components/ProductsSection'
import VendorModalHeaderBar from './components/VendorModalHeaderBar'
import VendorModalFooterActions from './components/VendorModalFooterActions'
import ConfirmModal from '@/components/ConfirmModal'

// Services & Utils Imports
import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'

import type { DropdownItemI, VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import { useEditVendorForm } from './useEditVendorForm'
import type { EditVendorModalProps } from '@_workspace/types/_find-vendor/FindVendorTypes'



const EditVendorModal = ({
    open,
    onClose,
    vendorId,
    rowData,
    forceRefreshOnEdit = false,
    onSuccess: onSaveSuccess,
}: EditVendorModalProps) => {
    const vendorTypesCacheRef = useRef<DropdownItemI[] | null>(null)

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
        toggleEditMode,
        handleSaveClick,
        handleConfirmSave,
        handleClose,
        handleProductGroupAdded,
    } = useEditVendorForm({
        open,
        vendorId,
        rowData,
        forceRefreshOnEdit,
        initialMode: 'edit',
        onClose,
        onSaveSuccess,
    })


    const fetchVendorTypes = useCallback(async (inputValue: string) => {
        try {
            if (!vendorTypesCacheRef.current) {
                const response = await FindVendorServices.getVendorTypes()
                vendorTypesCacheRef.current = response.data.Status ? response.data.ResultOnDb : []
            }

            const keyword = inputValue.toLowerCase()
            return vendorTypesCacheRef.current.filter(item => item.label.toLowerCase().includes(keyword))
        } catch (error) {
            console.error('Error fetching vendor types:', error)
            return []
        }
    }, [])

    return (
        <>
            <FormProvider {...formMethods}>
            <Dialog
                maxWidth='lg'
                fullWidth={true}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick') {
                        handleClose()
                    }
                }}
                TransitionComponent={Transition}
                open={open}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.default',
                        width: 'min(1200px, calc(100vw - 32px))'
                    }
                }}
                sx={{
                    '& .MuiDialog-paper': { overflow: 'visible' },
                    '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
                }}
            >
                <DialogTitle>
                    <Typography variant='h5' component='span'>
                        Edit Vendor
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
                    hideModeButton
                    hideVendorCode
                />
                <DialogContent dividers sx={{ p: 3, maxHeight: '75vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {loading ? (
                        <Box sx={{ minHeight: 300 }}>
                            <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                                <CircularProgress size={24} />
                                <Typography variant="body2" sx={{ ml: 1.5 }}>Loading vendor details...</Typography>
                            </Box>
                            <SkeletonCustom />
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

                <ConfirmModal
                    show={confirmModalOpen}
                    onConfirmClick={handleConfirmSave}
                    onCloseClick={() => setConfirmModalOpen(false)}
                    isLoading={saving}
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

'use client'

// React Imports
import React from 'react'

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

const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='down' ref={ref} {...props} />
})

// Third-party Imports
import { FormProvider } from 'react-hook-form'

// Components Imports
import AddProductGroupModal from '@/_workspace/pages/_add-vendor/modal/AddProductGroupModal'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import SkeletonCustom from '@components/SkeletonCustom'
import VendorProfileSection from './components/VendorProfileSection'
import ContactsSection from './components/ContactsSection'
import ProductsSection from './components/ProductsSection'
import VendorModalHeaderBar from './components/VendorModalHeaderBar'
import VendorModalFooterActions from './components/VendorModalFooterActions'
import ConfirmModal from '@/components/ConfirmModal'

import { useEditVendorForm } from './useEditVendorForm'
import type { EditVendorModalProps } from '@/_workspace/types/vendor/VendorTypes'
import useVendorStatusIdentity from '@/_workspace/hooks/useVendorStatusIdentity'
import { isVendorStatusMaster } from '@/_workspace/utils/vendorStatusIdentity'

const EditVendorModal = ({
  open,
  onClose,
  vendorId,
  rowData,
  loading: detailLoading = false,
  errorMessage,
  updateRequest,
  fetchVendorTypes,
  fetchCountries,
  fetchProductGroups,
  onSuccess: onSaveSuccess
}: EditVendorModalProps) => {
  const { vendorStatusIds } = useVendorStatusIdentity()

  const {
    formMethods,
    control,
    editingMode,
    loading: formLoading,
    saving,
    originalData,
    vendorFftCode,
    vendorStatusLabel,
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
    handleProductGroupAdded
  } = useEditVendorForm({
    open,
    vendorId,
    rowData,
    updateRequest,
    initialMode: 'edit',
    onClose,
    onSaveSuccess
  })

  const loading = detailLoading || formLoading

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
          keepMounted
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
            vendorStatusLabel={vendorStatusLabel}
            editingMode={editingMode}
            loading={loading}
            onToggleEditMode={toggleEditMode}
            hideModeButton
            hideVendorCode
          />
          <DialogContent
            dividers
            sx={{ p: 3, maxHeight: '75vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            {errorMessage ? (
              <Alert severity='error'>{errorMessage}</Alert>
            ) : loading ? (
              <Box sx={{ minHeight: 300 }}>
                <Box display='flex' justifyContent='center' alignItems='center' sx={{ mb: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant='body2' sx={{ ml: 1.5 }}>
                    Loading vendor details...
                  </Typography>
                </Box>
                <SkeletonCustom />
              </Box>
            ) : (
              <>
                {/* Reject Reason Alert */}
                {isVendorStatusMaster(originalData, vendorStatusIds.CANNOT_REGISTER) && (
                  <Alert severity='error' sx={{ mb: 3 }}>
                    <AlertTitle>Cannot Register</AlertTitle>
                    <strong>Reject Reason:</strong> {originalData?.reject_reason || 'No reason specified'}
                  </Alert>
                )}

                <VendorProfileSection
                  editingMode={editingMode}
                  originalData={originalData}
                  fetchVendorTypes={fetchVendorTypes}
                  fetchCountries={fetchCountries}
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
                  fetchProductGroups={fetchProductGroups}
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

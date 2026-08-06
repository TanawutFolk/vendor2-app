'use client'

// MUI Imports
import {
  Alert,
  AlertTitle,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography
} from '@mui/material'

// Components Imports
import Transition from '@components/TransitionDialog'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import SelectCustom from '@components/react-select/SelectCustom'
import { DetailCard, EmptyState, ReadOnlyField, RecordCard, SectionHeader } from '@components/detail-view'

import { EmailActionButtons } from '../components/EmailActionButtons'
import { VendorStatusChip } from '../components/fftStatus'

import type { VendorDetailsModalProps } from '@/_workspace/types/vendor/VendorTypes'
import useVendorStatusIdentity from '@/_workspace/hooks/useVendorStatusIdentity'
import { isVendorStatusMaster } from '@/_workspace/utils/vendorStatusIdentity'

// Same Active/Inactive options the Edit Vendor header uses.
const inUseOptions = [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 }
]

const VendorDetailsModal = ({ open, onClose, data, loading = false, errorMessage }: VendorDetailsModalProps) => {
  const { vendorStatusIds } = useVendorStatusIdentity()
  const contacts = (Array.isArray(data?.contacts) ? data.contacts : []).filter(Boolean)
  const products = (Array.isArray(data?.products) ? data.products : []).filter(Boolean)

  const companyName = data?.company_name
  const vendorTypeName = data?.vendor_type_name
  const vendorRegion = data?.vendor_region
  const vendorStatusCode = data?.vendor_status_code
  const vendorStatusLabel = data?.vendor_status_label
  const rejectReason = data?.reject_reason
  const emailMain = data?.emailmain

  const fftVendorCode = data?.fft_vendor_code
  const isActive = Number(data?.INUSE ?? 1) === 1

  return (
    <Dialog
      maxWidth='lg'
      fullWidth
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
     TransitionComponent={Transition}
      keepMounted
      open={open}
      scroll='paper'
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
          Vendor Details
        </Typography>
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>

      {/* Header bar — same layout as VendorModalHeaderBar (Edit Vendor). */}
      <Box
        sx={{
          width: '100%',
          px: 3,
          py: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.25, flexWrap: 'wrap' }}>
            <Typography variant='h6' fontWeight={800}>
              {companyName || 'Vendor Details'}
            </Typography>
            {/* {fftVendorCode && (
              <Chip
                label={`Code: ${fftVendorCode}`}
                size='small'
                color='primary'
                variant='tonal'
                sx={{ fontWeight: 700, fontSize: '0.7rem', height: 22 }}
              />
            )} */}
            {(vendorStatusCode || vendorStatusLabel) && (
              <VendorStatusChip value={vendorStatusCode || vendorStatusLabel} label={vendorStatusLabel} />
            )}
          </Box>
        </Box>

        {/* Same Status selector as Edit Vendor, locked because this view is read-only. */}
        <Box sx={{ minWidth: 180, ml: 'auto' }}>
          <SelectCustom
            classNamePrefix='select'
            label='Status'
            options={inUseOptions}
            value={inUseOptions.find(option => option.value === (isActive ? 1 : 0)) || null}
            isDisabled
          />
        </Box>
      </Box>

      <DialogContent
        dividers
        sx={{ p: 3, maxHeight: '75vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        {loading ? (
          <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography variant='body2'>Loading vendor details...</Typography>
          </Box>
        ) : errorMessage ? (
          <Alert severity='error'>{errorMessage}</Alert>
        ) : (
          <>
            {isVendorStatusMaster(data?.vendor_status_id, vendorStatusIds.CANNOT_REGISTER) && (
              <Alert severity='error'>
                <AlertTitle>Cannot Register</AlertTitle>
                <strong>Reject Reason:</strong> {rejectReason || 'No reason specified'}
              </Alert>
            )}

            {/* Company Profile */}
            <Box>
              <SectionHeader icon='tabler-building-store' title='Company Profile' />
              <DetailCard>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <ReadOnlyField label='Company Name' value={companyName} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ReadOnlyField label='Vendor Type' value={vendorTypeName} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block', mb: 1, fontWeight: 600 }}
                      >
                        Trade Term
                      </Typography>
                      <Chip
                        label={vendorRegion === 'Oversea' ? 'Oversea' : 'Local'}
                        color={vendorRegion === 'Oversea' ? 'info' : 'success'}
                        size='small'
                        variant='tonal'
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Grid>
                  {vendorRegion === 'Oversea' ? (
                    <Grid item xs={12} md={6}>
                      <ReadOnlyField label='Country' value={data?.country} />
                    </Grid>
                  ) : (
                    <>
                      <Grid item xs={6} md={3}>
                        <ReadOnlyField label='Province' value={data?.province} />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <ReadOnlyField label='Postal Code' value={data?.postal_code} />
                      </Grid>
                    </>
                  )}
                  <Grid item xs={6} md={3}>
                    <ReadOnlyField label='Website' value={data?.website} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <ReadOnlyField label='Tel Company' value={data?.tel_center} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <ReadOnlyField
                      label='Email (Main)'
                      value={emailMain}
                      endAdornment={
                        emailMain ? (
                          <EmailActionButtons email={emailMain} contactName={companyName || ''} />
                        ) : undefined
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <ReadOnlyField label='Vendor Code' value={fftVendorCode} />
                  </Grid>
                  <Grid item xs={12}>
                    <ReadOnlyField label='Address' value={data?.address} multiline />
                  </Grid>

                  {data?.vendor_id && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }}>
                        <Typography variant='caption' color='text.secondary'>
                          Company Info
                        </Typography>
                      </Divider>
                      <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary', flexWrap: 'wrap' }}>
                        <Box>
                          <Typography variant='caption' display='block'>
                            Created By
                          </Typography>
                          <Typography variant='body2' fontSize='0.75rem'>
                            {data.CREATE_BY || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' display='block'>
                            Created Date
                          </Typography>
                          <Typography variant='body2' fontSize='0.75rem'>
                            {data.CREATE_DATE || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' display='block'>
                            Last Update By
                          </Typography>
                          <Typography variant='body2' fontSize='0.75rem'>
                            {data.UPDATE_BY || 'N/A'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='caption' display='block'>
                            Last Update Date
                          </Typography>
                          <Typography variant='body2' fontSize='0.75rem'>
                            {data.UPDATE_DATE || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </DetailCard>
            </Box>

            {/* Contacts */}
            <Box>
              <SectionHeader icon='tabler-users' title={`Contacts (${contacts.length})`} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {contacts.length === 0 ? (
                  <EmptyState message='No contacts' />
                ) : (
                  contacts.map((contact: any, index: number) => (
                    <RecordCard key={contact.vendor_contact_id ?? index} index={index} title='Contact Info'>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField label='Name' value={contact.contact_name} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField label='Phone' value={contact.tel_phone} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField
                          label='Email'
                          value={contact.email}
                          endAdornment={
                            contact.email ? (
                              <EmailActionButtons email={contact.email} contactName={contact.contact_name} />
                            ) : undefined
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField label='Position' value={contact.position} />
                      </Grid>

                      {contact.vendor_contact_id && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }}>
                            <Typography variant='caption' color='text.secondary'>
                              Contact Info
                            </Typography>
                          </Divider>
                          <Box
                            sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary', flexWrap: 'wrap' }}
                          >
                            <Box>
                              <Typography variant='caption' display='block'>
                                Created By
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {contact.CREATE_BY || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' display='block'>
                                Created Date
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {contact.CREATE_DATE || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' display='block'>
                                Last Update By
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {contact.UPDATE_BY || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' display='block'>
                                Last Update Date
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {contact.UPDATE_DATE || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </RecordCard>
                  ))
                )}
              </Box>
            </Box>

            {/* Products / Services */}
            <Box>
              <SectionHeader icon='tabler-package' title={`Products / Services (${products.length})`} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {products.length === 0 ? (
                  <EmptyState message='No products' />
                ) : (
                  products.map((product: any, index: number) => (
                    <RecordCard key={product.vendor_product_id ?? index} index={index} title='Product'>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField label='Product Group' value={product.group_name} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField label='Maker' value={product.maker_name} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField label='Product Name' value={product.product_name} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <ReadOnlyField label='Model List' value={product.model_list} multiline />
                      </Grid>

                      {product.vendor_product_id && (
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }}>
                            <Typography variant='caption' color='text.secondary'>
                              Product Info
                            </Typography>
                          </Divider>
                          <Box
                            sx={{ mt: 1, mb: 1, display: 'flex', gap: 4, color: 'text.secondary', flexWrap: 'wrap' }}
                          >
                            <Box>
                              <Typography variant='caption' display='block'>
                                Created By
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {product.CREATE_BY || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' display='block'>
                                Created Date
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {product.CREATE_DATE || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' display='block'>
                                Last Update By
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {product.UPDATE_BY || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant='caption' display='block'>
                                Last Update Date
                              </Typography>
                              <Typography variant='body2' fontSize='0.75rem'>
                                {product.UPDATE_DATE || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </RecordCard>
                  ))
                )}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default VendorDetailsModal

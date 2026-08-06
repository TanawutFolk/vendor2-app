// React Imports
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'

// MUI Imports
import { Grid, Card, CardContent, Button, Typography, Divider, Box, CircularProgress } from '@mui/material'

// Third-party Imports
import { zodResolver } from '@hookform/resolvers/zod'

// My Validate Schema Imports
import type { FormDataPage } from './validationSchema'
import { defaultAddVendorValues, validationSchemaPage } from './validationSchema'

// _template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Section Components
import { SectionCheck, SectionProfile, SectionContacts, SectionProducts } from './AddVendorSections'

// Modal Components
import ConfirmModal from '@components/ConfirmModal'

// React Query Imports
import { useCreateVendor } from '@/_workspace/react-query/hooks/useAddVendor'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// My Components Imports
import { breadcrumbNavigation, MENU_NAME } from './env'

function Page() {
  // States
  const [isVerified, setIsVerified] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)

  // #region react-hook-form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: {
      ...defaultAddVendorValues,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ADMIN'
    },
    mode: 'onChange'
  })

  const { handleSubmit, reset, getValues } = reactHookFormMethods

  // #endregion react-hook-form

  // react-query
  const { mutate: saveVendor, isPending: isSaving } = useCreateVendor(
    (data: any) => {
      setConfirmModal(false)

      if (data?.Status) {
        ToastMessageSuccess({ title: 'Add Vendor', message: 'Vendor added successfully' })
        handleReset()
      } else {
        ToastMessageError({ title: 'Add Vendor', message: data?.Message || 'Failed to create vendor' })
      }
    },
    (error: any) => {
      ToastMessageError({ title: 'Add Vendor', message: error?.message || 'Failed to create vendor' })
      setConfirmModal(false)
    }
  )

  // Function
  const handleVerifyChange = (verified: boolean) => {
    setIsVerified(verified)
  }

  const handleReset = () => {
    reset({
      ...defaultAddVendorValues,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ADMIN'
    })
    setIsVerified(false)
    setConfirmModal(false)
  }

  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setConfirmModal(true)
  }

  const handleAdd = () => {
    setConfirmModal(false)

    const dataItem = {
      company_name: getValues('company_name'),
      province: getValues('province'),
      postal_code: getValues('postal_code'),
      country: getValues('country'),
      vendor_type_id: getValues('vendor_type')?.value || 0,
      vendor_region: getValues('vendor_region'),
      website: getValues('website'),
      tel_center: getValues('tel_center'),
      emailmain: getValues('emailmain'),
      address: getValues('address'),
      note: getValues('note'),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'SYSTEM',
      contacts: getValues('contacts').map(c => ({
        contact_name: c.contact_name,
        tel_phone: c.tel_phone,
        email: c.email,
        position: c.position
      })),
      // Every product field is optional, so a row the user never touched is valid but
      // meaningless — drop it instead of inserting a blank vendor_products row.
      products: getValues('products')
        .filter(p =>
          Boolean(p.product_group?.value || p.maker_name?.trim() || p.product_name?.trim() || p.model_list?.trim())
        )
        .map(p => ({
          product_group_id: p.product_group?.value,
          maker_name: p.maker_name,
          product_name: p.product_name,
          model_list: p.model_list
            ? p.model_list
                .split('\n')
                .map(m => m.trim())
                .filter(m => m)
                .join(', ')
            : ''
        }))
    }

    saveVendor(dataItem)
  }

  const isSectionsDisabled = !isVerified

  return (
    <>
      <Grid container spacing={6}>
        <FormProvider {...reactHookFormMethods}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
          </Grid>

          {/* All Sections in Single Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                {/* Section 1: Check */}
                <Typography variant='h5' sx={{ mb: 3 }}>
                  1. Check Vendor Duplicate
                </Typography>
                <SectionCheck onVerifyChange={handleVerifyChange} isVerified={isVerified} />

                <Divider sx={{ my: 4 }} />

                {/* Section 2: Profile */}
                <Box sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                  <Typography variant='h5' sx={{ mb: 3 }}>
                    2. Vendor Profile
                  </Typography>
                  <SectionProfile isDisabled={isSectionsDisabled} />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Section 3: Contacts */}
                <Box sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                  <Typography variant='h5' sx={{ mb: 3 }}>
                    3. Contacts
                  </Typography>
                  <SectionContacts isDisabled={isSectionsDisabled} />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Section 4: Products */}
                <Box sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                  <Typography variant='h5' sx={{ mb: 3 }}>
                    4. Products
                  </Typography>
                  <SectionProducts isDisabled={isSectionsDisabled} />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant='contained'
                    color='primary'
                    size='large'
                    disabled={isSaving || isSectionsDisabled}
                    startIcon={isSaving ? <CircularProgress size={16} /> : null}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {isSaving ? 'Saving...' : 'Add Vendor Information'}
                  </Button>
                  <Button variant='tonal' color='secondary' onClick={handleReset} disabled={isSaving}>
                    Cancel / Reset
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </FormProvider>

        {/* Modals */}
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleAdd}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
          isLoading={isSaving}
        />
      </Grid>
    </>
  )
}

export default Page

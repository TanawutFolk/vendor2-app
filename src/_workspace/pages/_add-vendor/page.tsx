// React Imports
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'

// MUI Imports
import { Grid, Card, CardContent, Button, Typography, Divider, Box, CircularProgress } from '@mui/material'

// Third-party Imports
import { zodResolver } from '@hookform/resolvers/zod'

// Template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Section Components
import SectionCheck from './SectionCheck'
import SectionProfile from './SectionProfile'
import SectionContacts from './SectionContacts'
import SectionProducts from './SectionProducts'

// Modal Components
import ConfirmModal from '@components/ConfirmModal'
import SuccessModal from './modal/SuccessModal'
import ErrorModal from './modal/ErrorModal'

// React Query Imports
import { useCreate } from '@_workspace/react-query/hooks/vendor/useCreateVendor'

// Schema & Types
import { AddVendorSchema, defaultAddVendorValues } from './validateSchema'
import type { AddVendorFormData } from './validateSchema'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Env Imports
import { MENU_NAME, breadcrumbNavigation } from './env'

const AddVendorPage = () => {
    // States
    const [isVerified, setIsVerified] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [successModal, setSuccessModal] = useState(false)
    const [successVendorId, setSuccessVendorId] = useState<number | undefined>(undefined)
    const [successVendorData, setSuccessVendorData] = useState<AddVendorFormData | undefined>(undefined)
    const [errorModal, setErrorModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')

    // Hooks : react-hook-form
    const methods = useForm<AddVendorFormData>({
        resolver: zodResolver(AddVendorSchema),
        defaultValues: {
            ...defaultAddVendorValues,
            CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ADMIN'
        },
        mode: 'onChange'
    })

    const { handleSubmit, reset, getValues } = methods

    // Hooks : React Query - Create Vendor
    const { mutate: saveVendor, isPending: isSaving } = useCreate(
        (response: any) => {
            const result = response.data || response
            setConfirmModal(false)
            if (result.Status) {
                setSuccessVendorId(result.vendorId)
                setSuccessVendorData(getValues())
                setSuccessModal(true)
            } else {
                setErrorMessage(result.Message || 'Failed to create vendor')
                setErrorModal(true)
            }
        },
        (error: Error) => {
            setConfirmModal(false)
            setErrorMessage(`Failed to create vendor: ${error?.message}`)
            setErrorModal(true)
        }
    )

    // Functions
    const handleVerifyChange = (verified: boolean, errorMsg?: string) => {
        setIsVerified(verified)
        if (errorMsg) {
            setErrorMessage(errorMsg)
            setErrorModal(true)
        }
    }

    const handleReset = () => {
        reset({
            ...defaultAddVendorValues,
            CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ADMIN'
        })
        setIsVerified(false)
        setConfirmModal(false)
        setSuccessModal(false)
        setErrorModal(false)
    }

    const onSubmit: SubmitHandler<AddVendorFormData> = () => {
        setConfirmModal(true)
    }

    const handleConfirmSave = () => {
        setConfirmModal(false)
        const dataItem = {
            company_name: getValues('company_name'),
            province: getValues('province'),
            postal_code: getValues('postal_code'),
            vendor_type_id: getValues('vendor_type')?.value || 0,
            website: getValues('website'),
            tel_center: getValues('tel_center'),
            address: getValues('address'),
            note: getValues('note'),
            CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ADMIN',
            contacts: getValues('contacts').map(c => ({
                contact_name: c.contact_name,
                tel_phone: c.tel_phone,
                email: c.email,
                position: c.position
            })),
            products: getValues('products').map(p => ({
                product_group_id: p.product_group?.value || 0,
                maker_name: p.maker_name,
                product_name: p.product_name,
                model_list: p.model_list ? p.model_list.split('\n').map(m => m.trim()).filter(m => m).join(', ') : ''
            }))
        }
        saveVendor(dataItem)
    }

    const isSectionsDisabled = !isVerified

    return (
        <>
            <Grid container spacing={6}>
                <FormProvider {...methods}>
                    {/* Header */}
                    <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                        <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
                    </Grid>

                    {/* All Sections in Single Card */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                {/* Section 1: Check */}
                                <Typography variant='h5' sx={{ mb: 3 }}>1. Check Vendor Duplicate</Typography>
                                <SectionCheck onVerifyChange={handleVerifyChange} isVerified={isVerified} />

                                <Divider sx={{ my: 4 }} />

                                {/* Section 2: Profile */}
                                <Box sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                                    <Typography variant='h5' sx={{ mb: 3 }}>2. Vendor Profile</Typography>
                                    <SectionProfile isDisabled={isSectionsDisabled} />
                                </Box>

                                <Divider sx={{ my: 4 }} />

                                {/* Section 3: Contacts */}
                                <Box sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                                    <Typography variant='h5' sx={{ mb: 3 }}>3. Contacts</Typography>
                                    <SectionContacts isDisabled={isSectionsDisabled} />
                                </Box>

                                <Divider sx={{ my: 4 }} />

                                {/* Section 4: Products */}
                                <Box sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                                    <Typography variant='h5' sx={{ mb: 3 }}>4. Products</Typography>
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
                    onConfirmClick={handleConfirmSave}
                    onCloseClick={() => setConfirmModal(false)}
                    isDelete={false}
                    isLoading={isSaving}
                />
                <SuccessModal
                    show={successModal}
                    title='Saved Successfully!'
                    message='New vendor information has been added.'
                    vendorId={successVendorId}
                    vendorData={successVendorData}
                    onCloseClick={() => { setSuccessModal(false); handleReset(); }}
                />
                <ErrorModal
                    show={errorModal}
                    title='This vendor is already in the system.'
                    message='Please check the vendor name and try again.'
                    onCloseClick={() => setErrorModal(false)}
                />
            </Grid>
        </>
    )
}

export default AddVendorPage

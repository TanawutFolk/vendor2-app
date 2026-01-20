// React Imports
import { useState } from 'react'

// MUI Imports
import {
    Grid,
    Card,
    CardHeader,
    CardContent,
    Divider,
    Button,
    Box,
    CircularProgress,
    Breadcrumbs,
    Typography
} from '@mui/material'

// Third-party Imports
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Schema & Types
import { AddVendorSchema, defaultAddVendorValues } from './validateSchema'
import type { AddVendorFormData } from './validateSchema'

// Components Imports
import SectionCheck from './SectionCheck'
import SectionProfile from './SectionProfile'
import SectionContacts from './SectionContacts'
import SectionProducts from './SectionProducts'
import ConfirmModal from '@components/ConfirmModal'
import SuccessModal from './modal/SuccessModal'
import ErrorModal from './modal/ErrorModal'

// React Query Imports
import { useCreateVendor } from '@_workspace/react-query/hooks/vendor/useCreateVendor'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Env Imports
import { MENU_NAME, breadcrumbNavigation } from './env'

const AddVendorPage = () => {
    // States
    const [isVerified, setIsVerified] = useState(false)
    const [verifyError, setVerifyError] = useState<string | null>(null)
    const [confirmModal, setConfirmModal] = useState(false)

    // States : Success/Error Modals
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
    const { mutate: saveVendor, isPending: isSaving } = useCreateVendor(
        data => {
            setConfirmModal(false)
            if (data.Status) {
                setSuccessVendorId(data.vendorId)
                setSuccessVendorData(getValues())
                setSuccessModal(true)
            } else {
                setErrorMessage(data.Message || 'Failed to create vendor')
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
        setVerifyError(errorMsg || null)
        if (errorMsg) {
            setErrorMessage(errorMsg)
            setErrorModal(true)
        }
    }

    const handleReset = () => {
        reset({
            ...defaultAddVendorValues,
            CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ติดต่อ S524'
        })
        setIsVerified(false)
        setVerifyError(null)
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
            CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'ถ้าคุณเห็นข้อความนี้ ติดต่อ S524',
            contacts: getValues('contacts').map(c => ({
                seller_name: c.seller_name,
                tel_phone: c.tel_phone,
                email: c.email,
                position: c.position
            })),
            products: getValues('products').map(p => ({
                product_group_id: p.product_group?.value || 0,
                maker_name: p.maker_name,
                product_name: p.product_name,
                // Convert newlines to comma ใส่ , ระหว่างข้อมูล 
                model_list: p.model_list
                    ? p.model_list.split('\n').map(m => m.trim()).filter(m => m).join(', ')
                    : ''
            }))
        }

        saveVendor(dataItem)
    }

    const handleSuccessClose = () => {
        setSuccessModal(false)
        handleReset()
    }

    const handleErrorClose = () => {
        setErrorModal(false)
    }

    const isSectionsDisabled = !isVerified

    // Breadcrumbs
    const breadcrumbs = breadcrumbNavigation.map((item, index) => (
        <Typography
            key={index}
            sx={{
                color:
                    index === breadcrumbNavigation.length - 1
                        ? 'var(--mui-palette-text-primary) !important'
                        : 'var(--mui-palette-text-secondary) !important'
            }}
        >
            {item.title}
        </Typography>
    ))

    return (
        <Grid container spacing={6}>
            <FormProvider {...methods}>
                {/* Header Section */}
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography variant='h4'>{MENU_NAME}</Typography>
                    <Divider orientation='vertical' flexItem />
                    <Breadcrumbs separator='›' aria-label='breadcrumb' sx={{ display: 'inline-block' }}>
                        {breadcrumbs}
                    </Breadcrumbs>
                </Grid>

                {/* Section 1: Check */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader title='1. Check Vendor Duplicate' titleTypographyProps={{ variant: 'h5' }} />
                        <Divider />
                        <CardContent>
                            <SectionCheck
                                onVerifyChange={handleVerifyChange}
                                isVerified={isVerified}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Section 2: Profile */}
                <Grid item xs={12}>
                    <Card sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                        <CardHeader title='2. Vendor Profile' titleTypographyProps={{ variant: 'h5' }} />
                        <Divider />
                        <CardContent>
                            <SectionProfile isDisabled={isSectionsDisabled} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Section 3: Contacts */}
                <Grid item xs={12}>
                    <Card sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                        <CardHeader title='3. Contacts' titleTypographyProps={{ variant: 'h5' }} />
                        <Divider />
                        <CardContent>
                            <SectionContacts isDisabled={isSectionsDisabled} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Section 4: Products */}
                <Grid item xs={12}>
                    <Card sx={{ opacity: isSectionsDisabled ? 0.6 : 1 }}>
                        <CardHeader title='4. Products' titleTypographyProps={{ variant: 'h5' }} />
                        <Divider />
                        <CardContent>
                            <SectionProducts isDisabled={isSectionsDisabled} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Actions */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                        <Button
                            variant='contained'
                            color='primary'
                            size='large'
                            disabled={isSaving || isSectionsDisabled}
                            startIcon={isSaving ? <CircularProgress size={16} color='primary' /> : null}
                            onClick={handleSubmit(onSubmit)}
                        >
                            {isSaving ? 'Saving...' : 'Add Vendor Information'}
                        </Button>
                        <Button variant='tonal' color='secondary' onClick={handleReset} disabled={isSaving}>
                            Cancel / Reset
                        </Button>
                    </Box>
                </Grid>
            </FormProvider>

            {/* Confirm Modal */}
            <ConfirmModal
                show={confirmModal}
                onConfirmClick={handleConfirmSave}
                onCloseClick={() => setConfirmModal(false)}
                isDelete={false}
                isLoading={isSaving}
            />

            {/* Success Modal */}
            <SuccessModal
                show={successModal}
                title='บันทึกสำเร็จ!'
                message='เพิ่มข้อมูล Vendor ใหม่เรียบร้อยแล้ว'
                vendorId={successVendorId}
                vendorData={successVendorData}
                onCloseClick={handleSuccessClose}
            />

            {/* Error Modal */}
            <ErrorModal
                show={errorModal}
                title='This vendor is already in the system.'
                message={"Please check the vendor name and try again. Or Edit Menu."}
                onCloseClick={handleErrorClose}
            />
        </Grid>
    )
}

export default AddVendorPage

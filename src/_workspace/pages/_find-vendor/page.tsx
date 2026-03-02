// MUI Imports
import Grid from '@mui/material/Grid'

// React-Hook-Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party Imports
import { useUpdateEffect } from 'react-use'


// Components Imports
import SkeletonCustom from '@components/SkeletonCustom'

// _template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

import type { FindVendorFormData } from './validateSchema'
import { FindVendorSchema, fetchDefaultValues } from './validateSchema'

// My Components Imports
import { breadcrumbNavigation, MENU_NAME } from './env'
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'

function Page() {
    return (
        <DxProvider>
            <InnerApp />
        </DxProvider>
    )
}



const InnerApp = () => {
    // DxContext — trigger initial fetch after form default values load
    const { setIsEnableFetching } = useDxContext()
    // React Hook Form
    const reactHookFormMethods = useForm<FindVendorFormData>({
        resolver: zodResolver(FindVendorSchema),
        defaultValues: fetchDefaultValues
    })

    const { control } = reactHookFormMethods

    const { isLoading: isLoadingReactHookForm } = useFormState({
        control: control
    })

    // Fetch data after initial defaultValues finish loading — same as manufacturing-item & sct-for-product
    useUpdateEffect(() => {
        setIsEnableFetching(true)
    }, [isLoadingReactHookForm])


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
                    <Grid item xs={12}>
                        <SearchFilter />
                    </Grid>
                    <Grid item xs={12}>
                        {isLoadingReactHookForm ? (
                            <SkeletonCustom />
                        ) : (
                            <SearchResult />
                        )}
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    )
}

export default Page

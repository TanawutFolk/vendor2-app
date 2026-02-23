// MUI Imports
import Grid from '@mui/material/Grid'

// React-Hook-Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party Imports
import { useUpdateEffect } from 'react-use'

// react-query Imports
import { useQueryClient } from '@tanstack/react-query'

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
import { PREFIX_QUERY_KEY } from '@_workspace/react-query/hooks/vendor/useFindVendor'

function Page() {
    return <InnerApp />
}



const InnerApp = () => {
    // React Hook Form
    const reactHookFormMethods = useForm<FindVendorFormData>({
        resolver: zodResolver(FindVendorSchema),
        defaultValues: fetchDefaultValues
    })

    const queryClient = useQueryClient()

    const { control } = reactHookFormMethods

    const { isLoading: isLoadingReactHookForm } = useFormState({
        control: control
    })

    // Auto-fetch when form is ready (loading finishes)
    useUpdateEffect(() => {
        queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
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

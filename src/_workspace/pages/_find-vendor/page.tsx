'use client'

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
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// React Query Hooks
import { useFindVendor } from '@_workspace/react-query/hooks/vendor/useFindVendor'

// My Validate Schema Imports
import type { FindVendorFormData } from './validateSchema'
import { FindVendorSchema, defaultFindVendorValues } from './validateSchema'

// My Components Imports
import { breadcrumbNavigation, MENU_NAME } from './env'
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'

function Page() {
    return (
        <DxProvider>
            <InnerApp />
        </DxProvider>
    )
}

const InnerApp = () => {
    // DxContext
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    // React Hook Form
    const reactHookFormMethods = useForm<FindVendorFormData>({
        resolver: zodResolver(FindVendorSchema),
        defaultValues: defaultFindVendorValues
    })

    const { control, getValues } = reactHookFormMethods

    const { isLoading: isLoadingReactHookForm } = useFormState({
        control: control
    })

    // Build search params from form values
    const searchFilters = getValues('searchFilters')
    const searchParams = {
        company_name: searchFilters.company_name || '',
        vendor_type_id: searchFilters.vendor_type_id || undefined,
        province: searchFilters.province || '',
        status: searchFilters.status?.value || '',
        Start: 0,
        Limit: 100
    }

    // React Query - Search Vendors (enabled: true to auto-search on load)
    const { data: vendorData, isLoading: isSearching, refetch } = useFindVendor(searchParams, true)

    // Fetch data after initial defaultValues react-hook-form
    useUpdateEffect(() => {
        refetch()
    }, [isLoadingReactHookForm])

    // Reset fetching state after data is loaded
    useUpdateEffect(() => {
        if (!isSearching && isEnableFetching) {
            setIsEnableFetching(false)
        }
    }, [isSearching])

    // Handle search
    const handleSearch = () => {
        setIsEnableFetching(true)
        refetch()
    }

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
                        <SearchFilter onSearch={handleSearch} />
                    </Grid>
                    <Grid item xs={12}>
                        {isLoadingReactHookForm ? (
                            <SkeletonCustom />
                        ) : (
                            <SearchResult
                                data={vendorData?.ResultOnDb || []}
                                isLoading={isSearching}
                            />
                        )}
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    )
}

export default Page

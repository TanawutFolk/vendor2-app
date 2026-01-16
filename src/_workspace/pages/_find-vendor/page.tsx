'use client'

// MUI Imports
import Grid from '@mui/material/Grid'

// React Imports
import { useState } from 'react'

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
    // State for active search filters (updated on Search click)
    const [activeSearchFilters, setActiveSearchFilters] = useState<any>(defaultFindVendorValues.searchFilters)

    // Handle search
    const handleSearch = () => {
        const filters = getValues('searchFilters')
        setActiveSearchFilters({ ...filters })
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
                                searchFilters={activeSearchFilters}
                            />
                        )}
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    )
}

export default Page

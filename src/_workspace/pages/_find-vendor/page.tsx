// MUI Imports
import Grid from '@mui/material/Grid'
import { Breadcrumbs, Divider, Typography } from '@mui/material'

// React Imports
import { useState } from 'react'
import dayjs from 'dayjs'

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

// Services Imports
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'

// Types Imports
import type { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'
import AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import type { FindVendorFormData } from './validateSchema'
import { FindVendorSchema, defaultFindVendorValues } from './validateSchema'

// My Components Imports
import { breadcrumbNavigation, MENU_NAME, MENU_ID } from './env'
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'

function Page() {
    return (
        <DxProvider>
            <InnerApp />
        </DxProvider>
    )
}

const getUrlParamSearch = ({ USER_ID, APPLICATION_ID, MENU_ID }: UserProfileSettingProgramI): string => {
    let params = ``

    params += `"USER_ID":"${USER_ID}"`
    params += `, "APPLICATION_ID":"${APPLICATION_ID}"`
    params += `, "MENU_ID":"${MENU_ID}"`

    params = `{${params}}`

    return params
}

const paramForSearch: UserProfileSettingProgramI = {
    USER_ID: Number(getUserData().USER_ID),
    APPLICATION_ID: Number(import.meta.env.VITE_APPLICATION_ID),
    MENU_ID: MENU_ID
}

// Columns definition for difference calculation (matching SearchResult fields)
const columns = [
    'actions',
    'company_name',
    'status_check',
    'prones_code',
    'vendor_type_name',
    'province',
    'website',
    'address',
    'tel_center',
    'group_name',
    'maker_name',
    'product_name',
    'model_list',
    'contact_name',
    'tel_phone',
    'email',
    'CREATE_BY',
    'UPDATE_BY',
    'CREATE_DATE',
    'UPDATE_DATE'
]

const InnerApp = () => {
    // DxContext
    const { isEnableFetching, setIsEnableFetching } = useDxContext()

    // React Hook Form
    const reactHookFormMethods = useForm<FindVendorFormData>({
        resolver: zodResolver(FindVendorSchema),
        defaultValues: async (): Promise<FindVendorFormData> => {
            try {
                const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
                    AxiosResponseI<UserProfileSettingProgramI<FindVendorFormData>>
                >(getUrlParamSearch(paramForSearch))

                if (!result?.data?.Status || !result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA) {
                    return defaultFindVendorValues
                }

                const savedData = result.data.ResultOnDb[0].USER_PROFILE_SETTING_PROGRAM_DATA

                // Validate and merge saved data with defaults
                return {
                    searchFilters: {
                        ...defaultFindVendorValues.searchFilters,
                        ...savedData.searchFilters,
                        // Ensure nulls are handled if API returns undefined for nullable fields
                        vendor_type_id: savedData.searchFilters.vendor_type_id || null,
                        province: savedData.searchFilters.province || null,
                        product_group_id: savedData.searchFilters.product_group_id || null,
                        status: savedData.searchFilters.status || null,
                        inuse: savedData.searchFilters.inuse || null
                    },
                    searchResults: {
                        ...defaultFindVendorValues.searchResults,
                        ...savedData.searchResults,
                        // Ensure arrays are initialized
                        columnFilters: savedData.searchResults.columnFilters || [],
                        sorting: savedData.searchResults.sorting || [],
                        columnOrder: savedData.searchResults.columnOrder || columns
                    }
                }
            } catch (error) {
                console.error('Failed to load user settings', error)
                return defaultFindVendorValues
            }
        }
    })

    const { control, getValues } = reactHookFormMethods

    const { isLoading: isLoadingReactHookForm } = useFormState({
        control: control
    })

    // Auto-fetch when form is ready (loading finishes)
    useUpdateEffect(() => {
        setIsEnableFetching(true)
    }, [isLoadingReactHookForm])

    // Handle search button click
    const handleSearch = () => {
        setIsEnableFetching(true)
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
                            <SearchResult />
                        )}
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    )
}

export default Page

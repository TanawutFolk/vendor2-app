// MUI Imports
import { Grid } from '@mui/material'

// React-Hook-Form Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Third-party Imports
import { useUpdateEffect } from 'react-use'

// Components Imports
import SkeletonCustom from '@components/SkeletonCustom'

// Template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'

// Schema & Env
import type { RequestRegisterFormData } from './validateSchema'
import { RequestRegisterSchema, fetchDefaultValues } from './validateSchema'
import { MENU_NAME, breadcrumbNavigation } from './env'

// Component Imports
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'

// ─────────────────────────────────────────────────────────────────────────────
// Page (wraps with DxProvider)
// ─────────────────────────────────────────────────────────────────────────────
function Page() {
    return (
        <DxProvider>
            <InnerApp />
        </DxProvider>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner App (has access to DxContext + FormProvider)
// ─────────────────────────────────────────────────────────────────────────────
const InnerApp = () => {
    const { setIsEnableFetching } = useDxContext()

    const reactHookFormMethods = useForm<RequestRegisterFormData>({
        resolver: zodResolver(RequestRegisterSchema),
        defaultValues: fetchDefaultValues
    })

    const { control } = reactHookFormMethods
    const { isLoading: isLoadingReactHookForm } = useFormState({ control })

    // Trigger initial fetch after async defaultValues finish loading
    useUpdateEffect(() => {
        setIsEnableFetching(true)
    }, [isLoadingReactHookForm])

    return (
        <FormProvider {...reactHookFormMethods}>
            <Grid container spacing={6}>
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
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
            </Grid>
        </FormProvider>
    )
}

export default Page

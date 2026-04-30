import { Grid } from '@mui/material'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'

import SkeletonCustom from '@components/SkeletonCustom'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import { MENU_NAME, breadcrumbNavigation } from './env'
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'
import { AccRegisterSchema, fetchDefaultValues, type AccRegisterFormData } from './validateSchema'

export default function AccRegisterPage() {
    return (
        <DxProvider>
            <InnerApp />
        </DxProvider>
    )
}

const InnerApp = () => {
    const { setIsEnableFetching } = useDxContext()

    const reactHookFormMethods = useForm<AccRegisterFormData>({
        resolver: zodResolver(AccRegisterSchema),
        defaultValues: fetchDefaultValues,
    })

    const { control } = reactHookFormMethods
    const { isLoading: isLoadingReactHookForm } = useFormState({ control })

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
                    {isLoadingReactHookForm ? <SkeletonCustom /> : <SearchResult />}
                </Grid>
            </Grid>
        </FormProvider>
    )
}

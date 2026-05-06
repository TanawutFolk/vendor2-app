import Grid from '@mui/material/Grid'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateEffect } from 'react-use'

import SkeletonCustom from '@components/SkeletonCustom'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import type { ReRegisterFormData } from './validateSchema'
import { ReRegisterSchema, fetchDefaultValues } from './validateSchema'
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
    const { setIsEnableFetching } = useDxContext()
    const reactHookFormMethods = useForm<ReRegisterFormData>({
        resolver: zodResolver(ReRegisterSchema),
        defaultValues: fetchDefaultValues
    })

    const { control } = reactHookFormMethods
    const { isLoading: isLoadingReactHookForm } = useFormState({ control })

    useUpdateEffect(() => {
        setIsEnableFetching(true)
    }, [isLoadingReactHookForm])

    return (
        <Grid container spacing={6}>
            <FormProvider {...reactHookFormMethods}>
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
                </Grid>
                <Grid item xs={12}>
                    <SearchFilter />
                </Grid>
                <Grid item xs={12}>
                    {isLoadingReactHookForm ? <SkeletonCustom /> : <SearchResult />}
                </Grid>
            </FormProvider>
        </Grid>
    )
}

export default Page

import { Grid } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { MENU_NAME, breadcrumbNavigation } from './env'
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'
import { ApprovalGprCSchema, fetchDefaultValues, type ApprovalGprCFormData } from './validateSchema'

export default function ApprovalGprCPage() {
    const reactHookFormMethods = useForm<ApprovalGprCFormData>({
        resolver: zodResolver(ApprovalGprCSchema),
        defaultValues: fetchDefaultValues,
    })

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
                    <SearchResult />
                </Grid>
            </Grid>
        </FormProvider>
    )
}

import { Grid } from '@mui/material'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { MENU_NAME, breadcrumbNavigation } from './env'
import ApprovalPageContent from '@_workspace/pages/_shared/SearchResult'

export default function MdApprovalPage() {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            </Grid>
            <Grid item xs={12}>
                <ApprovalPageContent
                    pageTitle='MD Approval'
                    queueStepCode='MD_APPROVAL'
                    accentColor='#28C76F'
                    showSelectionSheetReadOnly
                />
            </Grid>
        </Grid>
    )
}

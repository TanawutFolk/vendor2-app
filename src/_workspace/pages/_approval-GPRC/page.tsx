import { Alert, Grid } from '@mui/material'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import ApprovalPageContent from '@_workspace/pages/_shared/ApprovalPageContent'
import { MENU_NAME, breadcrumbNavigation } from './env'

export default function ApprovalGprCPage() {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            </Grid>

            <Grid item xs={12}>
                <Alert severity='info' sx={{ mb: 2 }}>
                    This queue is for GPR C approvers selected by requester. Open Request Details to review GPR C context,
                    action logs, and approval history before deciding.
                </Alert>
                <ApprovalPageContent
                    pageTitle='Approval GPR C'
                    queueStepCode='ISSUE_GPR_C'
                    accentColor='#00B8D9'
                />
            </Grid>
        </Grid>
    )
}

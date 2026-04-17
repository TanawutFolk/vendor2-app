import { Grid } from '@mui/material'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { MENU_NAME, breadcrumbNavigation } from './env'
import ApprovalPageContent from '@_workspace/pages/_shared/ApprovalPageContent'

export default function PoMgrApprovalPage() {
    return (
        <Grid container spacing={6}>
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            </Grid>
            <Grid item xs={12}>
                <ApprovalPageContent
                    pageTitle='PO Mgr Approval'
                    accentColor='#7367F0'
                />
            </Grid>
        </Grid>
    )
}

import type { ColDef, IServerSideDatasource } from 'ag-grid-community'
import type { ButtonProps } from '@mui/material'

export interface SearchResultSectionProps {
    columnDefs: ColDef[]
    datasource: IServerSideDatasource
    onGridReady: (params: any) => void
    detailCellRenderer: any
    detailRowHeight: number
    context: Record<string, any>
    initialState: any
    onStateUpdated: (event: any) => void
}

export type WorkflowActionColor = Extract<ButtonProps['color'], 'success' | 'warning' | 'error'>

export interface NegotiationAction {
    key: 'agree' | 'disagree'
    label: string
    color: WorkflowActionColor
    nextStatus: string
    isFinalStep: boolean
}

export interface ActionDialogProps {
    open: boolean
    mode: 'approve' | 'reject'
    actions: Array<{
        requestId: number
        nextStatus: string
        isFinalStep: boolean
        approveActionLabel?: string
        rejectActionLabel?: string
    }>
    approveActionLabel: string
    rejectActionLabel: string
    onClose: () => void
    onSuccess: () => void
}

export interface DetailPanelProps {
    data: any
    empCode: string | undefined
    queueStepCode?: string
    showSelectionSheetReadOnly?: boolean
    onApprove: (nextStatus: string, isFinalStep: boolean, approveActionLabel: string) => void
    onReject: (rejectActionLabel: string) => void
    onRefresh: () => void
    // Silent refresh after saving a sub-form (e.g. Selection Sheet): re-fetches
    // this request's detail in place without closing the detail dialog, unlike
    // onRefresh which is for terminal actions (approve/reject/complete).
    onDetailRefresh?: () => void
}

export interface ApprovalPageContentProps {
    pageTitle: string
    queueStepCode?: string
    accentColor?: string
    showSelectionSheetReadOnly?: boolean
}

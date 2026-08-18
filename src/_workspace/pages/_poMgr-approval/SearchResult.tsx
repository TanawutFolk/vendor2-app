// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowStepTypeIdentity from '@/_workspace/hooks/useWorkflowStepTypeIdentity'

function SearchResult() {
  const { workflowStepTypeIds } = useWorkflowStepTypeIdentity()

  return (
    <ApprovalPageContent
      pageTitle='PO Mgr Approval'
      queueWorkflowStepTypeId={workflowStepTypeIds.PO_MGR_APPROVAL}
      accentColor='#7367F0'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'

function SearchResult() {
  const { workflowStepIds } = useWorkflowIdentity()

  return (
    <ApprovalPageContent
      pageTitle='PO Mgr Approval'
      queueWorkflowStepMasterId={workflowStepIds.PO_MGR_APPROVAL}
      accentColor='#7367F0'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

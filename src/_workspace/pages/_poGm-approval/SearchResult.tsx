// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'

function SearchResult() {
  const { workflowStepIds } = useWorkflowIdentity()

  return (
    <ApprovalPageContent
      pageTitle='PO GM Approval'
      queueWorkflowStepMasterId={workflowStepIds.PO_GM_APPROVAL}
      accentColor='#FF9F43'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

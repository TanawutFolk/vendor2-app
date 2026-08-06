// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'

function SearchResult() {
  const { workflowStepIds } = useWorkflowIdentity()

  return (
    <ApprovalPageContent
      pageTitle='Account Register Vendor'
      queueWorkflowStepMasterId={workflowStepIds.ACCOUNT_REGISTERED}
      accentColor='#28C76F'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

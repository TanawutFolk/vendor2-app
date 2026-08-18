// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowStepTypeIdentity from '@/_workspace/hooks/useWorkflowStepTypeIdentity'

function SearchResult() {
  const { workflowStepTypeIds } = useWorkflowStepTypeIdentity()

  return (
    <ApprovalPageContent
      pageTitle='Account Register Vendor'
      queueWorkflowStepTypeId={workflowStepTypeIds.ACCOUNT_REGISTERED}
      accentColor='#28C76F'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'

function SearchResult() {
  const { workflowStepIds } = useWorkflowIdentity()

  return (
    <ApprovalPageContent
      pageTitle='MD Approval'
      queueWorkflowStepMasterId={workflowStepIds.MD_APPROVAL}
      accentColor='#28C76F'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

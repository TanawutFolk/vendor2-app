// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowStepTypeIdentity from '@/_workspace/hooks/useWorkflowStepTypeIdentity'

function SearchResult() {
  const { workflowStepTypeIds } = useWorkflowStepTypeIdentity()

  return (
    <ApprovalPageContent
      pageTitle='MD Approval'
      queueWorkflowStepTypeId={workflowStepTypeIds.MD_APPROVAL}
      accentColor='#28C76F'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

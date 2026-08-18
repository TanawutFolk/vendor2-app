// Components Imports
import ApprovalPageContent from '@/_workspace/pages/_check-document/components/ApprovalPageContent'
import useWorkflowStepTypeIdentity from '@/_workspace/hooks/useWorkflowStepTypeIdentity'

function SearchResult() {
  const { workflowStepTypeIds } = useWorkflowStepTypeIdentity()

  return (
    <ApprovalPageContent
      pageTitle='PO GM Approval'
      queueWorkflowStepTypeId={workflowStepTypeIds.PO_GM_APPROVAL}
      accentColor='#FF9F43'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

// Components Imports
import ApprovalPageContent from './components/ApprovalPageContent'
import useWorkflowStepTypeIdentity from '@/_workspace/hooks/useWorkflowStepTypeIdentity'

function SearchResult() {
  const { workflowStepTypeIds } = useWorkflowStepTypeIdentity()

  return (
    <ApprovalPageContent
      pageTitle='Check Document Queue'
      queueWorkflowStepTypeId={workflowStepTypeIds.DOC_CHECK}
      accentColor='#00BAD1'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

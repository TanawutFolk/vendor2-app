// Components Imports
import ApprovalPageContent from './components/ApprovalPageContent'
import useWorkflowIdentity from '@/_workspace/hooks/useWorkflowIdentity'

function SearchResult() {
  const { workflowStepIds } = useWorkflowIdentity()

  return (
    <ApprovalPageContent
      pageTitle='Check Document Queue'
      queueWorkflowStepMasterId={workflowStepIds.DOC_CHECK}
      accentColor='#00BAD1'
      showSelectionSheetReadOnly
    />
  )
}

export default SearchResult

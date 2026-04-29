import type { ColDef } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'

interface TaskSearchResultProps {
    filteredRows: any[]
    colDefs: ColDef[]
    loading: boolean
}

const TaskSearchResult = ({
    filteredRows,
    colDefs,
    loading,
}: TaskSearchResultProps) => {
    return (
        <SearchResultCard

        >
            <DxAGgridTable
                rowData={filteredRows}
                columnDefs={colDefs}
                loading={loading}
                pagination={true}
                height={650}
                boxSx={{ p: 2 }}
                overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No task queue found</span>'
                getRowId={(params: any) => String(params.data.request_id)}
            />
        </SearchResultCard>
    )
}

export default TaskSearchResult

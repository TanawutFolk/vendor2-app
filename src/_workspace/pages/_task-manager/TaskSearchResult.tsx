import { Box, Button, CardContent, Chip, Typography } from '@mui/material'
import type { ColDef } from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'

interface TaskSearchResultProps {
    filteredRows: any[]
    colDefs: ColDef[]
    loading: boolean
    onRefresh: () => void
}

const TaskSearchResult = ({
    filteredRows,
    colDefs,
    loading,
    onRefresh,
}: TaskSearchResultProps) => {
    return (
        <SearchResultCard
            action={
                <Button
                    size='small'
                    variant='tonal'
                    startIcon={<i className='tabler-refresh' style={{ fontSize: 16 }} />}
                    onClick={onRefresh}
                >
                    Refresh
                </Button>
            }
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant='subtitle1' fontWeight={700}>
                        Results ({filteredRows.length})
                    </Typography>
                    <Chip label={`${filteredRows.length} rows`} size='small' variant='tonal' color='primary' />
                </Box>
                <DxAGgridTable
                    rowData={filteredRows}
                    columnDefs={colDefs}
                    loading={loading}
                    pagination={true}
                    height={650}
                />
            </CardContent>
        </SearchResultCard>
    )
}

export default TaskSearchResult

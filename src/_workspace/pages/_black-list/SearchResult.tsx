'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Backdrop, Box, Button, CardContent, Chip, CircularProgress, Fade, LinearProgress, Typography } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import type {
    ColDef,
    GetRowIdParams,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
    IServerSideDatasource,
    SortModelItem,
    StateUpdatedEvent,
    ValueFormatterParams,
} from 'ag-grid-community'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import SearchResultCard from '@_workspace/components/search/SearchResultCard'
import { useQueryClient } from '@tanstack/react-query'
import { getBlacklistQueryOptions } from '@_workspace/react-query/hooks/vendor/useBlacklistHooks'
import UploadBlacklistModal from './modal/UploadBlacklistModal'
import type { BlacklistRow, UploadBlacklistPayload } from './types'
import type { BlacklistFormData } from './validateSchema'

const shimmerAnimation = keyframes`
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
`

interface SearchResultProps {
    uploading: boolean
    uploadProgress: number
    onUpload: (payload: UploadBlacklistPayload) => void | Promise<void>
}

type AgGridColumnFilter = {
    column: string
    columnFns?: string
    value: string | string[]
}

type AgGridFilterModelValue = {
    filterType?: 'text' | 'number' | 'date' | 'set'
    type?: string
    filter?: string | number
    dateFrom?: string
    values?: string[]
}

const mapAgGridFilterModelToColumnFilters = (filterModel: Record<string, AgGridFilterModelValue>): AgGridColumnFilter[] => {
    return Object.entries(filterModel || {}).flatMap(([column, model]) => {
        if (!model) {
            return []
        }

        if (model.filterType === 'text' || model.filterType === 'number') {
            if (model.type === 'blank' || model.type === 'notBlank') {
                return []
            }

            return [{
                column,
                columnFns: model.type || 'contains',
                value: String(model.filter ?? ''),
            }]
        }

        if (model.filterType === 'date') {
            return [{
                column,
                columnFns: model.type || 'equals',
                value: String(model.dateFrom ?? ''),
            }]
        }

        if (model.filterType === 'set') {
            return model.values?.length
                ? [{
                    column,
                    value: model.values,
                }]
                : []
        }

        return []
    }).filter((item) => {
        if (Array.isArray(item.value)) {
            return item.value.length > 0
        }

        return String(item.value || '').trim().length > 0
    })
}

const SearchResult = ({ uploading, uploadProgress, onUpload }: SearchResultProps) => {
    const { getValues, setValue } = useFormContext<BlacklistFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    const queryClient = useQueryClient()

    const gridApiRef = useRef<GridApi<BlacklistRow> | null>(null)
    const [openUploadModal, setOpenUploadModal] = useState(false)

    const datasource = useMemo<IServerSideDatasource>(() => ({
        getRows: async (params) => {
            try {
                const { startRow, endRow, sortModel, filterModel } = params.request
                const limit = (endRow ?? 20) - (startRow ?? 0)
                const currentFilters = getValues('searchFilters')

                const payload = {
                    SearchFilters: [
                        { id: 'vendor_name', value: currentFilters.vendor_name || '' },
                        { id: 'group_code', value: currentFilters.group_code === 'ALL' ? '' : currentFilters.group_code },
                    ],
                    ColumnFilters: mapAgGridFilterModelToColumnFilters(filterModel as Record<string, AgGridFilterModelValue>),
                    Order: sortModel && sortModel.length > 0
                        ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
                        : [{ id: 'updated_date', desc: true }],
                    Start: startRow ?? 0,
                    Limit: limit || 20,
                }

                const response = await queryClient.fetchQuery(getBlacklistQueryOptions(payload))

                const result = response?.data

                if (result?.Status) {
                    params.success({
                        rowData: result.ResultOnDb || [],
                        rowCount: result.TotalCountOnDb || 0,
                    })
                    return
                }

                params.fail()
            } catch {
                params.fail()
            }
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [])

    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false)
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])

    const savedGridState = useMemo(() => getValues('searchResults.agGridState'), []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleStateUpdated = useCallback((event: StateUpdatedEvent) => {
        setValue('searchResults.agGridState', event.state, { shouldDirty: false })
    }, [setValue])

    const colDefs = useMemo<ColDef<BlacklistRow>[]>(() => [
        { field: 'blacklist_id', headerName: 'Blacklist ID', width: 130, pinned: 'left', filter: 'agNumberColumnFilter' },
        { field: 'vendor_name', headerName: 'Vendor Name', flex: 1.4, minWidth: 240, pinned: 'left', filter: 'agTextColumnFilter' },
        {
            field: 'group_code',
            headerName: 'Group',
            width: 120,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: ICellRendererParams<BlacklistRow>) => {
                const color = params.value === 'US' ? 'primary' : 'warning'
                return <Chip size='small' label={params.value || '-'} color={color} variant='tonal' />
            },
        },
        { field: 'source_name', headerName: 'Source', flex: 1.6, minWidth: 320, filter: 'agTextColumnFilter', valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => params.value || '-' },
        { field: 'country', headerName: 'Country', width: 220, filter: 'agTextColumnFilter', valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => params.value || '-' },
        { field: 'entity_number', headerName: 'Entity Number', width: 160, filter: 'agTextColumnFilter', valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => params.value || '-' },
        { field: 'entity_type', headerName: 'Type', width: 140, filter: 'agTextColumnFilter', valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => params.value || '-' },
        { field: 'programs', headerName: 'Programs', flex: 1.2, minWidth: 220, filter: 'agTextColumnFilter', valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => params.value || '-' },
        { field: 'wmd_type', headerName: 'WMD', width: 120, filter: 'agTextColumnFilter', valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => params.value || '-' },
        {
            field: 'alias_count',
            headerName: 'Aliases',
            width: 120,
            filter: 'agNumberColumnFilter',
            cellRenderer: (params: ICellRendererParams<BlacklistRow>) => (
                <Chip
                    size='small'
                    label={String(params.value || 0)}
                    color='info'
                    variant='tonal'
                />
            ),
        },
        {
            field: 'in_use',
            headerName: 'Status',
            width: 120,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: ICellRendererParams<BlacklistRow>) => (
                <Chip
                    size='small'
                    label={Number(params.value) === 1 ? 'Active' : 'Inactive'}
                    color={Number(params.value) === 1 ? 'success' : 'default'}
                    variant='tonal'
                />
            ),
        },
        { field: 'update_by', headerName: 'Updated By', width: 150, filter: 'agTextColumnFilter', valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => params.value || '-' },
        {
            field: 'updated_date',
            headerName: 'Updated Date',
            width: 170,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams<BlacklistRow>) => (params.value ? new Date(String(params.value)).toLocaleDateString('th-TH') : '-'),
        },
    ], [])

    return (
        <SearchResultCard
            action={
                <Button
                    size='small'
                    variant='contained'
                    startIcon={<i className='tabler-upload' style={{ fontSize: 16 }} />}
                    onClick={() => setOpenUploadModal(true)}
                >
                    Update Blacklist
                </Button>
            }
        >
            <CardContent>
                <DxAGgridTable
                    columnDefs={colDefs}
                    serverSideDatasource={datasource}
                    height={650}
                    initialState={savedGridState}
                    onStateUpdated={handleStateUpdated}
                    onGridReady={(params: GridReadyEvent) => { gridApiRef.current = params.api }}
                    overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No blacklist vendors found</span>'
                    getRowId={(params: GetRowIdParams<BlacklistRow>) => String(params.data.blacklist_id)}
                />
            </CardContent>

            <UploadBlacklistModal
                open={openUploadModal}
                onClose={() => setOpenUploadModal(false)}
                onSubmit={onUpload}
            />

            <Backdrop
                open={uploading}
                sx={{
                    zIndex: (theme) => theme.zIndex.modal + 1,
                    backgroundColor: 'rgba(15, 23, 42, 0.28)',
                    backdropFilter: 'blur(4px)',
                }}
            >
                <Fade in={uploading}>
                    <Box
                        sx={{
                            minWidth: 320,
                            maxWidth: 380,
                            px: 5,
                            py: 4,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.lightOpacity',
                            }}
                        >
                            <CircularProgress
                                size={30}
                                thickness={4.5}
                                sx={{
                                    color: 'primary.main',
                                }}
                            />
                        </Box>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant='h6' sx={{ mb: 0.5 }}>
                                Updating Blacklist
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                The existing blacklist for this format is being replaced with the latest file.
                            </Typography>
                        </Box>

                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant='caption' color='text.secondary'>
                                    Upload progress
                                </Typography>
                                <Typography variant='caption' fontWeight={700} color='primary.main'>
                                    {uploadProgress}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant='determinate'
                                value={uploadProgress}
                                sx={{
                                    height: 8,
                                    borderRadius: 999,
                                    backgroundColor: 'action.hover',
                                    overflow: 'hidden',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 999,
                                        background: `
                                            linear-gradient(
                                                90deg,
                                                var(--mui-palette-primary-main) 0%,
                                                var(--mui-palette-info-main) 35%,
                                                rgba(255, 255, 255, 0.92) 50%,
                                                var(--mui-palette-info-main) 65%,
                                                var(--mui-palette-primary-main) 100%
                                            )
                                        `,
                                        backgroundSize: '200% 100%',
                                        animation: `${shimmerAnimation} 2s linear infinite`,
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </Fade>
            </Backdrop>
        </SearchResultCard>
    )
}

export default SearchResult

'use client'

import { useState, useCallback, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { AgGridReactProps } from 'ag-grid-react'
import type { ColDef, IServerSideDatasource } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import { Box } from '@mui/material'

// ─── Shared Theme (export so callers can reference it if needed) ──────────────
export const agGridTheme = themeQuartz.withParams({
    spacing: 6,
    columnBorder: { style: 'solid', color: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)' },
    browserColorScheme: 'inherit',
    backgroundColor: 'var(--mui-palette-background-paper)',
    foregroundColor: 'var(--mui-palette-text-primary)',
    headerBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.12)',
    headerTextColor: 'var(--mui-palette-text-primary)',
    oddRowBackgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.04)',
    borderColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
    rowHoverColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.08)'
})

// ─── Default Column Definition (export so callers can reference it) ───────────
export const defaultDxColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: false,
    floatingFilter: false
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface DxAGgridTableProps extends AgGridReactProps {
    /** Grid height (default: 600) */
    height?: number | string

    /** Box wrapper sx override */
    boxSx?: Record<string, any>

    /**
     * SERVER mode: pass serverSideDatasource to use AG Grid Enterprise Server-Side Row Model.
     * The component will automatically set rowModelType='serverSide' and cacheBlockSize.
     */
    serverSideDatasource?: IServerSideDatasource
}

// ─────────────────────────────────────────────────────────────────────────────
// DxAGgridTable — Thin AG Grid wrapper with project defaults
// Callers pass additional AgGridReact props via spread (like DxMRTTable's ...rest)
// ─────────────────────────────────────────────────────────────────────────────
export const DxAGgridTable = ({
    height = 600,
    boxSx,
    serverSideDatasource,
    defaultColDef,
    paginationPageSize = 20,
    paginationPageSizeSelector = [10, 20, 30, 40, 50, 100, 200, 300, 400, 500],
    noRowsOverlayComponent,
    ...rest // ← caller can override ANY AgGridReact prop, same pattern as DxMRTTable's ...rest
}: DxAGgridTableProps) => {

    // If serverSideDatasource is provided → automatically use server-side mode
    const isServerMode = Boolean(serverSideDatasource)

    // Track the active page size so cacheBlockSize exactly matches it (1 call = 1 exact page)
    const [pageSize, setPageSize] = useState(paginationPageSize)

    const handlePaginationChanged = useCallback((e: any) => {
        if (e.newPageSize) {
            const gridPageSize = e.api.paginationGetPageSize()
            if (gridPageSize !== pageSize) {
                setPageSize(gridPageSize)
            }
        }
        if (rest.onPaginationChanged) {
            rest.onPaginationChanged(e)
        }
    }, [pageSize, rest.onPaginationChanged])

    // ── Pre-compute safe default ColDef to prevent re-renders ────────────────
    const mergedDefaultColDef = useMemo(() => {
        return defaultColDef ?? defaultDxColDef
    }, [defaultColDef])

    return (
        <Box sx={{ height, width: '100%', ...boxSx }}>
            <AgGridReact
                // ── Project Defaults ──────────────────────────────────────────
                theme={agGridTheme}
                defaultColDef={mergedDefaultColDef}

                // ── Pagination ────────────────────────────────────────────────
                pagination={true}
                paginationPageSize={pageSize}
                paginationPageSizeSelector={paginationPageSizeSelector}

                // ── UX Defaults ───────────────────────────────────────────────
                rowSelection='single'
                animateRows={true}
                enableCellTextSelection={true}
                copyHeadersToClipboard={true}

                // ── Server-Side Mode (Enterprise) ─────────────────────────────
                rowModelType={isServerMode ? 'serverSide' : 'clientSide'}
                serverSideDatasource={serverSideDatasource}
                // Enforce strict 1 block = 1 page size, dynamically updated when user changes page size
                cacheBlockSize={isServerMode ? pageSize : undefined}

                // ── Caller overrides everything via spread ────────────────────
                {...rest}
                onPaginationChanged={handlePaginationChanged}
            />
        </Box>
    )
}

export default DxAGgridTable

import { forwardRef, useMemo, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
  Typography
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import type { ColDef, GetRowIdParams, ICellRendererParams, IServerSideDatasource, SortModelItem } from 'ag-grid-community'
import { useFormContext } from 'react-hook-form'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import DxAGgridTable from '@/_template/DxAGgridTable'
import { useDxContext } from '@/_template/DxContextProvider'
import useDxServerSideGrid from '@/_workspace/hooks/useDxServerSideGrid'
import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import useStatusMasterOptions from '@/_workspace/react-query/hooks/useStatusMasterOptions'
import { STATUS_MASTER_TYPE } from '@/_workspace/types/StatusMasterTypes'
import type { FormDataPage } from '../validationSchema'
import { buildRequestStatusFilter } from '@/_workspace/utils/requestStatusFilter'
import type { GprCActionRequiredRow } from '../types'
import RecordActionResultDialog from './RecordActionResultDialog'

const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactNode }, ref: Ref<unknown>) {
  return <Slide direction='down' ref={ref} {...props} />
})

const buildSearchFilters = (filters: FormDataPage['searchFilters']) => [
  { id: 'request_number', value: filters.requestNumber || '' },
  { id: 'vendor_name', value: filters.vendorName || '' },
  { id: 'step_keyword', value: filters.stepKeyword || '' },
  buildRequestStatusFilter(filters.overallStatus, 'M_REQUEST_STATUS_ID')
]

interface ActionRequiredResultsDialogProps {
  open: boolean
  userEmail: string
  actionBy: string
  totalCount: number
  onCountChange: (count: number) => void
  onClose: () => void
  onResultSaved: () => void | Promise<void>
}

export default function ActionRequiredResultsDialog({
  open,
  userEmail,
  actionBy,
  totalCount,
  onCountChange,
  onClose,
  onResultSaved
}: ActionRequiredResultsDialogProps) {
  const { isEnableFetching, setIsEnableFetching } = useDxContext()
  const { getValues, setValue } = useFormContext<FormDataPage>()
  const [selectedRow, setSelectedRow] = useState<GprCActionRequiredRow | null>(null)
  const { data: actionResultStatusOptions = [] } = useStatusMasterOptions(STATUS_MASTER_TYPE.ACTION_RESULT)
  const actionResultStatusLabelById = useMemo(
    () => new Map(actionResultStatusOptions.map(option => [option.STATUS_ID, option.label])),
    [actionResultStatusOptions]
  )

  const { savedGridState, handleGridReady, handleStateUpdated, refreshServerSide } = useDxServerSideGrid({
    getValues,
    setValue,
    isEnableFetching,
    setIsEnableFetching,
    statePath: 'searchResults.actionRequiredGridState',
    lockedLeftColIds: ['action', 'request_number']
  })

  const datasource = useMemo<IServerSideDatasource>(
    () => ({
      getRows: async params => {
        if (!userEmail) {
          onCountChange(0)
          params.success({ rowData: [], rowCount: 0 })
          return
        }

        const { startRow, endRow, sortModel } = params.request
        const limit = (endRow ?? 20) - (startRow ?? 0)
        const payload = {
          PIC_EMAIL: userEmail,
          SEARCHFILTERS: buildSearchFilters(getValues('searchFilters')),
          COLUMNFILTERS: [],
          ORDER:
            sortModel && sortModel.length > 0
              ? sortModel.map((item: SortModelItem) => ({ id: item.colId, desc: item.sort === 'desc' }))
              : [
                  { id: 'SENT_AT', desc: true },
                  { id: 'REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID', desc: true }
                ],
          START: startRow ?? 0,
          LIMIT: limit || 20
        }

        try {
          const response = await RegisterRequestServices.gprCActionRequiredQueue(payload)
          const result = response.data

          if (!result?.Status) {
            onCountChange(0)
            params.fail()
            return
          }

          const rowData = result.ResultOnDb || []
          const count = Number(result.TotalCountOnDb) || 0
          const rowCount = rowData.length < payload.LIMIT ? payload.START + rowData.length : count

          onCountChange(count)
          params.success({ rowData, rowCount })
        } catch {
          onCountChange(0)
          params.fail()
        }
      }
    }),
    [getValues, onCountChange, userEmail]
  )

  const columnDefs = useMemo<ColDef<GprCActionRequiredRow>[]>(
    () => [
      {
        headerName: 'Action',
        field: 'action',
        minWidth: 290,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<GprCActionRequiredRow>) =>
          params.data ? (
            <Stack direction='row' spacing={1} alignItems='center' sx={{ height: '100%' }}>
              <Button
                size='small'
                variant='contained'
                startIcon={<i className='tabler-edit' style={{ fontSize: 16 }} />}
                onClick={() => setSelectedRow(params.data || null)}
              >
                Record Result
              </Button>
            </Stack>
          ) : null
      },
      {
        headerName: 'Request No.',
        field: 'request_number',
        minWidth: 150,
        pinned: 'left',
        lockPinned: true,
        suppressMovable: true,
        filter: 'agTextColumnFilter',
        valueGetter: params => params.data?.REQUEST_NUMBER || `REQ-${params.data?.REQUEST_REGISTER_VENDOR_ID || ''}`
      },
      { headerName: 'Vendor', field: 'company_name', minWidth: 220, flex: 1, filter: 'agTextColumnFilter' },
      {
        headerName: 'Stage',
        field: 'STAGE_NAME',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueGetter: params => params.data?.STAGE_NAME || params.data?.STAGE_CODE || '-'
      },
      {
        headerName: 'Required Detail',
        field: 'REQUIRED_DETAIL',
        minWidth: 260,
        flex: 1,
        filter: 'agTextColumnFilter',
        valueGetter: params => params.data?.REQUIRED_DETAIL || '-'
      },
      {
        headerName: 'Status',
        field: 'M_ACTION_RESULT_STATUS_ID',
        minWidth: 140,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: actionResultStatusOptions.map(option => String(option.STATUS_ID)),
          valueFormatter: (params: { value?: string | number }) =>
            actionResultStatusLabelById.get(Number(params.value)) || String(params.value || '')
        },
        cellRenderer: (params: ICellRendererParams<GprCActionRequiredRow>) => (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              maxWidth: '100%',
              px: 1.25,
              py: 0.35,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'transparent'
            }}
          >
            <Typography variant='caption' fontWeight={700} color='text.secondary' noWrap>
              {params.data?.RESULT_STATUS ||
                actionResultStatusLabelById.get(Number(params.data?.M_ACTION_RESULT_STATUS_ID)) ||
                '-'}
            </Typography>
          </Box>
        )
      }
    ],
    [actionResultStatusLabelById, actionResultStatusOptions]
  )

  return (
    <>
      <Dialog
        open={open}
        onClose={(_event, reason) => {
          if (reason !== 'backdropClick') onClose()
        }}
        maxWidth='lg'
        fullWidth
       TransitionComponent={Transition}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Typography variant='h5' component='span'>
              Action Required Results
            </Typography>
            <Chip size='small' label={totalCount} color='warning' variant='tonal' />
          </Stack>
          <DialogCloseButton onClick={onClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent dividers>
          <DxAGgridTable
            columnDefs={columnDefs}
            serverSideDatasource={datasource}
            height={420}
            getRowId={(params: GetRowIdParams<GprCActionRequiredRow>) =>
              String(
                params.data.REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID || params.data.REQUEST_REGISTER_VENDOR_ID || ''
              )
            }
            overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">No pending Action Required result.</span>'
            initialState={savedGridState}
            onStateUpdated={handleStateUpdated}
            onGridReady={handleGridReady}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button variant='tonal' color='secondary' onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <RecordActionResultDialog
        open={Boolean(selectedRow)}
        row={selectedRow}
        actionBy={actionBy}
        onClose={() => setSelectedRow(null)}
        onSuccess={async () => {
          refreshServerSide()
          await onResultSaved()
        }}
      />
    </>
  )
}

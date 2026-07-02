import CircularProgress from '@mui/material/CircularProgress'
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useMemo, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Slide,
  SlideProps,
  Stack,
  Switch,
  Typography
} from '@mui/material'

import type { SubmitErrorHandler } from 'react-hook-form'
import { Controller, useFormContext, useFormState } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import { useCreateSctFormulaExport, useSearchSctExport } from '@/_workspace/react-query/hooks/useStandardCostExportData'

// types Imports
import type { FormData } from '../index'

import { useCreateSctExport } from '@/_workspace/react-query/hooks/useStandardCostExportData'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useStandardCostForProduct'

import ConfirmModal from '@/components/ConfirmModal'

interface Props {
  openExportModal: boolean
  setOpenExportModal: Dispatch<SetStateAction<boolean>>
  rowSelection: any
  isFetchExportData: boolean
  setIsFetchExportData: Dispatch<SetStateAction<boolean>>
  handleClearAllSelected: () => void
}
//@ts-ignore

import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'

import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

import { fetchSubAssyByLikeSctId } from '@/_workspace/react-select/async-promise-load-options/fetchSctExport'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { twMerge } from 'tailwind-merge'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const getUrlParamSearch = (rowSelection: any): object => {
  const dataItem: any = []

  for (let i = 0; i < Object.keys(rowSelection).length; i++) {
    const element = Object.keys(rowSelection)[i]

    const data = {
      SCT_ID: element
    }
    dataItem.push(data)
  }

  const params = {
    LIST_SCT_ID: dataItem
  }
  return params
}

const ExportModal = ({
  openExportModal,
  setOpenExportModal,
  rowSelection,
  isFetchExportData: isFetchData,
  setIsFetchExportData,
  handleClearAllSelected
}: Props) => {
  // Hooks : react-hook-form
  const [confirmModal, setConfirmModal] = useState(false)
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger, setError, clearErrors } =
    useFormContext<FormData>()
  const { errors } = useFormState({
    control
  })
  //  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [isSubSwitch, setIsSubSwitch] = useState(false)
  const [isLoadingAllSubAssy, setIsLoadingAllSubAssy] = useState([])

  // Hooks : react-query
  const queryClient = useQueryClient()

  const handleExport = (selected: string) => {
    const listData: any = []
    const level = 0

    const dataExport = data?.data?.ResultOnDb || []
    for (let i = 0; i < dataExport.length; i++) {
      const element = dataExport[i]

      const dataItem = {
        SCT_ID: element?.SCT_ID,
        LEVEL: level,
        SCT_COMPARE_ID: element?.SCT_ID_FOR_COMPARE || ''
      }

      listData.push(dataItem)

      if (watch(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`)?.length > 0) {
        for (let i = 0; i < watch(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`)?.length; i++) {
          const eleSubAssy = watch(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`)[i]

          const dataItem = {
            SCT_ID: eleSubAssy?.SCT_ID,
            LEVEL: eleSubAssy?.LEVEL,
            SCT_COMPARE_ID: eleSubAssy?.SCT_ID_FOR_COMPARE || ''
          }
          listData.push(dataItem)
        }
      }
    }

    const dataItem = {
      LIST_SCT_ID: listData
    }

    if (selected === 'None-Formula') {
      createExportMutation(dataItem)
    } else if (selected === 'Formula') {
      createExportFormulaMutation(dataItem)
    } else if (selected === 'All') {
      createExportMutation(dataItem)
      createExportFormulaMutation(dataItem)
    }
  }

  const onMutateSuccess = (data: any) => {
    const message = {
      message: 'Create Excel Cost Structure - None Formula Success',
      title: 'Sct Form'
    }
    handleClearAllSelected()
    ToastMessageSuccess(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleClose()
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'Sct Form',
      message: 'Create Excel Cost Structure - None Formula Error'
    }

    ToastMessageError(message)
  }

  const onMutateSuccessFormula = (data: any) => {
    const message = {
      message: 'Create Excel Cost Structure - Formula Success',
      title: 'Sct Form'
    }
    handleClearAllSelected()
    ToastMessageSuccess(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleClose()
  }

  const onMutateErrorFormula = (err: any) => {
    const message = {
      title: 'Sct Form',
      message: 'Create Excel Cost Structure - Formula Error'
    }

    ToastMessageError(message)
  }

  const { mutate: createExportMutation, isPending: isLoadingExportFile } = useCreateSctExport(
    onMutateSuccess,
    onMutateError
  )

  const { mutate: createExportFormulaMutation, isPending: isLoadingExportFormulaFile } = useCreateSctFormulaExport(
    onMutateSuccessFormula,
    onMutateErrorFormula
  )

  const onSubmit = () => {
    setConfirmModal(true)
    // console.log('---DATA---', data?.data.ResultOnDb)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const { data } = useSearchSctExport(getUrlParamSearch(rowSelection), isFetchData)

  const handleEditSwitch = async (
    e: any,
    index: number,
    chkName: string,
    setIsDisabled: Dispatch<SetStateAction<boolean>>
  ) => {
    const [NAME, SCT_ID] = e.target.name.split(':')

    setIsSubSwitch(true)

    const dataItem = {
      SCT_ID: SCT_ID
    }

    if (e.target.checked == false) {
      setValue(`SUB_SWITCH:${SCT_ID}`, '')
      setIsSubSwitch(false)
      setIsDisabled && setIsDisabled(false)
      return
    }

    await fetchSubAssyByLikeSctId(dataItem)
      .then(responseJson => {
        if (responseJson?.length > 0) {
          setValue(`SUB_ASSY.${SCT_ID}`, e.target.checked)
          setValue(`SUB_SWITCH.SUB_ASSY:${SCT_ID}`, responseJson)
        } else {
          setError(`SUB_SWITCH.SUB_ASSY-${SCT_ID}`, { message: 'Sub-Assembly Not Found' })
          setValue(`SUB_ASSY.${SCT_ID}`, !e.target.checked)
          setValue(`SUB_SWITCH.SUB_ASSY:${SCT_ID}`, '')
        }

        setIsSubSwitch(false)

        setIsLoadingAllSubAssy(prev => {
          prev[index] = false
          return [...prev]
        })

        setIsDisabled && setIsDisabled(false)
      })
      .catch(error => {
        setIsDisabled && setIsDisabled(false)
      })
  }

  const columns = useMemo<MRT_ColumnDef<StandardCostI>[]>(
    () => [
      {
        accessorKey: 'SCT_CODE_FOR_SUPPORT_MES', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        header: 'SCT CODE FOR SUPPORT MES'
      },
      {
        accessorKey: 'SCT_REVISION_CODE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        header: 'SCT REVISION CODE'
      },
      {
        accessorKey: 'PRODUCT_TYPE_NAME', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        header: 'PRODUCT TYPE NAME'
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        header: 'PRODUCT TYPE CODE'
      },
      {
        accessorKey: 'COMPARE_SCT_REVISION_CODE', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        header: 'SCT COMPARE'
      },
      {
        accessorKey: 'SCT_ID', //accessorKey used to define `data` column. `id` gets set to accessorKey automatically
        header: 'NEED ALL Sub-Assembly',
        Header: ({ column }) => {
          return (
            <>
              <Grid container spacing={2} alignItems='center'>
                <Switch
                  color='success'
                  size='medium'
                  disabled={
                    isLoadingAllSubAssy.some(item => item === true) ||
                    isLoadingExportFile ||
                    isLoadingExportFormulaFile ||
                    isSubSwitch
                  }
                  onChange={e => {
                    e.target.checked
                    const inputName = Object.keys(getValues('SUB_SWITCH'))
                    if (inputName && inputName.length > 0) {
                      if (e.target.checked === true) {
                        setIsLoadingAllSubAssy(prev => {
                          return [...inputName.map(() => true)]
                        })
                      }

                      for (let index = 0; index < inputName.length; index++) {
                        setValue(`SUB_SWITCH.${inputName[index]}`, e.target.checked)
                        e.target.name = inputName[index]
                        handleEditSwitch(e, index)
                      }
                    }
                  }}
                />
                <Typography className='mt-1 ml-1' sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                  NEED ALL SUB-ASSEMBLY
                </Typography>
              </Grid>
            </>
          )
        },
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                control={control}
                name={`SUB_SWITCH.SUB_ASSY:${row.original.SCT_ID}`}
                defaultValue={false}
                render={({ field: { ref, value, onChange, ...fieldProps } }) => {
                  const [isDisabled, setIsDisabled] = useState(false)

                  return (
                    <>
                      <FormControlLabel
                        control={
                          <Switch
                            style={{
                              cursor: 'pointer'
                            }}
                            color='success'
                            checked={value ? true : false}
                            size='medium'
                            //innerRef={ref}
                            disabled={
                              isLoadingAllSubAssy.some(item => item === true) ||
                              isDisabled ||
                              isLoadingExportFile ||
                              isLoadingExportFormulaFile ||
                              isSubSwitch
                            }
                            onChange={e => {
                              onChange(e.target.checked)
                              setIsDisabled(true)
                              e.target.name = `SUB_ASSY:${row.original.SCT_ID}`
                              handleEditSwitch(e, null, `SUB_SWITCH.SUB_ASSY:${row.original.SCT_ID}`, setIsDisabled)
                            }}
                            {...fieldProps}
                          />
                        }
                        label={
                          errors?.SUB_SWITCH?.[`SUB_ASSY-${row.original.SCT_ID}`] ? (
                            <>
                              <IconButton>
                                <i className='tabler-xbox-x text-[22px] text-textSecondary' />
                              </IconButton>
                              <span className={twMerge('custom-error-message', 'info-mui-color', 'mx-auto')}>
                                {errors.SUB_SWITCH?.[`SUB_ASSY-${row.original.SCT_ID}`].message}
                              </span>
                            </>
                          ) : value ? (
                            <>
                              <div className='flex items-center'>
                                <IconButton>
                                  <i className='tabler-circle-check text-[22px] text-success' />
                                </IconButton>
                              </div>
                            </>
                          ) : null
                        }
                      />
                    </>
                  )
                }}
              />
            </>
          )
        }
      }
    ],
    [errors, isLoadingAllSubAssy]
  )

  const table = useMaterialReactTable({
    columns,
    enableRowActions: false,
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: false,
    enablePagination: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnFilterModes: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableGlobalFilterModes: false,
    enableHiding: false,
    enableColumnActions: false,
    enableRowDragging: false,
    enableRowSelection: false,
    data: data?.data?.ResultOnDb || [],
    //onRowSelectionChange: setRowSelection,
    //getRowId: originalRow => `table_${originalRow.SCT_CODE}`,
    muiTableBodyRowProps: ({ row }) => ({
      sx: { cursor: 'pointer', overflow: 'none', position: 'static' }
    }),

    muiTableHeadProps: {
      sx: {
        position: 'sticky',
        top: '0',
        zIndex: '100000',
        borderLeftColor: 'var(--bs-primary)',
        borderRightColor: 'var(--bs-primary)'
      }
    },
    muiTableHeadCellProps: {
      sx: {
        borderWidth: '0.5px'
      }
    },

    renderBottomToolbar: () => (
      <>
        {/* <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
            <Typography>Total {dataProductTypeSelected?.length} entries</Typography>
          </div> */}
      </>
    )
  })

  const handleClose = () => {
    clearErrors()
    const inputName = Object.keys(getValues('SUB_SWITCH'))
    if (inputName && inputName.length > 0) {
      for (let index = 0; index < inputName.length; index++) {
        setValue(`SUB_SWITCH.${inputName[index]}`, false)
      }
    }

    setOpenExportModal(false)
    setIsFetchExportData(false)
  }

  return (
    <>
      <Dialog
        maxWidth='xl'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openExportModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span' color='primary'>
            Standard Cost Form |
          </Typography>
          <Typography variant='h5' component='span'>
            {' '}
            Export
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid item xs={12}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Grid className='mt-3'>
                  <MaterialReactTable table={table} />
                </Grid>
                {/* <Grid className='mt-1'>
              <SctData />
            </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Stack direction='row' spacing={2}>
            <Button
              disabled={isLoadingExportFormulaFile || isSubSwitch}
              onClick={() => handleSubmit(handleExport('Formula'), onError)()}
              variant='outlined'
            >
              {isLoadingExportFormulaFile || isSubSwitch ? (
                <>
                  <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                  <span className='ms-50'>Loading ...</span>
                </>
              ) : (
                <>Export Formula</>
              )}
            </Button>
            <Button
              disabled={isLoadingExportFile || isSubSwitch}
              onClick={() => handleSubmit(handleExport('None-Formula'), onError)()}
              variant='outlined'
            >
              {isLoadingExportFile || isSubSwitch ? (
                <>
                  <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                  <span className='ms-50'>Loading ...</span>
                </>
              ) : (
                <>Export None-Formula</>
              )}
            </Button>
            <Divider flexItem orientation='vertical' sx={{ mx: 2 }} />
            <Button
              disabled={isLoadingExportFile || isLoadingExportFormulaFile || isSubSwitch}
              onClick={() => handleSubmit(handleExport('All'), onError)()}
              variant='contained'
            >
              {isLoadingExportFile || isLoadingExportFormulaFile || isSubSwitch ? (
                <>
                  <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                  <span className='ms-50'>Loading ...</span>
                </>
              ) : (
                <>Export (All Format)</>
              )}
            </Button>
            <Button onClick={handleClose} variant='tonal' color='secondary'>
              Close
            </Button>
          </Stack>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          //onConfirmClick={isDraft ? handleDraft : handleSaveComplete}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default ExportModal

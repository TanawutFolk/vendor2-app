// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useMemo, useState } from 'react'
// MUI Imports
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm, useFormState } from 'react-hook-form'

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_RowSelectionState
} from 'material-react-table'

// types Imports
// import type { FormData } from '../index'

// Component Imports

import { useCreateImportList } from '@/_workspace/react-query/hooks/useManufacturingItemData'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useYieldRateData'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import ConfirmModal from '@/components/ConfirmModal'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import type { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { InferInput, object } from 'valibot'
import ImportPriceDropzone from './importDropzone'
import LoadingButton from '@mui/lab/LoadingButton'
import { set } from 'zod'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  openImportModal: boolean
  setOpenModalImport: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

interface ParamApiSearchSctI extends ParamApiSearchResultTableI {
  PRODUCT_CATEGORY_ID?: number | ''
  PRODUCT_MAIN_ID?: number | ''
  PRODUCT_SUB_ID?: number | ''
  PRODUCT_TYPE_CODE?: string | ''
  PRODUCT_TYPE_NAME?: string | ''
}

const getUrlParamSearch = ({
  PRODUCT_CATEGORY_ID = '',
  PRODUCT_MAIN_ID = '',
  PRODUCT_SUB_ID = '',
  PRODUCT_TYPE_CODE = '',
  PRODUCT_TYPE_NAME = ''
}: ParamApiSearchSctI): object => {
  const params = {
    PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_CODE: PRODUCT_TYPE_CODE || '',
    PRODUCT_TYPE_NAME: PRODUCT_TYPE_NAME || '',
    Start: 0,
    Limit: 10
  }

  //console.log(params)
  return params
}

export type FormData = InferInput<typeof schema>

const schema = object({
  // searchFilters: object({
  //   FISCAL_YEAR: object(
  //     {
  //       value: number()
  //       // label: string()
  //     },
  //     requiredFieldMessage({ fieldName: 'Fiscal Year' })
  //   ),
  //   SCT_REASON_SETTING: object(
  //     {
  //       SCT_REASON_SETTING_ID: number('Please select ...'),
  //       SCT_REASON_SETTING_NAME: pipe(string(), nonEmpty('Please select ...'))
  //     },
  //     requiredFieldMessage({ fieldName: 'SCT Reason Setting' })
  //   )
  // SCT_TAG_SETTING: object(
  //   {
  //     SCT_TAG_SETTING_ID: number('Please select ...'),
  //     SCT_TAG_SETTING_NAME: pipe(string(), nonEmpty('Please select ...'))
  //   },
  //   requiredFieldMessage({ fieldName: 'SCT Tag Setting Year' })
  // )
  // fileData: nullish(object({}))
  // })
})

const ImportPageItemPrice = ({ openImportModal, setOpenModalImport, setIsEnableFetching }: Props) => {
  // const [isFetchData, setIsFetchData] = useState(false)
  // const [dataProductType, setDataProductType] = useState<ProductTypeI[]>([])
  // const [draggingRow, setDraggingRow] = useState<MRT_Row<ProductTypeI> | null>(null)
  // const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  // const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // const [yieldRateList, setYieldRateList] = useState<any[]>([])
  const [dataError, setDataError] = useState([])
  const [isCheckImportFile, setIsCheckImportFile] = useState<boolean>(false)
  const [isShowImportDataError, setIsShowImportDataError] = useState(false)
  //  const [jsonArray, setJsonArray] = useState([])
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  // Hooks : react-hook-form
  const reactHookFormMethods = useForm<FormData>({ resolver: valibotResolver(schema) })

  // const [isEnableFetching, setIsEnableFetching] = useState(false)
  //const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { control, handleSubmit, getValues, watch, setValue, reset, unregister, register, trigger } =
    reactHookFormMethods

  const { errors } = useFormState({
    control
  })
  // Hooks : react-query
  const queryClient = useQueryClient()

  const onSubmit: SubmitHandler<FormData> = () => {
    setIsFetchData(true)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const columns = useMemo<MRT_ColumnDef<ProductTypeI>[]>(
    () => [
      {
        accessorKey: 'POSITION',
        header: 'POSITION'
      },
      {
        accessorKey: 'ITEM_NAME',
        header: 'ITEM NAME'
      },
      {
        accessorKey: 'VALUE',
        header: 'MISTAKE VALUE'
      },
      {
        accessorKey: 'REASON',
        header: 'REASON'
      }
    ],
    []

    //end
  )

  const handleClose = () => {
    setOpenModalImport(false)
    // reset()
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Manufacturing Item Form'
      }
      ToastMessageSuccess(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      setIsEnableFetching(true)
      handleClose()
    } else {
      setIsShowImportDataError(true)
      setDataError(data.data.ResultOnDb)
      const message = {
        title: 'Manufacturing Item Form',
        message: data.data.Message
      }
      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'Manufacturing Item Form',
      message: 'Import Manufacturing Item Error ' + `${err}`
    }

    ToastMessageError(message)
  }

  const { mutate: createImportMutation, isPending: isLoadingImportFile } = useCreateImportList(
    onMutateSuccess,
    onMutateError
  )

  const handleImport = () => {
    try {
      setIsCheckImportFile(true)

      if (watch('fileData') == null) {
        ToastMessageError({
          title: 'Sct Form',
          message: 'Please choose Manufacturing Item file for upload.'
        })
        return
      }

      const fileData = watch('fileData')['content']

      if (watch('fileData')['content'].length === 0) {
        ToastMessageError({
          title: 'Sct Form',
          message: 'Please check data and try again'
        })
        setDataError([])
        setIsShowImportDataError(false)
        return
      }

      const dataItem = []
      for (let i = 0; i < fileData?.length; i++) {
        const element = fileData[i]
        const data = {
          'ITEM CATEGORY NAME': element['ITEM CATEGORY NAME'],
          'ITEM CODE': element['ITEM CODE'],
          'ITEM PURPOSE NAME': element['ITEM PURPOSE NAME'],
          'ITEM GROUP NAME': element['ITEM GROUP NAME'],
          'VENDOR NAME': element['VENDOR NAME'],
          'MAKER NAME': element['MAKER NAME'],
          'WIDTH [mm] (optional)': element['WIDTH [mm] (optional)'],
          'HEIGHT [mm] (optional)': element['HEIGHT [mm] (optional)'],
          'DEPTH [mm] (optional)': element['DEPTH [mm] (optional)'],
          'COLOR (optional)': element['COLOR (optional)'],
          'SHAPE (optional)': element['SHAPE (optional)'],
          'ITEM INTERNAL FULL NAME': element['ITEM INTERNAL FULL NAME'],
          'ITEM INTERNAL SHORT NAME': element['ITEM INTERNAL SHORT NAME'],
          'ITEM EXTERNAL CODE (P/N)': element['ITEM EXTERNAL CODE (P/N)'],
          'ITEM EXTERNAL FULL NAME': element['ITEM EXTERNAL FULL NAME'],
          'ITEM EXTERNAL SHORT NAME': element['ITEM EXTERNAL SHORT NAME'],
          'PURCHASE UNIT RATIO': element['PURCHASE UNIT RATIO'],
          'PURCHASE UNIT CODE': element['PURCHASE UNIT CODE'],
          'USAGE UNIT RATIO': element['USAGE UNIT RATIO'],
          'USAGE UNIT CODE': element['USAGE UNIT CODE'],
          'MOQ [Purchase Unit] (optional)': element['MOQ [Purchase Unit] (optional)'],
          'LEAD TIME [Day] (optional)': element['LEAD TIME [Day] (optional)'],
          'SAFETY STOCK  [Purchase Unit] (optional)': element['SAFETY STOCK  [Purchase Unit] (optional)'],
          'THEME COLOR NAME (optional)': element['THEME COLOR NAME (optional)'],

          'CREATE BY': getUserData()?.EMPLOYEE_CODE
        }
        dataItem.push(data)
      }

      const dataArrayListItem = {
        LIST_ITEM_IMPORT: dataItem
      }
      createImportMutation(dataArrayListItem)
    } finally {
      setIsCheckImportFile(false)
    }
  }

  const table = useMaterialReactTable({
    autoResetPageIndex: false,
    columns,
    data: dataError || [],
    //data: dataPositionHistory || [],
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: false,
    enablePagination: false,
    enableRowNumbers: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnFilterModes: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableGlobalFilterModes: false,
    enableHiding: false,
    enableRowActions: false,
    enableColumnActions: false,
    //initialState: { density: 'compact' },
    state: {
      density: 'compact'
    },

    muiTableContainerProps: {
      sx: {
        maxHeight: '280px',
        minHeight: '280px',
        overflow: 'scroll'
      }
    },
    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'unset'
      }
    }
  })

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
        open={openImportModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Import Data |
          </Typography>
          <Typography variant='h5' component='span' color='primary'>
            {' '}
            Manufacturing Item
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Grid className='mt-1' container spacing={6} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <Grid item xs={12} sm={6} lg={12}>
                  <FormProvider {...reactHookFormMethods}>
                    <ImportPriceDropzone
                      isShowImportDataError={isShowImportDataError}
                      setIsShowImportDataError={setIsShowImportDataError}
                      setIsCheckImportFile={setIsCheckImportFile}
                      isCheckImportFile={isCheckImportFile}
                      setDataError={setDataError}
                    />
                  </FormProvider>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid className='mt-1' sx={{ justifyContent: 'center', alignItems: 'center' }}>
            {isShowImportDataError === true ? <MaterialReactTable table={table} /> : null}
          </Grid>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            onClick={() => handleSubmit(handleImport, onError)()}
            loading={isCheckImportFile || isLoadingImportFile}
            //loadingIndicator={'Check Import File...'}
            variant='contained'
            color={'success'}
            sx={{ mr: 1 }}
            disabled={isCheckImportFile || isLoadingImportFile}
          >
            <span>Import Form</span>
          </LoadingButton>

          {/* <Button
            disabled={isLoadingImportFile}
            onClick={() => handleSubmit(handleImport, onError)()}
            variant='contained'
          >
            {isLoadingImportFile ? (
              <>
                <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                <span className='ms-50'>Loading...</span>
              </>
            ) : (
              <>Import Form </>
            )}
          </Button> */}
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          //onConfirmClick={handleAddDepartment}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default ImportPageItemPrice

// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { useEffect, useMemo, useState, forwardRef } from 'react'

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Slide,
  SlideProps,
  Tooltip,
  Typography,
  useColorScheme
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'

import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  type MRT_Row,
  type MRT_RowSelectionState
} from 'material-react-table'

import SelectCustom from '@/components/react-select/SelectCustom'
import CustomTextField from '@/components/mui/TextField'

// types Imports
import type { FormData } from '../index'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import type { ProductCategoryOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import type { ProductMainOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import type { ProductSubOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import type { ProductTypeOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import {
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

import { PREFIX_QUERY_KEY, useSearchByProductGroup } from '@/_workspace/react-query/hooks/useProductTypeData'
import type { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useCreateYieldRateMaterialExport } from '@/_workspace/react-query/hooks/useYieldRateMaterialData'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  openExportModal: boolean
  setOpenModalExport: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  dataProductMainSelected: ProductTypeI[]
  setDataProductMainSelected: Dispatch<SetStateAction<ProductTypeI[]>>
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

const ExportPage = ({
  openExportModal,
  setOpenModalExport,
  setIsEnableFetching,
  dataProductMainSelected,
  setDataProductMainSelected
}: Props) => {
  const [isFetchData, setIsFetchData] = useState(false)
  const [dataProductType, setDataProductType] = useState<ProductTypeI[]>([])
  const [draggingRow, setDraggingRow] = useState<MRT_Row<ProductTypeI> | null>(null)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  // const [isEnableFetching, setIsEnableFetching] = useState(false)
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const paramForSearch: any = {
    PRODUCT_CATEGORY_ID: watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: watch('PRODUCT_SUB')?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_CODE: watch('PRODUCT_TYPE')?.PRODUCT_TYPE_CODE || '',
    PRODUCT_TYPE_NAME: watch('PRODUCT_TYPE')?.PRODUCT_TYPE_NAME || ''

    //Order: querySortBy.toString().replaceAll('MODIFIED_DATE', 'UPDATE_DATE').replaceAll('inuseForSearch', 'INUSE')
  }

  const {
    isRefetching,
    isLoading,
    data: dataFormSearch,
    isError,
    refetch,
    isFetching,
    isSuccess
  } = useSearchByProductGroup(getUrlParamSearch(paramForSearch), isFetchData)

  useEffect(() => {
    if (isFetching == false) {
      //console.log(dataFormSearch?.data?.ResultOnDb || [])
      setDataProductType(dataFormSearch?.data?.ResultOnDb || [])
      setIsFetchData(false)
    }
  }, [isFetching])

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

  const handleClose = () => {
    onResetFormSearch()
    setDataProductMainSelected([])
    setOpenModalExport(false)
    // reset()
  }

  const onResetFormSearch = () => {
    setValue('PRODUCT_CATEGORY', null)
    setValue('PRODUCT_MAIN', null)
    setValue('PRODUCT_SUB', null)
    setValue('PRODUCT_TYPE', null)
  }

  const onMutateSuccess = (data: any) => {
    const message = {
      message: 'Create Excel Cost Structure - None Formula Success',
      title: 'Sct Form'
    }
    ToastMessageSuccess(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleClose()
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'Yield Rate And Go Straight Form',
      message: 'Create Excel Yield Rate & Go Straight Rate Error ' + `${err}`
    }

    ToastMessageError(message)
  }

  const { mutate: createExportMutation, isPending: isLoadingExportFile } = useCreateYieldRateMaterialExport(
    onMutateSuccess,
    onMutateError
  )

  const handleExport = () => {
    let listData: any = []

    if (!watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID) {
      ToastMessageError({
        title: 'Sct Form',
        message: 'Please select product main first'
      })
      return
    }

    let dataItem = {
      PRODUCT_MAIN_ID: watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID
    }

    createExportMutation(dataItem)
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
          <Typography variant='h5' component='span'>
            Export Form |
          </Typography>
          <Typography variant='h5' component='span' color='primary'>
            {' '}
            Yield Rate Material
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Grid
                container
                spacing={6}
                sx={{
                  paddingTop: '8px',
                  paddingBottom: '10px'
                }}
              >
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='PRODUCT_CATEGORY'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductCategoryOption>
                        label='Product Category'
                        inputId='PRODUCT_CATEGORY'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('PRODUCT_CATEGORY')}
                        onChange={value => {
                          onChange(value)

                          setValue('PRODUCT_MAIN', null)
                          setValue('PRODUCT_SUB', null)
                          setValue('PRODUCT_TYPE', null)
                        }}
                        loadOptions={inputValue => {
                          return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                        }}
                        getOptionLabel={data => data.PRODUCT_CATEGORY_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Category ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='PRODUCT_MAIN'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductMainOption>
                        label='Product Main'
                        inputId='PRODUCT_MAIN'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('PRODUCT_MAIN')}
                        onChange={value => {
                          onChange(value)

                          setValue('PRODUCT_SUB', null)
                          setValue('PRODUCT_TYPE', null)
                        }}
                        key={watch('PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                        loadOptions={inputValue => {
                          return getValues('PRODUCT_CATEGORY')
                            ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                                inputValue,
                                1,
                                getValues('PRODUCT_CATEGORY').PRODUCT_CATEGORY_ID
                              )
                            : fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Main ...'
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoadingExportFile}
            onClick={() => handleSubmit(handleExport, onError)()}
            variant='contained'
          >
            {isLoadingExportFile ? (
              <>
                <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                <span className='ms-50'>Loading...</span>
              </>
            ) : (
              <>Export Form </>
            )}
          </Button>
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

export default ExportPage

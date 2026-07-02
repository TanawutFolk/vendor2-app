// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { useEffect, useMemo, useState, forwardRef } from 'react'
import { getUserData } from '@utils/user-profile/userLoginProfile'
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
import { Controller, FormProvider, set, useForm, useFormContext, useFormState } from 'react-hook-form'
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
// import type { FormData } from '../index'

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

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useYieldRateData'
import type { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useCreateYieldRateExport, useCreateYieldRateImport } from '@/_workspace/react-query/hooks/useYieldRateData'
import { FiscalYearType } from '../../cost-condition/exchange-rate/ExchangeRateSearch'
import { fetchSctReasonByLikeSctReasonNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import { fetchSctTagByLikeSctTagNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'
import ImportDropzone from './importDropzone'
import { InferInput, nonEmpty, nullish, number, object, pipe, record, string } from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import data from '@/data/searchData'
import { useCreateYieldRateMaterialImport } from '@/_workspace/react-query/hooks/useYieldRateMaterialData'

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

export type FormData = InferInput<typeof schema>

const schema = object({
  searchFilters: object({
    FISCAL_YEAR: object(
      {
        value: number()
        // label: string()
      },
      requiredFieldMessage({ fieldName: 'Fiscal Year' })
    ),
    SCT_REASON_SETTING: object(
      {
        SCT_REASON_SETTING_ID: number('Please select ...'),
        SCT_REASON_SETTING_NAME: pipe(string(), nonEmpty('Please select ...'))
      },
      requiredFieldMessage({ fieldName: 'SCT Reason Setting' })
    ),

    SCT_TAG_SETTING: object(
      {
        SCT_TAG_SETTING_ID: number('Please select ...'),
        SCT_TAG_SETTING_NAME: pipe(string(), nonEmpty('Please select ...'))
      },
      requiredFieldMessage({ fieldName: 'SCT Tag Setting Year' })
    )
    // fileData: nullish(object({}))
  })
})

const ImportPage = ({
  openImportModal,
  setOpenModalImport,
  setIsEnableFetching,
  dataProductMainSelected,
  setDataProductMainSelected
}: Props) => {
  const [isFetchData, setIsFetchData] = useState(false)
  const [dataProductType, setDataProductType] = useState<ProductTypeI[]>([])
  const [draggingRow, setDraggingRow] = useState<MRT_Row<ProductTypeI> | null>(null)
  const [hoveredTable, setHoveredTable] = useState<string | null>(null)
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  const [yieldRateList, setYieldRateList] = useState<any[]>([])
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
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'PRODUCT TYPE CODE'
      },
      {
        accessorKey: 'PRODUCT_TYPE_NAME',
        header: 'PRODUCT TYPE NAME'
      },
      {
        accessorKey: 'PRODUCT_SUB_NAME',
        header: 'PRODUCT SUB'
      },
      {
        accessorKey: 'PRODUCT_MAIN_NAME',
        header: 'PRODUCT MAIN'
      },
      {
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        header: 'PRODUCT CATEGORY'
      }
    ],
    []

    //end
  )

  const FiscalYearOption: FiscalYearType[] = Array.from({ length: 3 }, (_, i) => {
    const year = new Date().getFullYear() + i - 1
    return { value: year, label: year }
  })

  const handleClose = () => {
    setOpenModalImport(false)
    // reset()
  }

  const onMutateSuccess = (data: any) => {
    const message = {
      message: 'Create Excel Yield Rate Material Success',
      title: 'Yield Rate Material Form'
    }
    ToastMessageSuccess(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    setIsEnableFetching(true)
    handleClose()
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'Yield Rate And Go Straight Form',
      message: 'Create Excel Yield Rate Material Error ' + `${err}`
    }

    ToastMessageError(message)
  }

  const { mutate: createImportMutation, isPending: isLoadingImportFile } = useCreateYieldRateMaterialImport(
    onMutateSuccess,
    onMutateError
  )

  const handleImport = () => {
    let listData: any = []
    let NewData: any = []

    //  console.log('File', watch('fileData'))

    if (watch('fileData') == null) {
      ToastMessageError({
        title: 'Sct Form',
        message: 'Please choose YR-MATERIAL file for upload.'
      })
      return
    }

    let fileData = watch('fileData')['content']

    for (let j = 0; j < fileData.length; j++) {
      const el = fileData[j]

      if (el?.['ITEM_CODE'] == null && el?.['PRODUCT_TYPE_CODE'] == null && el?.['YIELD_RATE_MATERIAL'] == null) {
        continue
      } else {
        NewData.push(el)
      }
    }

    if (NewData?.length == 0) {
      ToastMessageError({
        title: 'Sct Form',
        message: 'Please check data and try again'
      })
      return
    }

    for (let j = 0; j < NewData.length; j++) {
      const el = NewData[j]

      let dataItem = {
        FISCAL_YEAR: watch('searchFilters.FISCAL_YEAR')?.value,
        SCT_REASON_SETTING_ID: watch('searchFilters.SCT_REASON_SETTING')?.SCT_REASON_SETTING_ID,
        SCT_TAG_SETTING_ID: watch('searchFilters.SCT_TAG_SETTING')?.SCT_TAG_SETTING_ID,
        PRODUCT_TYPE_ID: el.PRODUCT_TYPE_ID,
        ITEM_ID: el.ITEM_ID,
        YIELD_ACCUMULATION_OF_ITEM_FOR_SCT: Number(el.YIELD_RATE_MATERIAL * 100).toFixed(4),
        NOTE: el.NOTE,
        CREATE_BY: getUserData()?.EMPLOYEE_CODE
      }

      listData.push(dataItem)
    }

    createImportMutation(listData)

    // console.log('DATA-ITEM', listData)
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
            Import Form |
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
          <Divider color='primary'>
            <Typography color='primary'>Header</Typography>
          </Divider>
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
                    name='searchFilters.FISCAL_YEAR'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={FiscalYearOption}
                        isClearable
                        label='Fiscal Year'
                        classNamePrefix='select'
                        placeholder='Select Fiscal Year'
                        value={watch('searchFilters.FISCAL_YEAR')}
                        {...(errors?.searchFilters?.FISCAL_YEAR && {
                          error: true,
                          helperText: errors?.searchFilters?.FISCAL_YEAR.message
                        })}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.SCT_REASON_SETTING'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='SCT Reason'
                        inputId='SCT_REASON_SETTING'
                        {...fieldProps}
                        // isDisabled={getValues('mode') === 'view'}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.SCT_REASON_SETTING')}
                        onChange={value => {
                          onChange(value)

                          if (value && value.SCT_REASON_SETTING_ID === 1) {
                            setValue('searchFilters.SCT_TAG_SETTING', {
                              SCT_TAG_SETTING_ID: 1,
                              SCT_TAG_SETTING_NAME: 'Budget'
                            })
                          } else {
                            setValue('searchFilters.SCT_TAG_SETTING', null)
                          }
                        }}
                        loadOptions={inputValue => {
                          return fetchSctReasonByLikeSctReasonNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.SCT_REASON_SETTING_NAME.toString()}
                        getOptionValue={data => data.SCT_REASON_SETTING_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select SCT Reason ...'
                        {...(errors?.searchFilters?.SCT_REASON_SETTING && {
                          error: true,
                          helperText: errors?.searchFilters?.SCT_REASON_SETTING.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.SCT_TAG_SETTING'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='SCT Tag'
                        inputId='SCT_TAG_SETTING'
                        {...fieldProps}
                        // isDisabled={true}
                        isClearable
                        cacheOptions
                        defaultOptions
                        // value={getValues('searchFilters.SCT_TAG_SETTING')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchSctTagByLikeSctTagNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.SCT_TAG_SETTING_NAME.toString()}
                        getOptionValue={data => data.SCT_TAG_SETTING_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select SCT Tag ...'
                        //placeholder='Auto'
                        {...(errors?.searchFilters?.SCT_TAG_SETTING && {
                          error: true,
                          helperText: errors?.searchFilters?.SCT_TAG_SETTING.message
                        })}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider color='primary'>
                <Typography color='primary'>Body</Typography>
              </Divider>

              <Grid className='mt-1' container spacing={6} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <Grid item xs={12} sm={6} lg={12}>
                  <FormProvider {...reactHookFormMethods}>
                    <ImportDropzone />
                  </FormProvider>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
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

export default ImportPage

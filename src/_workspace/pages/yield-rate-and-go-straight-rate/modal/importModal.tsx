// React Imports
import { getUserData } from '@utils/user-profile/userLoginProfile'
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
  Divider,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, FormProvider, useForm, useFormState } from 'react-hook-form'

import { type MRT_ColumnDef, type MRT_Row, type MRT_RowSelectionState } from 'material-react-table'

import SelectCustom from '@/components/react-select/SelectCustom'

// types Imports
// import type { FormData } from '../index'

// Component Imports

import { PREFIX_QUERY_KEY, useCreateYieldRateImport } from '@/_workspace/react-query/hooks/useYieldRateData'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import ConfirmModal from '@/components/ConfirmModal'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import type { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import { requiredFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { InferInput, number, object } from 'valibot'
import { FiscalYearType } from '../../cost-condition/exchange-rate/ExchangeRateSearch'
import ImportDropzone from './importDropzone'

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
  dataProductTypeSelected: ProductTypeI[]
  setDataProductTypeSelected: Dispatch<SetStateAction<ProductTypeI[]>>
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
    )
  })
})

const ImportPage = ({
  openImportModal,
  setOpenModalImport,
  setIsEnableFetching,
  dataProductTypeSelected,
  setDataProductTypeSelected
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
      message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      title: 'Yield Rate And Go Straight Form'
    }
    ToastMessageSuccess(message)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    setIsEnableFetching(true)
    handleClose()
  }

  const onMutateError = (err: any) => {
    const message = {
      title: 'Yield Rate And Go Straight Form',
      message: 'บันทึกข้อมูลไม่สำเร็จ Saving failed' + `${err}`
    }

    ToastMessageError(message)
  }

  const { mutate: createImportMutation, isPending: isLoadingImportFile } = useCreateYieldRateImport(
    onMutateSuccess,
    onMutateError
  )

  function calculateYieldAccumulation(yieldRatesList: any) {
    let accumulation = 1

    for (const rate of yieldRatesList) {
      accumulation *= rate / 100
    }

    return (accumulation * 100).toFixed(4)
  }

  function sumOfProducts(yieldRatesList: any) {
    let total = 1

    for (const rate of yieldRatesList) {
      total *= rate / 100
    }

    return total.toFixed(4)
  }

  const handleImport = () => {
    const listData: any = []
    let listYR = []
    let listTotalYR = []
    let listGSR = []

    if (watch('fileData') == null) {
      ToastMessageError({
        title: 'Sct Form',
        message: 'Please choose YR-GSR file for upload.'
      })
      return
    }

    const fileData = watch('fileData')['content']

    if (watch('fileData')['content'].length === 0) {
      ToastMessageError({
        title: 'Sct Form',
        message: 'Please check data and try again'
      })
      return
    }

    // ** Separate Data By Product Type [Group By]
    const groupedByProductType = fileData.reduce((group: any, item: any) => {
      const { PRODUCT_TYPE_CODE } = item
      if (!group[PRODUCT_TYPE_CODE]) {
        group[PRODUCT_TYPE_CODE] = []
      }
      group[PRODUCT_TYPE_CODE].push(item)
      return group
    }, {})

    // console.log('Group-By', Object.keys(groupedByProductType)?.length)

    for (let i = 0; i < Object.keys(groupedByProductType)?.length; i++) {
      const element = groupedByProductType[Object.keys(groupedByProductType)[i]]
      listYR = []
      listTotalYR = []
      listGSR = []

      for (const data of element) {
        const yieldRate = Number(data.YIELD_RATE) * 100
        const gsr = Number(data.GO_STRAIGHT_RATE) * 100
        listYR.push(yieldRate)
        listGSR.push(gsr)
        listTotalYR.push(yieldRate)
      }

      const sopYR = sumOfProducts(listTotalYR)
      const sopGSR = sumOfProducts(listGSR)

      for (let j = 0; j < element.length; j++) {
        const el = element[j]
        const yieldAccumulate: any = calculateYieldAccumulation(listYR)
        listYR.shift()

        const dataItem = {
          FISCAL_YEAR: watch('searchFilters.FISCAL_YEAR')?.value,
          SCT_REASON_SETTING_ID: watch('searchFilters.SCT_REASON_SETTING')?.SCT_REASON_SETTING_ID || '',
          SCT_TAG_SETTING_ID: watch('searchFilters.SCT_TAG_SETTING')?.SCT_TAG_SETTING_ID || '',
          PRODUCT_TYPE_ID: el.PRODUCT_TYPE_ID,
          FLOW_ID: el.FLOW_ID,
          PROCESS_ID: el.PROCESS_ID,
          FLOW_PROCESS_NO: el.FLOW_PROCESS_NO,
          FLOW_PROCESS_ID: el.FLOW_PROCESS_ID,
          COLLECTION_POINT_FOR_SCT: el.COLLECTION_POINT == 'O' ? 1 : 0,
          GO_STRAIGHT_RATE_FOR_SCT: Number(el.GO_STRAIGHT_RATE) * 100,
          YIELD_ACCUMULATION_FOR_SCT: yieldAccumulate,
          YIELD_RATE_FOR_SCT: Number(el.YIELD_RATE * 100),
          TOTAL_YIELD_RATE_FOR_SCT: Number(sopYR) * 100,
          TOTAL_GO_STRAIGHT_RATE_FOR_SCT: Number(sopGSR) * 100,
          NOTE: el.NOTE,
          CREATE_BY: getUserData()?.EMPLOYEE_CODE
        }
        listData.push(dataItem)
      }
    }

    createImportMutation(listData)
  }

  return (
    <>
      <Dialog
        maxWidth='md'
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
            Yield Rate & Go Straight Rate
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Divider color='primary'>
                <Typography color='primary'>Header</Typography>
              </Divider>
            </Grid>
            <Grid container item>
              <Grid item xs={3}>
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
                      placeholder='Select ...'
                      value={watch('searchFilters.FISCAL_YEAR')}
                      {...(errors?.searchFilters?.FISCAL_YEAR && {
                        error: true,
                        helperText: errors?.searchFilters?.FISCAL_YEAR.message
                      })}
                    />
                  )}
                />
              </Grid>
            </Grid>
            {/* <Grid item xs={12} sm={4} lg={3}>
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
                </Grid> */}

            <Grid item xs={12}>
              <Divider color='primary'>
                <Typography color='primary'>Body</Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <FormProvider {...reactHookFormMethods}>
                <ImportDropzone />
              </FormProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoadingImportFile}
            onClick={() => handleSubmit(handleImport, onError)()}
            variant='contained'
            color='success'
          >
            {isLoadingImportFile ? (
              <>
                <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                <span className='ms-50'>Loading...</span>
              </>
            ) : (
              <>Import Data</>
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

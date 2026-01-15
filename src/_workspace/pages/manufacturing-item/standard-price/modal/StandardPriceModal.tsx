import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Slide,
  SlideProps,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography
} from '@mui/material'

import { useQueryClient } from '@tanstack/react-query'

import { FormProvider, SubmitErrorHandler, useForm, useFormState, Controller } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  array,
  nonEmpty,
  number,
  object,
  pipe,
  regex,
  string,
  // @ts-ignore
  type Input
} from 'valibot'

import StandardPriceDndAddTableData from './StandardPriceDndAddTableData'

import { StandardPriceI } from '@/_workspace/types/manufacturing-item/StandardPrice'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useStandardPrice'

import ConfirmModal from '@/components/ConfirmModal'

import { MRT_Row } from 'material-react-table'

import { typeFieldMessage } from '@/libs/valibot/error-message/errorMessage'
import { fetchStandardPriceDetail } from '@/_workspace/react-select/async-promise-load-options/fetchStandardPrice'
import CustomTextField from '@/components/mui/TextField'

// import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchSctPatternByLikePatternNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctPattern'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const addSchema = object({
  FISCAL_YEAR: object(
    {
      value: number(),
      label: number()
    },
    'Fiscal Year is required'
  ),
  SCT_PATTERN: object(
    {
      SCT_PATTERN_ID: number(),
      SCT_PATTERN_NAME: string()
    },
    'Sct Pattern is required'
  ),
  DATA: array(
    object({
      ITEM_CODE: object(
        {
          ITEM_MANUFACTURING_ID: number(),
          // ITEM_INTERNAL_SHORT_NAME: string(),
          ITEM_CODE_FOR_SUPPORT_MES: string(),
          USAGE_UNIT_CODE: string(),
          PURCHASE_UNIT_CODE: string(),
          USAGE_UNIT_RATIO: number(),
          PURCHASE_UNIT_RATIO: number()
        },
        'Item Code is required'
      ),
      PURCHASE_PRICE: pipe(
        string(typeFieldMessage({ fieldName: 'Purchase Price', typeName: 'String' })),
        nonEmpty('Please enter Purchase Price'),
        regex(/^\d+(\.\d{1,5})?$/, 'Please enter a valid price')
      ),
      PURCHASE_PRICE_CURRENCY: object(
        {
          CURRENCY_ID: number(),
          CURRENCY_SYMBOL: string(),
          CURRENCY_NAME: string()
        },
        'Purchase Price Currency is required'
      )
    })
  )
})

const viewSchema = object({
  ITEM_CODE_FOR_SUPPORT_MES: string(),
  ITEM_INTERNAL_SHORT_NAME: string(),
  VENDOR_NAME: string(),
  ITEM_IMPORT_TYPE_NAME: string(),
  EXCHANGE_RATE_VALUE: number(),
  PURCHASE_PRICE_CURRENCY_SYMBOL: string(),
  IMPORT_FEE_RATE: number(),
  PURCHASE_PRICE: number(),
  ITEM_M_S_PRICE_VALUE: number()
})

export type addFormData = Input<typeof addSchema>
export type viewFormData = Input<typeof viewSchema>

type Props =
  | {
      mode: 'add'
      openModalAdd: boolean
      setOpenModalAdd: Dispatch<SetStateAction<boolean>>
      setIsEnableFetching: Dispatch<SetStateAction<boolean>>
    }
  | {
      mode: 'view'
      openModalView: boolean
      setOpenModalView: Dispatch<SetStateAction<boolean>>
      rowSelected: MRT_Row<StandardPriceI> | null
      setRowSelected: Dispatch<SetStateAction<MRT_Row<StandardPriceI> | null>>
    }

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    backgroundColor: 'var(--background-color)',
    color: 'var(--secondary-color)'
  }
})

const StandardPriceModal = (props: Props) => {
  const { mode } = props

  const [isExcel, setIsExcel] = useState(false)
  const [isManual, setIsManual] = useState(false)

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form

  const reactHookFormMethods = useForm<addFormData | viewFormData>({
    resolver: valibotResolver(mode === 'add' ? addSchema : viewSchema),
    defaultValues:
      mode === 'add'
        ? { DATA: [] }
        : async (): Promise<viewFormData> => {
            const standardPriceDetail = await fetchStandardPriceDetail(props.rowSelected?.original.ITEM_ID)

            return standardPriceDetail[0]
          }
  })

  const { control, getValues, watch, handleSubmit } = reactHookFormMethods

  const { errors } = useFormState({
    control
  })

  useEffect(() => {
    if (getValues('DATA').length === 0) {
      setIsExcel(false)
      setIsManual(false)
    }
  }, [watch('DATA').length])

  const onSubmit = () => {
    let data = getValues('DATA')

    const tempSet = new Set()

    for (let item of data) {
      if (tempSet.has(item.ITEM_CODE.ITEM_ID)) {
        const message = {
          title: 'Add Manufacturing Item Price',
          message: 'มีข้อมูลที่ซ้ำกัน กรุณาตรวจสอบอีกครั้ง' + ' ' + item.ITEM_CODE.ITEM_CODE_FOR_SUPPORT_MES
        }

        ToastMessageError(message)
        return
      }

      tempSet.add(item.ITEM_CODE.ITEM_ID)
    }

    setConfirmModal(true)
  }

  // Functions

  const handleClose = () => {
    mode === 'add' ? props.setOpenModalAdd(false) : props.setOpenModalView(false)
    // reset()
  }

  const handleAdd = () => {
    setConfirmModal(false)

    let data = getValues('DATA')

    data = data.map((item: addFormData) => {
      return {
        ITEM_ID: item.ITEM_CODE.ITEM_ID,
        ITEM_CODE_FOR_SUPPORT_MES: item.ITEM_CODE.ITEM_CODE_FOR_SUPPORT_MES,
        PURCHASE_PRICE: item.PURCHASE_PRICE,
        PURCHASE_PRICE_CURRENCY_ID: item.PURCHASE_PRICE_CURRENCY.CURRENCY_ID,
        PURCHASE_PRICE_UNIT_ID: item.ITEM_CODE.PURCHASE_UNIT_ID
      }
    })

    const dataItem = {
      DATA: data,
      CREATE_BY: getUserData().EMPLOYEE_CODE,
      ITEM_M_O_PRICE_CREATE_FROM_SETTING_ID: 2, // Manual
      ITEM_M_S_PRICE_CREATE_FROM_SETTING_ID: 2, // Manual
      FISCAL_YEAR: getValues('FISCAL_YEAR').value,
      SCT_PATTERN_ID: getValues('SCT_PATTERN').SCT_PATTERN_ID
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Manufacturing Item Price'
      }

      ToastMessageSuccess(message)
      // setIsEnableFetching(true)
      mode === 'add' && props.setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Manufacturing Item Price',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Manufacturing Item Price',
      message: err?.response?.data?.Message ?? 'An error occurred'
    }

    ToastMessageError(message)
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // const formula = `Purchase Price * (1 / Exchange Rate) * (Purchase Unit Ratio / Usage Unit Ratio) + (Purchase Price * (1 / Exchange Rate) * (Purchase Unit Ratio / Usage Unit Ratio) * Import Fee Rate)`

  const formulaRender = `
  \\text{Purchase Price} \\times \\left( \\frac{1}{\\text{Exchange Rate}} \\right) \\times \\left( \\frac{\\text{Purchase Unit Ratio}}{\\text{Usage Unit Ratio}} \\right)
  + \\left( \\text{Purchase Price} \\times \\left( \\frac{1}{\\text{Exchange Rate}} \\right) \\times \\left( \\frac{\\text{Purchase Unit Ratio}}{\\text{Usage Unit Ratio}} \\right) \\times \\text{Import Fee Rate} \\right)
`

  return (
    <>
      <Dialog
        fullWidth={true}
        maxWidth={false}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={mode === 'add' ? props.openModalAdd : props.openModalView}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            {mode === 'add' ? 'Add Manufacturing Item Price' : 'View Manufacturing Item Price'}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <FormProvider {...reactHookFormMethods}>
          <DialogContent>
            {mode === 'add' ? (
              <Grid spacing={4} container>
                <Grid item xs={12} sm={12} lg={12}>
                  <Divider>
                    <Typography variant='h6' component='span' color='primary'>
                      Header
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={2} sm={2} lg={2}>
                  <Controller
                    name='FISCAL_YEAR'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        label='Fiscal Year'
                        {...fieldProps}
                        isClearable
                        options={Array.from({ length: 3 }, (_, i) => {
                          const year = new Date().getFullYear() - 1 + i
                          return { value: year, label: year }
                        })}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors.FISCAL_YEAR && {
                          error: true,
                          helperText: errors.FISCAL_YEAR.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={2} sm={2} lg={2}>
                  <Controller
                    name='SCT_PATTERN'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='SCT Pattern'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        //isDisabled={true}
                        loadOptions={async input => {
                          const result = await fetchSctPatternByLikePatternNameAndInuse(input, 1)
                          // setValue(
                          //   'SCT_PATTERN',
                          //   result.find(item => item.SCT_PATTERN_NAME === 'P3')
                          // )

                          return result
                        }}
                        getOptionValue={option => option.SCT_PATTERN_ID}
                        getOptionLabel={option => option.SCT_PATTERN_NAME}
                        classNamePrefix='select'
                        placeholder='Select ...'
                        {...(errors.SCT_PATTERN && {
                          error: true,
                          helperText: errors.SCT_PATTERN.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={12} lg={12}>
                  <Divider>
                    <Typography variant='h6' component='span' color='primary'>
                      Body
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={12} lg={12}>
                  <StandardPriceDndAddTableData
                    mode={mode}
                    setIsExcel={setIsExcel}
                    setIsManual={setIsManual}
                    isExcel={isExcel}
                    isManual={isManual}
                    setIsEnableFetching={props.setIsEnableFetching}
                    setOpenModalAdd={props.setOpenModalAdd}
                  />
                </Grid>
              </Grid>
            ) : (
              <>
                <Grid spacing={6} container>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='ITEM_CODE_FOR_SUPPORT_MES'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Item Code For Support MES'
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='ITEM_INTERNAL_SHORT_NAME'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Item Internal Short Name'
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid spacing={6} container className='mt-1'>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='VENDOR_NAME'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Vendor Name'
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='ITEM_IMPORT_TYPE_NAME'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Item Import Type Name'
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid spacing={6} container className='mt-1'>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='EXCHANGE_RATE_VALUE'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Exchange Rate'
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                          value={`1 THB = ${field.value} ${getValues('PURCHASE_PRICE_CURRENCY_SYMBOL')}`}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='IMPORT_FEE_RATE'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Import Fee Rate'
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid spacing={6} container className='mt-1'>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='PURCHASE_PRICE'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Purchase Price'
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                          value={`${parseFloat(field.value).toFixed(2)} ${getValues('PURCHASE_PRICE_CURRENCY_SYMBOL')}`}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6} lg={6}>
                    <Controller
                      name='ITEM_M_S_PRICE_VALUE'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label={
                            <div className='flex justify-center items-center'>
                              Manufacturing Item Price
                              {/* <Tooltip placement='top' title={formula}> */}
                              <NoMaxWidthTooltip title={<BlockMath math={formulaRender} />} placement='top'>
                                <i className='tabler-info-circle text-sm ms-1' />
                              </NoMaxWidthTooltip>
                            </div>
                          }
                          placeholder=''
                          autoComplete='off'
                          disabled={true}
                          value={`${parseFloat(field.value).toFixed(2)} THB`}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>
        </FormProvider>
        <DialogActions>
          {mode === 'add' && (
            <Button
              onClick={() => handleSubmit(onSubmit, onError)()}
              variant='contained'
              disabled={mutation.isPending}
              color='success'
            >
              {mutation.isPending ? 'Saving...' : 'Save & Complete'}
            </Button>
          )}
          <Button onClick={handleClose} variant='tonal' color='secondary' disabled={mutation.isPending}>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleAdd}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default StandardPriceModal

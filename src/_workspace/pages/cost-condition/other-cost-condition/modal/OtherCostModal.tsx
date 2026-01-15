import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

import {
  Button,
  Chip,
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

import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import {
  array,
  maxLength,
  minLength,
  nonEmpty,
  nullable,
  number,
  object,
  pipe,
  regex,
  string,
  transform,
  undefined,
  // @ts-ignore
  type Input
} from 'valibot'

import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import { OtherCostConditionI } from '@/_workspace/types/cost-condition/OtherCostCondition'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useOtherCostCondition'

import CustomTextField from '@/components/mui/TextField'
import ConfirmModal from '@/components/ConfirmModal'

import { MRT_Row } from 'material-react-table'

import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const schema = object({
  PRODUCT_MAIN: object(
    {
      PRODUCT_MAIN_ID: number(),
      PRODUCT_MAIN_NAME: string()
    },
    'Product main is required'
  ),
  FISCAL_YEAR: object(
    {
      value: number(),
      label: number()
    },
    'Fiscal Year is required'
  ),
  GA: pipe(
    string(),
    nonEmpty('GA is required'),
    regex(/^(0*(\d{1,2}(\.\d+)?)|\.\d+|100(\.0+$)?)$/, 'Percentage must be between 0 and 100')
  ),
  MARGIN: pipe(
    string(),
    nonEmpty('Margin is required'),
    regex(/^(0*(\d{1,2}(\.\d+)?)|\.\d+|100(\.0+$)?)$/, 'Percentage must be between 0 and 100')
  ),
  SELLING_EXPENSE: pipe(
    string(),
    nonEmpty('Selling Expense is required'),
    regex(/^(0*(\d{1,2}(\.\d+)?)|\.\d+|100(\.0+$)?)$/, 'Percentage must be between 0 and 100')
  ),
  VAT: pipe(
    string(),
    nonEmpty('VAT is required'),
    regex(/^(0*(\d{1,2}(\.\d+)?)|\.\d+|100(\.0+$)?)$/, 'Percentage must be between 0 and 100')
  ),
  CIT: pipe(
    string(),
    nonEmpty('CIT is required'),
    regex(/^(0*(\d{1,2}(\.\d+)?)|\.\d+|100(\.0+$)?)$/, 'Percentage must be between 0 and 100')
  )
})

type FormData = Input<typeof schema>

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
      rowSelected: MRT_Row<OtherCostConditionI> | null
      setRowSelected: Dispatch<SetStateAction<MRT_Row<OtherCostConditionI> | null>>
    }

const OtherCostModal = (props: Props) => {
  const { mode } = props

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues:
      mode === 'add'
        ? {
            PRODUCT_MAIN: null,
            FISCAL_YEAR: null,
            GA: '',
            MARGIN: '',
            SELLING_EXPENSE: '',
            VAT: '0',
            CIT: ''
          }
        : {
            PRODUCT_MAIN: {
              PRODUCT_MAIN_ID: props.rowSelected?.original.PRODUCT_MAIN_ID,
              PRODUCT_MAIN_NAME: props.rowSelected?.original.PRODUCT_MAIN_NAME
            },
            FISCAL_YEAR: {
              value: props.rowSelected?.original.FISCAL_YEAR,
              label: props.rowSelected?.original.FISCAL_YEAR
            },
            GA: props.rowSelected?.original.GA,
            MARGIN: props.rowSelected?.original.MARGIN,
            SELLING_EXPENSE: props.rowSelected?.original.SELLING_EXPENSE,
            VAT: props.rowSelected?.original.VAT,
            CIT: props.rowSelected?.original.CIT,
            VERSION: props.rowSelected?.original.VERSION
          }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    setConfirmModal(true)
  }

  // Functions

  const handleClose = () => {
    mode === 'add' ? props.setOpenModalAdd(false) : props.setOpenModalView(false)
    // reset()
  }

  const handleAdd = () => {
    setConfirmModal(false)

    const dataItem = {
      PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID,
      FISCAL_YEAR: getValues('FISCAL_YEAR').value,
      GA: parseFloat(getValues('GA')),
      MARGIN: parseFloat(getValues('MARGIN')),
      SELLING_EXPENSE: parseFloat(getValues('SELLING_EXPENSE')),
      VAT: parseFloat(getValues('VAT')),
      CIT: parseFloat(getValues('CIT')),

      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Other Cost Condition'
      }

      ToastMessageSuccess(message)
      // setIsEnableFetching(true)
      mode === 'add' && props.setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Other Cost Condition',
        message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Other Cost Condition',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  return (
    <>
      <Dialog
        maxWidth='xs'
        fullWidth={true}
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
            {mode === 'add' ? 'Add Other Cost Condition' : 'View Other Cost Condition'}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid spacing={4} container>
            <Grid item sm={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Header
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
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
                    isDisabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
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
                    value={watch('PRODUCT_MAIN')}
                    onChange={value => {
                      onChange(value)
                    }}
                    loadOptions={inputValue => {
                      return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                    }}
                    getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                    getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...(errors.PRODUCT_MAIN && {
                      error: true,
                      helperText: errors.PRODUCT_MAIN.message
                    })}
                    isDisabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
              <CustomTextField
                value={getValues('VERSION')}
                fullWidth
                label={
                  <>
                    Version No. <span className='text-gray-500'>(Auto)</span>
                  </>
                }
                placeholder='Auto'
                autoComplete='off'
                disabled={true}
              />
            </Grid>
            <Grid item sm={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Body
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
              <Controller
                name='GA'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    sx={{ width: '100%' }}
                    label='GA (%)'
                    onChange={e => {
                      onChange(e.target.value)
                    }}
                    {...(errors.GA && {
                      error: true,
                      helperText: errors.GA.message
                    })}
                    disabled={mode === 'view'}
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
              <Controller
                name='MARGIN'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    sx={{ width: '100%' }}
                    label='Margin (%)'
                    onChange={e => {
                      onChange(e.target.value)
                    }}
                    {...(errors.MARGIN && {
                      error: true,
                      helperText: errors.MARGIN.message
                    })}
                    disabled={mode === 'view'}
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
              <Controller
                name='SELLING_EXPENSE'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    sx={{ width: '100%' }}
                    label='Selling Expense (%)'
                    onChange={e => {
                      onChange(e.target.value)
                    }}
                    {...(errors.SELLING_EXPENSE && {
                      error: true,
                      helperText: errors.SELLING_EXPENSE.message
                    })}
                    disabled={mode === 'view'}
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
              <Controller
                name='VAT'
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    sx={{ width: '100%' }}
                    label='VAT (%)'
                    {...(errors.VAT && {
                      error: true,
                      helperText: errors.VAT.message
                    })}
                    disabled
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={12} lg={12}>
              <Controller
                name='CIT'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    sx={{ width: '100%' }}
                    label='CIT (%)'
                    onChange={e => {
                      onChange(e.target.value)
                    }}
                    {...(errors.CIT && {
                      error: true,
                      helperText: errors.CIT.message
                    })}
                    disabled={mode === 'view'}
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {mode === 'add' && (
            <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained'>
              Save & Complete
            </Button>
          )}
          <Button onClick={handleClose} variant='tonal' color='secondary'>
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

export default OtherCostModal

// React Imports
import type { Ref, ReactElement, SetStateAction, Dispatch, ChangeEvent } from 'react'
import { forwardRef, useEffect, useState } from 'react'
// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Slide } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

// Third-party Imports
import { useQueryClient } from '@tanstack/react-query'
import {
  object,
  string,
  nullable,
  number,
  unknown,
  array,
  boolean,
  picklist,
  optional,
  record,
  minLength,
  maxLength,
  pipe,
  nonEmpty,
  regex,
  date,
  nullish,
  custom,
  literal,
  union,
  parse
} from 'valibot'
import type { Input } from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
// Components Imports
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import ConfirmModal from '@components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

// React-hook-form Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'
// React Query Imports
import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useFiscalYearPeriodData'
// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import dayjs from 'dayjs'
import { Card } from 'reactstrap'
import { fetchMonthByLikeMonthShortNameEnglish } from '@/_workspace/react-select/async-promise-load-options/fetchMonth'
import {
  CustomerInvoiceToOption,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabetAndInuse,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot

const noNeedSchema = object({
  CUSTOMER_INVOICE_TO: object(
    {
      CUSTOMER_INVOICE_TO_ID: number(),
      CUSTOMER_INVOICE_TO_ALPHABET: string()
    },
    requiredFieldMessage({ fieldName: 'Customer Invoice To Alphabet' })
  ),
  p3StartMonthOfFiscalYear: object(
    {
      MONTH_ID: number(),
      MONTH_SHORT_NAME_ENGLISH: string()
    },
    requiredFieldMessage({ fieldName: 'P3 Start Month of Fiscal Year To' })
  )
})

const needSchema = object({
  CUSTOMER_INVOICE_TO: object(
    {
      CUSTOMER_INVOICE_TO_ID: number(),
      CUSTOMER_INVOICE_TO_ALPHABET: string()
    },
    requiredFieldMessage({ fieldName: 'Customer Invoice To Alphabet' })
  ),
  p2StartMonthOfFiscalYear: object(
    {
      MONTH_ID: number(),
      MONTH_SHORT_NAME_ENGLISH: string()
    },
    requiredFieldMessage({ fieldName: 'P2 Start Month of Fiscal Year To' })
  ),
  p3StartMonthOfFiscalYear: object(
    {
      MONTH_ID: number(),
      MONTH_SHORT_NAME_ENGLISH: string()
    },
    requiredFieldMessage({ fieldName: 'P3 Start Month of Fiscal Year To' })
  )
})

let schema = needSchema || noNeedSchema

function validateData(data: any) {
  let schema = data === 1 ? needSchema : noNeedSchema
  return parse(schema, data)
}

type FormData = Input<typeof schema>

// Props
interface FiscalYearPeriodAddModalProps {
  openAddModal: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const FiscalYearPeriodAddModal = ({
  openAddModal,
  setOpenModalAdd,
  setIsEnableFetching
}: FiscalYearPeriodAddModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)
  const [selectedValue, setSelectedValue] = useState<string>('1')

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      // @ts-ignore
      sctPattern: '1'
    }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit: SubmitHandler<FormData> = () => {
    setConfirmModal(true)
  }

  // Functions
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value)
    validateData(event.target.value)
  }
  const handleClose = () => {
    setOpenModalAdd(false)
    // reset()
  }

  const handleAddFiscalYearPeriod = () => {
    setConfirmModal(false)

    const dataItem = {
      CUSTOMER_INVOICE_TO_ID: watch('CUSTOMER_INVOICE_TO').CUSTOMER_INVOICE_TO_ID,
      P2_NEED: selectedValue === '1' ? 1 : 0,
      P2_START_MONTH_OF_FISCAL_YEAR_ID: watch('p2StartMonthOfFiscalYear').MONTH_ID,
      P3_START_MONTH_OF_FISCAL_YEAR_ID: watch('p3StartMonthOfFiscalYear').MONTH_ID,
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Fiscal Year Period'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Fiscal Year Period',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Fiscal Year Period' : data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  // useEffect(() => {
  //   console.log(watch('productMain.PRODUCT_MAIN_ID'))
  // }, [watch('productMain')?.PRODUCT_MAIN_ID])

  return (
    <>
      <Dialog
        maxWidth='sm'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openAddModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Fiscal Year Period
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-2' item md={12} sm={12}>
            <Controller
              name='CUSTOMER_INVOICE_TO'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom<CustomerInvoiceToOption>
                  label='Customer Invoice To'
                  inputId='CUSTOMER_INVOICE_TO'
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={getValues('CUSTOMER_INVOICE_TO')}
                  onChange={value => {
                    onChange(value)
                  }}
                  loadOptions={inputValue => {
                    return fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabetAndInuse(inputValue, 1)
                  }}
                  getOptionLabel={data => data.CUSTOMER_INVOICE_TO_ALPHABET.toString()}
                  getOptionValue={data => data.CUSTOMER_INVOICE_TO_ID.toString()}
                  classNamePrefix='select'
                  placeholder='Select Customer Invoice To ...'
                  {...(errors?.CUSTOMER_INVOICE_TO && {
                    error: true,
                    helperText: errors?.CUSTOMER_INVOICE_TO.message
                  })}
                />
              )}
            />
          </Grid>
          <Card style={{ padding: '8px', borderRadius: '10px', border: '1px solid var(--mui-palette-primary-main)' }}>
            <Grid className='mb-5'>
              <Grid item md={6} sm={12}>
                <Controller
                  name='sctPattern'
                  control={control}
                  render={({ field }) => (
                    <FormControl component='fieldset'>
                      {/* Label ด้านบน */}
                      <FormLabel component='legend'>
                        {
                          <Typography variant='h6' className='font-bold'>
                            SCT Pattern 2 (P2)
                          </Typography>
                        }
                      </FormLabel>
                      <RadioGroup {...field}>
                        <FormControlLabel
                          onChange={handleChange}
                          value='1'
                          checked={selectedValue === '1'}
                          control={<Radio />}
                          label='Need'
                        />
                        <FormControlLabel
                          onChange={handleChange}
                          value='0'
                          checked={selectedValue === '0'}
                          control={<Radio />}
                          label='No Need'
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
                {/* </FormControl> */}
              </Grid>
            </Grid>
            {selectedValue === '1' && (
              <Grid className='mb-5' item xs={12} sm={6} lg={6}>
                <Controller
                  name='p2StartMonthOfFiscalYear'
                  control={control}
                  render={({ field: { ...fieldProps } }) => (
                    <AsyncSelectCustom
                      label='Start Month of Fiscal Year'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        return fetchMonthByLikeMonthShortNameEnglish(inputValue)
                      }}
                      getOptionLabel={data => data.MONTH_SHORT_NAME_ENGLISH}
                      getOptionValue={data => data.MONTH_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select ...'
                      {...(errors?.p2StartMonthOfFiscalYear && {
                        error: true,
                        helperText: errors?.p2StartMonthOfFiscalYear.message
                      })}
                    />
                  )}
                />
              </Grid>
            )}
          </Card>
          <Card
            style={{
              padding: '8px',
              borderRadius: '10px',
              border: '1px solid var(--mui-palette-primary-main)',
              marginTop: '10px'
            }}
          >
            <Typography variant='h6' className='font-bold'>
              SCT Pattern 3 (P3)
            </Typography>
            <Grid className='mt-2 mb-5' item xs={12} sm={6} lg={6}>
              <Controller
                name='p3StartMonthOfFiscalYear'
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Start Month of Fiscal Year'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      return fetchMonthByLikeMonthShortNameEnglish(inputValue)
                    }}
                    getOptionLabel={data => data.MONTH_SHORT_NAME_ENGLISH}
                    getOptionValue={data => data.MONTH_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select ...'
                    {...(errors?.p3StartMonthOfFiscalYear && {
                      error: true,
                      helperText: errors?.p3StartMonthOfFiscalYear.message
                    })}
                  />
                )}
              />
            </Grid>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' color='success'>
            Save & Complete
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleAddFiscalYearPeriod}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default FiscalYearPeriodAddModal

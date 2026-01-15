import type { Ref, ReactElement, Dispatch, SetStateAction, ChangeEvent } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { SlideProps } from '@mui/material'
import { Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Slide } from '@mui/material'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, set, useForm, useFormContext, useFormState, useWatch } from 'react-hook-form'
import type { FadeProps } from '@mui/material/Fade'
import Fade from '@mui/material/Fade'
import AsyncSelect from 'react-select/async'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import AddIcon from '@mui/icons-material/Add'

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
  nullish,
  pipe,
  nonEmpty,
  date,
  regex,
  parse
} from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useFiscalYearPeriodData'
import CustomTextField from '@/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MRT_Row } from 'material-react-table'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import SelectCustom from '@/components/react-select/SelectCustom'
import { json } from 'stream/consumers'

import data from '@/data/searchData'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import dayjs from 'dayjs'
import moment from 'moment'
import { FiscalYearPeriodI } from '@/_workspace/types/sct/FiscalYearPeriodType'
import { Card } from 'reactstrap'
import {
  CustomerInvoiceToOption,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabetAndInuse
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { fetchMonthByLikeMonthShortNameEnglish } from '@/_workspace/react-select/async-promise-load-options/fetchMonth'
import { RowSelection } from '@tanstack/react-table'
import { isDirty } from 'zod'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

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

let schema = noNeedSchema

function validateData(data: any) {
  let schemaSwitch = data === '1' ? needSchema : noNeedSchema
  return parse(schemaSwitch, data)
}

type FormData = Input<typeof schema>

interface FiscalYearPeriodModalProps {
  openEditModal: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<FiscalYearPeriodI> | null
}
interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const FiscalYearPeriodEditModal = ({
  openEditModal,
  setOpenModalEdit,
  rowSelected,
  isEnableFetching,
  setIsEnableFetching
}: Props & FiscalYearPeriodModalProps) => {
  // useState

  const [selectedValue, setSelectedValue] = useState<string>()

  const [confirmModal, setConfirmModal] = useState(false)

  const handleClickOpen = () => setOpenModalEdit(true)
  const handleClose = () => {
    setOpenModalEdit(false)
    //reset()
  }

  // Hooks : react-hook-form

  const { control, getValues, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      // CUSTOMER_INVOICE_TO: {
      //   CUSTOMER_INVOICE_TO_ID: rowSelected?.original?.CUSTOMER_INVOICE_TO_ID,
      //   CUSTOMER_INVOICE_TO_ALPHABET: rowSelected?.original?.CUSTOMER_INVOICE_TO_ALPHABET
      // },
      p2StartMonthOfFiscalYear: {
        MONTH_ID: rowSelected?.original?.P2_START_MONTH_OF_FISCAL_YEAR_ID,
        MONTH_SHORT_NAME_ENGLISH: rowSelected?.original?.P2_START_MONTH_OF_FISCAL_YEAR_NAME
      },
      // p3StartMonthOfFiscalYear: {
      //   MONTH_ID: rowSelected?.original?.P3_START_MONTH_OF_FISCAL_YEAR_ID,
      //   MONTH_SHORT_NAME_ENGLISH: rowSelected?.original?.P3_START_MONTH_OF_FISCAL_YEAR_NAME
      // },
      status: StatusOption.find(item => item.value == rowSelected?.original?.INUSE)
    }
  })
  const { errors, isDirty } = useFormState({
    control
  })

  useEffect(() => {
    let data: ChangeEvent<HTMLInputElement>
    if (rowSelected?.original?.P2_NEED === 1) {
      setSelectedValue('1')
      // data = {
      //   target: {
      //     value: 'Need'
      //   }
      // }
      // validateData(data)
    } else {
      setSelectedValue('0')
      // data = {
      //   target: {
      //     value: 'No Need'
      //   }
      // }
      // validateData(data)
      //  validateData(event?.target?.value)
    }
  }, [])

  const onSubmit: SubmitHandler<FormData> = () => {
    if (isDirty === false) {
      const message = {
        title: 'Update Section',
        message: 'ข้อมูลไม่มีการเปลี่ยนแปลง Data is not changed'
      }
      ToastMessageError(message)
      return
    }
    setConfirmModal(true)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('INPUT', event.target.value)
    setSelectedValue(event.target.value)
    validateData(event.target.value)
  }

  // Functions
  const handleEditFiscalYearPeriod = () => {
    setConfirmModal(false)

    const dataItem = {
      //DEPARTMENT_ID: getValues('department')?.DEPARTMENT_ID,
      HOLIDAY_TYPE_ID: watch('holidayTypeName')?.HOLIDAY_TYPE_ID,
      HOLIDAY_DATE: dayjs(watch('holidayDate')).format('YYYY-MM-DD'),
      HOLIDAY_ID: rowSelected?.original?.HOLIDAY_ID,
      HOLIDAY_TITLE_NAME: watch('holidayTitleName'),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Update Section'
      }
      setIsEnableFetching(true)
      ToastMessageSuccess(message)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Update Section',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Section' : data.data.Message
      }
      ToastMessageError(message)
    }
  }

  const onMutateError = () => {
    console.log('onMutateError')
  }

  const mutation = useUpdate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query

  const queryClient = useQueryClient()

  const isNeesP2 = useWatch({ control, name: '' })

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
        open={openEditModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit Fiscal Year Period
          </Typography>

          {/* {JSON.stringify(getValues('holidayDate'))} */}
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-2' item md={12} sm={12}>
            <Controller
              defaultValue={{
                CUSTOMER_INVOICE_TO_ID: rowSelected?.original?.CUSTOMER_INVOICE_TO_ID,
                CUSTOMER_INVOICE_TO_ALPHABET: rowSelected?.original?.CUSTOMER_INVOICE_TO_ALPHABET
              }}
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
                  value={watch('CUSTOMER_INVOICE_TO')}
                  onChange={value => {
                    onChange(value)
                  }}
                  loadOptions={inputValue => {
                    return fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabetAndInuse(inputValue, 1)
                  }}
                  getOptionLabel={data => data?.CUSTOMER_INVOICE_TO_ALPHABET}
                  getOptionValue={data => data?.CUSTOMER_INVOICE_TO_ID.toString()}
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
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <FormControl component='fieldset'>
                      <FormLabel component='legend'>
                        {
                          <Typography variant='h6' className='font-bold'>
                            SCT Pattern 2 (P2)
                          </Typography>
                        }
                      </FormLabel>
                      <RadioGroup {...fieldProps}>
                        <FormControlLabel
                          onClick={() => {
                            console.log('Need You')
                            onChange('1')
                            // handleChange({
                            //   target: {
                            //     name: 'sctPattern',
                            //     value: '1'
                            //   }
                            // })
                            setValue('p2StartMonthOfFiscalYear', null, { shouldValidate: true })
                            // setIsOpenMasterDataSelectionModal(true)
                          }}
                          // onChange={handleChange}
                          value='1'
                          checked={selectedValue === '1'}
                          control={<Radio />}
                          label='Need'
                        />
                        <FormControlLabel
                          onChange={handleChange}
                          // onChange={() => {
                          //   // onChange(value)
                          //   handleChange
                          //   setValue('p2StartMonthOfFiscalYear', '')
                          // }}
                          // onChange={(setValue('p2StartMonthOfFiscalYear', null), handleChange)}
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
            {selectedValue === '1' ? (
              <Grid className='mb-5' item xs={12} sm={6} lg={6}>
                {JSON.stringify(watch('p2StartMonthOfFiscalYear'))}
                <Controller
                  name='p2StartMonthOfFiscalYear'
                  control={control}
                  // defaultValue={{
                  //   MONTH_ID: rowSelected?.original?.P2_START_MONTH_OF_FISCAL_YEAR_ID,
                  //   MONTH_SHORT_NAME_ENGLISH: rowSelected?.original?.P2_START_MONTH_OF_FISCAL_YEAR_NAME
                  // }}
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
                      getOptionLabel={data => data?.MONTH_SHORT_NAME_ENGLISH}
                      getOptionValue={data => data?.MONTH_ID}
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
            ) : null}
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
                defaultValue={{
                  MONTH_ID: rowSelected?.original?.P3_START_MONTH_OF_FISCAL_YEAR_ID,
                  MONTH_SHORT_NAME_ENGLISH: rowSelected?.original?.P3_START_MONTH_OF_FISCAL_YEAR_NAME
                }}
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
                    getOptionLabel={data => data?.MONTH_SHORT_NAME_ENGLISH}
                    getOptionValue={data => data?.MONTH_ID}
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
          <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained'>
            Save
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleEditFiscalYearPeriod}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default FiscalYearPeriodEditModal

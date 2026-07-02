import type { ChangeEvent, Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import type { SlideProps } from '@mui/material'
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Slide } from '@mui/material'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState, useWatch } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useFiscalYearPeriodData'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MRT_Row } from 'material-react-table'

import ConfirmModal from '@/components/ConfirmModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

import {
  CustomerInvoiceToOption,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToAlphabetAndInuse
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { fetchMonthByLikeMonthShortNameEnglish } from '@/_workspace/react-select/async-promise-load-options/fetchMonth'
import { FiscalYearPeriodI } from '@/_workspace/types/sct/FiscalYearPeriodType'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from 'reactstrap'
import { FormSchema, formSchema } from './formSchema'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

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

  const { control, getValues, handleSubmit, setValue, watch } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasP2: rowSelected?.original?.P2_NEED === 1 ? true : false,
      CUSTOMER_INVOICE_TO: {
        CUSTOMER_INVOICE_TO_ID: rowSelected?.original?.CUSTOMER_INVOICE_TO_ID,
        CUSTOMER_INVOICE_TO_ALPHABET: rowSelected?.original?.CUSTOMER_INVOICE_TO_ALPHABET
      },
      p2StartMonthOfFiscalYear: {
        MONTH_ID: rowSelected?.original?.P2_START_MONTH_OF_FISCAL_YEAR_ID,
        MONTH_SHORT_NAME_ENGLISH: rowSelected?.original?.P2_START_MONTH_OF_FISCAL_YEAR_NAME
      },
      p3StartMonthOfFiscalYear: {
        MONTH_ID: rowSelected?.original?.P3_START_MONTH_OF_FISCAL_YEAR_ID,
        MONTH_SHORT_NAME_ENGLISH: rowSelected?.original?.P3_START_MONTH_OF_FISCAL_YEAR_NAME
      }
    }
  })

  const { errors, isDirty } = useFormState({
    control
  })

  useEffect(() => {
    if (rowSelected?.original?.P2_NEED === 1) {
      setSelectedValue('1')
    } else {
      setSelectedValue('0')
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
    // console.log('INPUT', event.target.value)
    setSelectedValue(event.target.value)
    // validateData(event.target.value)
  }

  // Functions
  const handleEditFiscalYearPeriod = () => {
    setConfirmModal(false)

    const dataItem = {
      FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID:
        rowSelected?.original?.FISCAL_YEAR_PERIOD_REFER_TO_CUSTOMER_INVOICE_TO_ID,
      CUSTOMER_INVOICE_TO_ID: watch('CUSTOMER_INVOICE_TO').CUSTOMER_INVOICE_TO_ID,
      P2_NEED: selectedValue === '1' ? 1 : 0,
      P2_START_MONTH_OF_FISCAL_YEAR_ID: watch('p2StartMonthOfFiscalYear').MONTH_ID,
      P3_START_MONTH_OF_FISCAL_YEAR_ID: watch('p3StartMonthOfFiscalYear').MONTH_ID,
      INUSE: rowSelected?.original?.INUSE,
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
                  label='Customer Invoice To Alphabet'
                  inputId='CUSTOMER_INVOICE_TO'
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  value={watch('CUSTOMER_INVOICE_TO')}
                  getOptionLabel={data => data?.CUSTOMER_INVOICE_TO_ALPHABET}
                  getOptionValue={data => data?.CUSTOMER_INVOICE_TO_ID.toString()}
                  classNamePrefix='select'
                  placeholder='Select ...'
                  isDisabled
                  {...(errors?.CUSTOMER_INVOICE_TO && {
                    error: true,
                    helperText: errors?.CUSTOMER_INVOICE_TO.message
                  })}
                />
              )}
            />
          </Grid>
          <Card
            style={{
              padding: 15,
              borderRadius: 5,
              border: '2px solid var(--mui-palette-primary-lightOpacity)',
              marginTop: '10px'
            }}
          >
            <Grid className='mb-5'>
              <Grid item md={6} sm={12}>
                <Controller
                  name='hasP2'
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
                            onChange(true)
                            handleChange({
                              target: {
                                name: 'sctPattern',
                                value: '1'
                              }
                            })
                            setValue('p2StartMonthOfFiscalYear', null)
                            // setIsOpenMasterDataSelectionModal(true)
                          }}
                          // onChange={handleChange}
                          value='1'
                          checked={selectedValue === '1'}
                          control={<Radio />}
                          label='Need'
                        />
                        <FormControlLabel
                          onClick={() => {
                            onChange(false)
                            handleChange({
                              target: {
                                name: 'sctPattern',
                                value: '0'
                              }
                            })
                          }}
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
              <Grid item xs={12} sm={6} lg={6}>
                {/* {JSON.stringify(watch('p2StartMonthOfFiscalYear'))} */}
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
              padding: 15,
              borderRadius: 5,
              border: '2px solid var(--mui-palette-primary-lightOpacity)',
              marginTop: '10px'
            }}
          >
            <Typography variant='h6' className='font-bold'>
              SCT Pattern 3 (P3)
            </Typography>
            <Grid className='mt-2' item xs={12} sm={6} lg={6}>
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

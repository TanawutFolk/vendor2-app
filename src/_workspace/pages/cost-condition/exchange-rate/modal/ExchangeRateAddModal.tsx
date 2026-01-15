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

import { array, nonEmpty, number, object, pipe, regex, string, transform } from 'valibot'
import type { Input } from 'valibot'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useExchangeRateData'

import CustomTextField from '@/components/mui/TextField'
import ConfirmModal from '@/components/ConfirmModal'
import {
  CurrencyOption,
  fetchCurrencySymbolByCurrencySymbolAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchCurrency'
import SelectCustom from '@/components/react-select/SelectCustom'
import ConfirmModalCustom from '@/components/ConfirmModalCustom'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  FISCAL_YEAR: object(
    {
      value: number(),
      label: number()
    },
    'Fiscal Year is required'
  ),
  CURRENCY_DATA: array(
    object({
      CURRENCY_ID: number(),
      CURRENCY_VALUE: pipe(
        string(),
        nonEmpty('Currency Value is required'),
        regex(/^\d+(?:\.\d+)?$/, 'Invalid Number'),
        transform((value: string) => Number(value))
      )
    }),
    'All fields are required'
  )
})

type FormData = Input<typeof schema>

interface AddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ExchangeRateAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: AddModalProps) => {
  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)
  const [confirmModalCustom, setConfirmModalCustom] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: async (): Promise<FormData> => {
      let currency = await fetchCurrencySymbolByCurrencySymbolAndInuse('')
      console.log(currency)

      //Pajjaphon

      // currency = currency.map(item => {
      //   if (item.CURRENCY_SYMBOL === 'THB') {
      //     return {
      //       ...item,
      //       CURRENCY_VALUE: '1'
      //     }
      //   }

      //   return {
      //     ...item,
      //     CURRENCY_VALUE: ''
      //   }
      // })
      currency = currency
        .filter(item => item.CURRENCY_SYMBOL !== 'THB')
        .map(item => {
          return {
            ...item,
            CURRENCY_VALUE: ''
          }
        })

      return {
        FISCAL_YEAR: null,
        CURRENCY_DATA: currency
      }
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
    setOpenModalAdd(false)
    // reset()
  }

  const handleConfirm = () => {
    setConfirmModalCustom(true)
  }

  const handleAdd = () => {
    setConfirmModal(false)
    setConfirmModalCustom(false)

    const dataItem = {
      FISCAL_YEAR: getValues('FISCAL_YEAR').value,
      CURRENCY_DATA: getValues('CURRENCY_DATA'),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    dataItem.CURRENCY_DATA = dataItem.CURRENCY_DATA.map((item: CurrencyOption) => {
      return { ...item, CURRENCY_VALUE: parseFloat(item?.CURRENCY_VALUE ?? '0').toString() }
    })

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Exchange Rate'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Exchange Rate',
        message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Exchange Rate',
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
        maxWidth='sm'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openModalAdd}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Exchange Rate
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
            <Grid item xs={12} sm={6} lg={6}>
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
            <Grid item xs={12} sm={6} lg={6}>
              <CustomTextField
                fullWidth
                label={
                  <>
                    Version <span className='text-gray-500'>(Auto)</span>
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
            {/* <Grid spacing={6} container textAlign='center' className='mt-1' alignItems='center'> */}
            {watch('CURRENCY_DATA')?.map((item: CurrencyOption, index: number) => {
              if (item.CURRENCY_SYMBOL === 'THB') {
                return null
              }

              return (
                <>
                  <Grid container item spacing={4} className='flex items-center justify-center'>
                    <Grid item xs={2} sm={2} lg={2} key={item.CURRENCY_ID}>
                      <Typography variant='body1' component='span'>
                        1 THB
                      </Typography>
                    </Grid>
                    <Grid item xs={2} sm={2} lg={2} key={item.CURRENCY_ID}>
                      <Typography variant='body1' component='span'>
                        =
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={6} lg={6} key={item.CURRENCY_ID}>
                      <Controller
                        name='CURRENCY_DATA'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            type='number'
                            fullWidth
                            label=''
                            placeholder='0'
                            autoComplete='off'
                            value={item.CURRENCY_VALUE}
                            onChange={e => {
                              const value = e.target.value
                              const data = getValues('CURRENCY_DATA')

                              const index = data.findIndex((x: CurrencyOption) => x.CURRENCY_ID === item.CURRENCY_ID)

                              data[index] = { ...data[index], CURRENCY_VALUE: value }

                              fieldProps.onChange(data)
                            }}
                            {...(errors.CURRENCY_DATA?.[index] && {
                              error: true,
                              helperText: errors.CURRENCY_DATA?.[index].CURRENCY_VALUE.message
                            })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={2} sm={2} lg={2} key={item.CURRENCY_ID} className='flex items-center justify-start'>
                      <div className='aspect-[64/43] w-5 relative me-2'>
                        <image src={item.CURRENCY_IMAGE} alt={`${item.CURRENCY_SYMBOL} flags.`} fill />
                      </div>
                      <Typography variant='body1' component='span'>
                        {item.CURRENCY_SYMBOL}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleSubmit(onSubmit, onError)()}
            variant='contained'
            color='success'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save & Complete'}
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary' disabled={mutation.isPending}>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleConfirm}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />

        <ConfirmModalCustom
          show={confirmModalCustom}
          onConfirmClick={handleAdd}
          menu='Exchange Rate'
          onCloseClick={() => {
            setConfirmModalCustom(false)
            setConfirmModal(false)
          }}
          isDelete={false}
          isLoading={mutation.isPending}
        />
      </Dialog>
    </>
  )
}

export default ExchangeRateAddModal

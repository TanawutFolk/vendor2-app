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
  Typography
} from '@mui/material'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'

import { array, nonEmpty, number, object, pipe, regex, string, transform, type Input } from 'valibot'

import { ImportFeeI } from '@/_workspace/types/cost-condition/ImportFee'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useCreate } from '@/_workspace/react-query/hooks/useImportFee'

import CustomTextField from '@/components/mui/TextField'
import ConfirmModal from '@/components/ConfirmModal'

import { MRT_Row } from 'material-react-table'

import SelectCustom from '@/components/react-select/SelectCustom'
import {
  fetchItemImportTypeByItemImportTypeNameAndInuse,
  ItemImportTypeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItemImportType'
import ConfirmModalCustom from '@/components/ConfirmModalCustom'

// Dialog
const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

const schema = object({
  FISCAL_YEAR: object(
    {
      value: number(),
      label: number()
    },
    'Fiscal Year is required'
  ),
  IMPORT_FEE_RATE_DATA: array(
    object({
      ITEM_IMPORT_TYPE_ID: number(),
      IMPORT_FEE_RATE: pipe(
        string(),
        nonEmpty('Import Fee Rate is required'),
        regex(/^\d+(?:\.\d+)?$/, 'Invalid Number'),
        transform((value: string) => Number(value))
      )
    }),
    'All fields are required'
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
      rowSelected: MRT_Row<ImportFeeI> | null
      setRowSelected: Dispatch<SetStateAction<MRT_Row<ImportFeeI> | null>>
    }

const ImportFeeModal = (props: Props) => {
  const { mode } = props

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)
  const [confirmModalCustom, setConfirmModalCustom] = useState(false)
  // const [menu, setMenu] = useState('Import Fee')

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues:
      mode === 'add'
        ? async (): Promise<FormData> => {
            let itemImportType = await fetchItemImportTypeByItemImportTypeNameAndInuse('')

            itemImportType = itemImportType.filter(item => item.ITEM_IMPORT_TYPE_ID !== 1)

            itemImportType = itemImportType.map(item => {
              return {
                ...item,
                IMPORT_FEE_RATE: ''
              }
            })

            return {
              FISCAL_YEAR: null,
              IMPORT_FEE_RATE_DATA: itemImportType
            }
          }
        : {
            FISCAL_YEAR: {
              value: props.rowSelected?.original.FISCAL_YEAR,
              label: props.rowSelected?.original.FISCAL_YEAR
            },
            IMPORT_FEE_RATE_DATA: [
              {
                ITEM_IMPORT_TYPE_ID: props.rowSelected?.original.ITEM_IMPORT_TYPE_ID,
                ITEM_IMPORT_TYPE_NAME: props.rowSelected?.original.ITEM_IMPORT_TYPE_NAME,
                IMPORT_FEE_RATE: props.rowSelected?.original.IMPORT_FEE_RATE
              }
            ]
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

  const handleConfirm = () => {
    setConfirmModalCustom(true)
  }

  const handleAdd = () => {
    setConfirmModal(false)
    setConfirmModalCustom(false)

    const dataItem = {
      IMPORT_FEE_RATE_DATA: getValues('IMPORT_FEE_RATE_DATA'),
      FISCAL_YEAR: getValues('FISCAL_YEAR').value,

      CREATE_BY: getUserData()?.EMPLOYEE_CODE
    }

    dataItem.IMPORT_FEE_RATE_DATA = dataItem.IMPORT_FEE_RATE_DATA.map((item: ItemImportTypeOption) => {
      return { ...item, IMPORT_FEE_RATE: parseFloat(item?.IMPORT_FEE_RATE ?? '0').toString() }
    })

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Import Fee'
      }

      ToastMessageSuccess(message)
      // setIsEnableFetching(true)
      mode === 'add' && props.setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Import Fee',
        message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')

    const message = {
      title: 'Add Import Fee',
      message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
    }

    ToastMessageError(message)
  }

  const mutation = useCreate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  useEffect(() => {
    console.log(watch())
  }, [watch('IMPORT_FEE_RATE_DATA')])

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
            {mode === 'add' ? 'Add Import Fee' : 'View Import Fee'}
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
                    placeholder='Select Fiscal Year ...'
                    {...(errors.FISCAL_YEAR && {
                      error: true,
                      helperText: errors.FISCAL_YEAR.message
                    })}
                    isDisabled={mode === 'view'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <CustomTextField
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

            {watch('IMPORT_FEE_RATE_DATA')?.map((item: ItemImportTypeOption, index: number) => {
              if (item.ITEM_IMPORT_TYPE_ID === 1) {
                return null
              }

              return (
                <>
                  <Grid container item spacing={4} className='flex items-center justify-center'>
                    <Grid item xs={2} sm={2} lg={2} key={item.ITEM_IMPORT_TYPE_ID}>
                      <Typography variant='body1' component='span'>
                        {item.ITEM_IMPORT_TYPE_NAME}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sm={4} lg={4} key={item.ITEM_IMPORT_TYPE_ID}>
                      <Typography variant='body1' component='span'>
                        =
                      </Typography>
                    </Grid>
                    <Grid item xs={5} sm={5} lg={5} key={item.ITEM_IMPORT_TYPE_ID}>
                      <Controller
                        name='IMPORT_FEE_RATE_DATA'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <CustomTextField
                            // InputProps={{
                            //   sx: {
                            //     appearance: 'none'
                            //   }
                            // }}
                            disabled={mode === 'view'}
                            type='number'
                            fullWidth
                            label=''
                            placeholder='0'
                            autoComplete='off'
                            value={item.IMPORT_FEE_RATE}
                            onChange={e => {
                              const value = e.target.value
                              const data = getValues('IMPORT_FEE_RATE_DATA')

                              const index = data.findIndex(
                                (x: ItemImportTypeOption) => x.ITEM_IMPORT_TYPE_ID === item.ITEM_IMPORT_TYPE_ID
                              )

                              data[index] = { ...data[index], IMPORT_FEE_RATE: value }

                              fieldProps.onChange(data)
                            }}
                            {...(errors.IMPORT_FEE_RATE_DATA?.[index] && {
                              error: true,
                              helperText: errors.IMPORT_FEE_RATE_DATA?.[index].IMPORT_FEE_RATE.message
                            })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={1}
                      sm={1}
                      lg={1}
                      key={item.ITEM_IMPORT_TYPE_ID}
                      className='flex items-center justify-center'
                    >
                      <Typography variant='body1' component='span'>
                        %
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          {mode === 'add' && (
            <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save & Complete'}
            </Button>
          )}
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
          menu='Import Fee'
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

export default ImportFeeModal

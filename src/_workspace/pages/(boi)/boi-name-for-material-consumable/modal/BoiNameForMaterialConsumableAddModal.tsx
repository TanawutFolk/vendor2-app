// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import type { SlideProps } from '@mui/material'
import { Grid, Slide } from '@mui/material'
import type { SubmitErrorHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import { maxLength, minLength, number, object, pipe, string } from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import CustomTextField from '@/@core/components/mui/TextField'
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import {
  PREFIX_QUERY_KEY,
  useCreateBoiNameForMaterialConsumable
} from '@/_workspace/react-query/hooks/useBoiNameForMaterialConsumableData'
import {
  BoiNameForMaterialConsumableOption,
  fetchBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId,
  fetchBoiGroupNo,
  fetchBoiSearchDescriptionSubName
} from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiNameForMaterial'
import { fetchBoiProjectByLikeBoiProjectAndInuse } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiProject'
import { fetchBoiUnit } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiUnit'
import AsyncCreatableSelectCustom from '@/components/react-select/AsyncCreatableSelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = Input<typeof schema>

const schema = object({
  boiProject: object(
    {
      BOI_PROJECT_ID: number(typeFieldMessage({ fieldName: 'BOI Project Id', typeName: 'Number' })),
      BOI_PROJECT_NAME: string(typeFieldMessage({ fieldName: 'BOI Project Name', typeName: 'String' }))
    },
    requiredFieldMessage({ fieldName: 'BOI Project' })
  ),

  boiGroupNo: object(
    {
      label: pipe(
        string(),
        minLength(6, minLengthFieldMessage({ fieldName: 'BOI Group No', minLength: 6 })),
        maxLength(6, maxLengthFieldMessage({ fieldName: 'BOI Group No', maxLength: 6 }))
      )
    },
    requiredFieldMessage({ fieldName: 'BOI Group No' })
  ),
  boiDescriptionMainName: object(
    {
      value: string(),
      label: string()
    },
    requiredFieldMessage({ fieldName: 'BOI Description Main Name' })
  ),
  boiUnitId: object(
    {
      BOI_UNIT_ID: number(),
      BOI_UNIT_SYMBOL: string()
    },
    requiredFieldMessage({ fieldName: 'BOI Unit Symbol' })
  )

  // boiProject: pipe(
  //   BOI_PROJECT_ID: number(
  //     typeFieldMessage({ fieldName: 'Environment Certificate Id', typeName: 'Number' })
  //   ),
  //   BOI_PROJECT_NAME: string(
  //     typeFieldMessage({ fieldName: 'Environment Certificate Name', typeName: 'String' })
  //   )
  // ),
  // boiUnitSymbol: pipe(
  //   string(typeFieldMessage({ fieldName: 'BOI Unit Symbol', typeName: 'String' })),
  //   nonEmpty('Please enter your Product Category Alphabet'),
  //   minLength(2, minLengthFieldMessage({ fieldName: 'BOI Unit Symbol', minLength: 2 })),
  //   maxLength(2, maxLengthFieldMessage({ fieldName: 'BOI Unit Symbol', maxLength: 2 })),
  //   regex(/^[A-Z]/, uppercaseFieldMessage({ fieldName: 'BOI Unit Symbol' }))
  // )
})

// productCategoryAlphabet: string(typeFieldMessage({ fieldName: 'Product Category Alphabet', typeName: 'String' }), [
//   regex(/[A-Z]/, uppercaseFieldMessage({ fieldName: 'Product Category Alphabet' }))
// ])

interface BoiUnitAddModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const BoiUnitAddModal = ({ openModalAdd, setOpenModalAdd, setIsEnableFetching }: BoiUnitAddModalProps) => {
  // useState

  // States : Modal
  // const [openModalAdd, setOpenModalAdd] = useState<boolean>(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const handleClickOpen = () => setOpenModalAdd(true)

  const [options, setOptions] = useState('boiGroupNo')

  const handleCreateOption = async inputValue => {
    const newOption = { label: inputValue, value: inputValue, __isNew__: true }
    setOptions(prev => [...prev, newOption])

    setValue(
      'boiGroupNo',
      newOption,

      { shouldDirty: true, shouldValidate: true }
    )

    setValue('boiDescriptionMainName', '')
    setValue('boiUnitId', '')
    console.log('NewOpp', newOption)
  }

  const handleClose = () => {
    setOpenModalAdd(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: valibotResolver(schema),
    // defaultValues
    defaultValues: {
      //boiProject: '',
      //boiGroupNo: '',
      boiDescriptionMainName: '',
      boiDescriptionSubName: '',
      boiProjectCode: ''
      //boiUnitId: ''
    }
  })

  // const { control, handleSubmit, setValue } = reactHookFormMethods

  const { errors } = useFormState({
    control
  })

  // const onSubmit: SubmitHandler<FormData> = data => {
  //   handleAdd(data)

  //   setConfirmModal(true)
  //   // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  //   // handleClose()
  // }
  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('ERROR', data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const handleAdd = () => {
    setConfirmModal(false)

    const dataItem = {
      BOI_PROJECT_CODE: getValues('boiProject').BOI_PROJECT_CODE,
      BOI_PROJECT_ID: getValues('boiProject')?.BOI_PROJECT_ID || '',
      BOI_UNIT_ID: getValues('boiUnitId')?.BOI_UNIT_ID,
      BOI_UNIT_SYMBOL: getValues('boiUnitId')?.BOI_UNIT_SYMBOL,
      BOI_GROUP_NO: getValues('boiGroupNo')?.label || '',
      BOI_DESCRIPTION_MAIN_NAME: getValues('boiDescriptionMainName').label || '',
      BOI_DESCRIPTION_SUB_NAME:
        getValues('boiDescriptionSubName') !== undefined ? getValues('boiDescriptionSubName').trim() : '' || '',
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE
    }
    console.log('dataI', dataItem)
    mutation.mutate(dataItem)
    // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Product Category'
      }
      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add ',
        message: data.data.Message
        // ? 'Duplicate Customer Order From'
        // : 'Data is duplicate. Please change Product Category'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const mutation = useCreateBoiNameForMaterialConsumable(onMutateSuccess, onMutateError)

  // Sub Name
  const filterDescriptionSubName = async (
    inputValue: string,
    boiNameForMaterialConsumableId: number,
    boiProjectId: number
  ) => {
    let labelData = []
    await fetchBoiSearchDescriptionSubName(inputValue, boiNameForMaterialConsumableId, boiProjectId).then(
      data => (labelData = data.filter(i => i.label.toLowerCase().includes(inputValue.toLowerCase())))
    )
    return labelData
  }
  const promiseOptionsDescriptionSubName = (
    inputValue: string,
    boiNameForMaterialConsumableId: number,
    boiProjectId: number
  ) =>
    new Promise(resolve => {
      resolve(filterDescriptionSubName(inputValue, boiNameForMaterialConsumableId, boiProjectId))
    })
  // -----------------------------------------------------------------------------------------------------------------------------------------

  // Main Name
  const filterDescriptionMainName = async (inputValue: string, boiGroupNo: string, boiProjectId: number) => {
    let labelData = []
    await fetchBoiDescriptionMainNameByDescriptionManNameBoiGroupNoAndProjectId(
      inputValue,
      boiGroupNo,
      boiProjectId
    ).then(data => (labelData = data.filter(i => i.label.toLowerCase().includes(inputValue.toLowerCase()))))
    return labelData
  }
  const optionsDescriptionMainName = (inputValue: string, boiGroupNo: string, boiProjectId: number) =>
    new Promise(resolve => {
      resolve(filterDescriptionMainName(inputValue, boiGroupNo, boiProjectId))
    })

  // -----------------------------------------------------------------------------------------------------------------------------------------

  // Group No
  const filterBoiGroupNo = async (inputValue: string, boiProjectId: number) => {
    let labelData = []
    await fetchBoiGroupNo(inputValue, boiProjectId).then(
      data => (labelData = data.filter(i => i.label.toLowerCase().includes(inputValue.toLowerCase())))
    )
    return labelData
  }
  const optionsBoiGroupNo = (inputValue: string, boiProjectId: number) =>
    new Promise(resolve => {
      resolve(filterBoiGroupNo(inputValue, boiProjectId))
      console.log('inputValue', filterBoiGroupNo(inputValue, boiProjectId))
    })

  //----------------------------------------------------------------------------------------

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
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add BOI Name For Material/Consumable
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          {/*  -------------------------------------------------------------------------*/}

          <Grid className='mb-3'>
            <Controller
              name='boiProject'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom<BoiNameForMaterialConsumableOption>
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  loadOptions={inputValue => {
                    return fetchBoiProjectByLikeBoiProjectAndInuse(inputValue, 1)
                  }}
                  onChange={value => {
                    onChange(value)
                    setValue('boiGroupNo', '')
                    setValue('boiProjectCode', '')
                    setValue('boiDescriptionMainName', '')
                    setValue('boiDescriptionSubName', '')
                    setValue('boiUnit', '')
                  }}
                  getOptionLabel={data => data?.BOI_PROJECT_NAME || ''}
                  getOptionValue={data => data?.BOI_PROJECT_ID?.toString() || ''}
                  classNamePrefix='select'
                  label='BOI Project Name'
                  placeholder='Enter ...'
                  // autoComplete='off'
                  {...(errors.boiProject && { error: true, helperText: errors.boiProject?.message })}
                />
              )}
            />
          </Grid>

          <Grid className='mb-3'>
            <Controller
              name='boiProjectCode'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  placeholder='Auto'
                  {...field}
                  fullWidth
                  label='BOI Project Code (Auto)'
                  value={watch('boiProject')?.BOI_PROJECT_CODE || ''}
                  autoComplete='off'
                  disabled
                  style={{ cursor: 'not-allowed' }}
                />
              )}
            />
          </Grid>
          {/* {JSON.stringify(watch(`boiGroupNo`))} */}
          <Grid className='mb-3'>
            <Controller
              name='boiGroupNo'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncCreatableSelectCustom
                  {...fieldProps}
                  isClearable
                  cacheOptions
                  defaultOptions
                  onCreateOption={handleCreateOption}
                  backspaceRemovesValue={true}
                  key={watch('boiProject')?.BOI_PROJECT_ID}
                  // value={watch('boiGroupNo')}
                  options={options}
                  loadOptions={(value: string, callback) => {
                    if (getValues('boiProject')) {
                      return optionsBoiGroupNo(value, watch('boiProject')?.BOI_PROJECT_ID)
                    } else {
                      callback(null)
                    }
                  }}
                  onChange={value => {
                    setValue('boiDescriptionMainName', '')

                    console.log('GroupNo', value)
                    if (value) {
                      setValue(
                        'boiDescriptionMainName',
                        {
                          label: value.BOI_DESCRIPTION_MAIN_NAME,
                          value: value.BOI_DESCRIPTION_MAIN_NAME
                        },
                        { shouldValidate: true }
                        // ,{value: 6,label: "111111",BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID: 6,BOI_PROJECT_ID: 1,}
                      )

                      setValue(
                        'boiUnitId',
                        {
                          BOI_UNIT_SYMBOL: value.BOI_UNIT_SYMBOL,
                          BOI_UNIT_ID: value.BOI_UNIT_ID
                        },
                        { shouldValidate: true }
                        // ,{value: 6,label: "111111",BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID: 6,BOI_PROJECT_ID: 1,}
                      )
                    } else {
                      console.log('im here')
                      setValue('boiDescriptionMainName', '')
                      setValue('boiUnitId', '')
                    }
                    onChange(value)
                  }}
                  getOptionLabel={data => data?.label || ''}
                  getOptionValue={data => data?.value?.toString() || ''}
                  classNamePrefix='select'
                  label='BOI Group No'
                  placeholder='Enter ...'
                  // isDisabled={!watch('boiProject')}
                  {...(errors.boiGroupNo && { error: true, helperText: errors.boiGroupNo.label?.message })}
                />
              )}
            />
          </Grid>
          {/* -------------------------------------------------------------------- */}

          {/* {JSON.stringify(watch(`boiDescriptionMainName`))} */}
          <Grid className='mb-3'>
            <Controller
              name='boiDescriptionMainName'
              id='boiDescriptionMainName'
              control={control}
              render={({ field: { ...fieldProps } }) => (
                <AsyncCreatableSelectCustom
                  {...fieldProps}
                  id='boiDescriptionMainName'
                  isClearable
                  cacheOptions
                  defaultOptions
                  key={watch('boiGroupNo')?.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID}
                  loadOptions={(value, callback) => {
                    if (getValues('boiGroupNo')?.__isNew__) {
                      return optionsDescriptionMainName(
                        value,
                        watch('boiGroupNo')?.label,
                        watch('boiProject')?.BOI_PROJECT_ID
                      )
                    } else {
                      callback(null)
                    }
                  }}
                  // isDisabled={getValues('boiGroupNo')?.__isNew__ ? true : false}
                  classNamePrefix='select'
                  label='BOI Description Main Name'
                  placeholder='Select ...'
                  isDisabled={!!!watch('boiGroupNo')?.__isNew__ || errors.boiGroupNo}
                  {...(errors.boiDescriptionMainName && {
                    error: true,
                    helperText: errors.boiDescriptionMainName?.message
                  })}
                />
              )}
            />
          </Grid>
          {/* -------------------------------------------------------------------- */}
          <Grid className='mb-3'>
            <Controller
              id='boiDescriptionSubName'
              disabled={watch('boiGroupNo')?.__isNew__ === true || !!!watch('boiGroupNo')}
              name='boiDescriptionSubName'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <CustomTextField
                  {...fieldProps}
                  id='boiDescriptionSubName'
                  name='boiDescriptionSubName'
                  onChange={value => {
                    onChange(value)
                  }}
                  classNamePrefix='select'
                  label='BOI Description Sub Name'
                  placeholder='Enter...'
                  fullWidth
                />
              )}
            />
          </Grid>
          <Grid>
            <Controller
              name='boiUnitId'
              id='boiUnitId'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <AsyncSelectCustom
                  id='boiUnitId'
                  {...fieldProps}
                  control={control}
                  isClearable
                  cacheOptions
                  defaultOptions
                  key={watch('boiDescriptionMainName')}
                  loadOptions={(data, callback) => {
                    if (getValues('boiDescriptionMainName')?.__isNew__) {
                      return fetchBoiUnit(data, 1)
                      // return fetchBoiUnit(value, 1);
                    } else {
                      callback(null)
                    }
                  }}
                  onChange={value => {
                    onChange(value)
                  }}
                  getOptionLabel={data => data?.BOI_UNIT_SYMBOL || ''}
                  getOptionValue={data => data?.BOI_UNIT_ID?.toString() || ''}
                  classNamePrefix='select'
                  label='BOI Unit Name (Auto)'
                  placeholder='Auto'
                  isDisabled={
                    !!!watch('boiGroupNo')?.__isNew__ || errors.boiGroupNo || !!!watch('boiDescriptionMainName')
                  }
                  {...(errors.boiUnitId && { error: true, helperText: errors.boiUnitId?.message })}
                />
              )}
            />
          </Grid>
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
          onConfirmClick={handleAdd}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default BoiUnitAddModal

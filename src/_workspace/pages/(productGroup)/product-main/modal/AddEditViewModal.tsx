// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Typography from '@mui/material/Typography'

// Core Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { Controller, useForm, useFormState } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import type { MRT_Row } from 'material-react-table'

import { zodResolver } from '@hookform/resolvers/zod'

// React Hook Form Imports

// React Query Imports

// Material React Table Imports

// Component Imports
import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import Transition from '@/components/TransitionDialog'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Libs Imports
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'

// _workspace Imports
import { fetchAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse } from '@/_workspace/react-select/async-promise-load-options/account-department-code/fetchAccountDepartmentCode'
import { fetchBoiProjectByLikeBoiProjectAndInuse } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiProject'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import type { EnvironmentCertificateI } from '@/_workspace/types/environment-certificate/EnvironmentCertificate'
import type { ProductMainI } from '@/_workspace/types/productGroup/product-main/ProductMain'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { PREFIX_QUERY_KEY, useCreate, useUpdate } from '@/_workspace/react-query/hooks/useProductMainData'

// Your imports
import { useDxContext } from '@/_template/DxContextProvider'
import type { AccountDepartmentCodeI } from '@/_workspace/types/account/AccountDepartmentCode'
import type { BoiProjectI } from '@/_workspace/types/boi/BoiProject'
import type { ProductMainBoiI } from '@/_workspace/types/productGroup/product-main/ProductMainBoi'
import type { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOption from '@/libs/react-select/option/StatusOption'
import { Badge, Card, CardContent, Checkbox, Stack, Table, TableBody, TableCell, TableRow } from '@mui/material'
import type { FormData } from './validationSchema'
import { validationSchema } from './validationSchema'
import { fetchGetLocTypeByLikeLocTypeNameAndInuseOnlyProductionType } from '@/_workspace/react-select/async-promise-load-options/fetchLoc'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from '@/_workspace/pages/flow/flow-process/components/SortableItem'

interface ProductMainModalProps {
  openModal: boolean
  setOpenModal: Dispatch<SetStateAction<boolean>>
  mode: 'Add' | 'Edit' | 'View'
  rowSelected?: MRT_Row<
    Required<ProductMainI> &
      Partial<ProductCategoryI> &
      Partial<BoiProjectI> &
      Partial<ProductMainBoiI> &
      Partial<EnvironmentCertificateI> &
      Partial<AccountDepartmentCodeI>
  > | null
}

const ProductMainModal = ({ openModal, setOpenModal, mode, rowSelected }: ProductMainModalProps) => {
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const { setIsEnableFetching } = useDxContext()

  const [noSelected, setNoSelected] = useState<number>()

  const handleClose = () => {
    setOpenModal(false)
  }

  // #region react-hook-form
  const getDefaultValues = (): FormData => {
    switch (mode) {
      case 'Add':
        return {
          //@ts-ignore
          productCategory: null,
          productMainCode: 'PD-M-XXXX',
          productMainName: '',
          productMainAlphabet: '',
          accountDepartmentCode: null,
          loc: [],
          pod: '',
          pd: ''
        }

      case 'Edit':
      case 'View':
        // console.log(rowSelected?.original)

        return {
          productCategory: {
            PRODUCT_CATEGORY_ID: Number(rowSelected?.original.PRODUCT_CATEGORY_ID),
            PRODUCT_CATEGORY_NAME: rowSelected?.original.PRODUCT_CATEGORY_NAME || ''
          },

          productMainCode: rowSelected?.original.PRODUCT_MAIN_CODE || '',
          productMainName: rowSelected?.original.PRODUCT_MAIN_NAME || '',
          productMainAlphabet: rowSelected?.original.PRODUCT_MAIN_ALPHABET || '',

          isBoi: rowSelected?.original.IS_BOI === 1 ? '1' : rowSelected?.original.IS_BOI === 0 ? '0' : null,
          boiProject: rowSelected?.original.IS_BOI
            ? {
                BOI_PROJECT_ID: Number(rowSelected?.original?.BOI_PROJECT_ID),
                BOI_PROJECT_NAME: rowSelected?.original?.BOI_PROJECT_NAME || '',
                BOI_PROJECT_CODE: rowSelected?.original?.BOI_PROJECT_CODE || ''
              }
            : null,

          accountDepartmentCode: rowSelected?.original.ACCOUNT_DEPARTMENT_CODE_ID
            ? {
                ACCOUNT_DEPARTMENT_CODE_ID: Number(rowSelected?.original.ACCOUNT_DEPARTMENT_CODE_ID),
                ACCOUNT_DEPARTMENT_NAME: rowSelected?.original.ACCOUNT_DEPARTMENT_NAME || '',
                ACCOUNT_DEPARTMENT_CODE: rowSelected?.original.ACCOUNT_DEPARTMENT_CODE || ''
              }
            : null,

          loc: rowSelected?.original?.LOC ? rowSelected?.original?.LOC.map((row: any, idx: number) => ({
            NO: idx + 1,
            LOC_ID: row.LOC_ID ?? null,
            LOC_CODE: row.LOC_CODE ?? null,
            LOC_NAME: row.LOC_NAME ?? null
          })) : [],
          // pod: rowSelected?.original.POD || '',
          // pd: rowSelected?.original.PD || '',
          INUSE: StatusOption.find(item => item.value == rowSelected?.original?.inuseForSearch)
        }

      default:
        return {
          //@ts-ignore
          productCategory: null,
          productMainCode: 'PD-M-XXXX',
          productMainName: '',
          productMainAlphabet: ''
        }
    }
  }

  const { control, handleSubmit, getValues, watch, setValue, setError, clearErrors } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaultValues()
  })

  const { errors } = useFormState({
    control
  })

  const isBOI = watch('isBoi')

  const onSubmit: SubmitHandler<FormData> = () => {
    setOpenConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('ERROR', data)
  }

  // #endregion react-hook-form

  // #region react-query
  const queryClient = useQueryClient()

  const handleAddEdit = () => {
    const dataItem: Record<string, any> = {
      // Header
      PRODUCT_CATEGORY_ID: getValues('productCategory').PRODUCT_CATEGORY_ID,

      // Product Main Detail
      PRODUCT_MAIN_NAME: getValues('productMainName').trim(),
      PRODUCT_MAIN_ALPHABET: getValues('productMainAlphabet').trim(),

      // Account
      ACCOUNT_DEPARTMENT_CODE_ID: getValues('accountDepartmentCode')?.ACCOUNT_DEPARTMENT_CODE_ID || '',

      // BOI
      IS_BOI: getValues('isBoi') == '0' ? '0' : getValues('isBoi') == '1' ? '1' : '',
      BOI_PROJECT_ID: getValues('boiProject')?.BOI_PROJECT_ID || '',

      // Other
      LOC: getValues('loc'),
      // POD: getValues('pod').trim(),
      // PD: getValues('pd').trim(),

      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
      INUSE: 1
    }

    if (mode === 'Add') {
      // console.log(dataItem)
      createMutate(dataItem)
    } else if (mode === 'Edit') {
      dataItem.PRODUCT_MAIN_ID = rowSelected?.original.PRODUCT_MAIN_ID
      updateMutate(dataItem)
      // console.log(dataItem)
    }
  }

  const onMutateSuccess = (data: AxiosResponseI) => {
    if (data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Product Main'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

      handleClose()
    } else {
      const message = {
        title: 'Add ',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Product Main' : data.data.Message
      }

      ToastMessageError(message)
      setOpenConfirmModal(false)
    }
  }

  const onMutateError = (e: AxiosResponseWithErrorI) => {
    const message = {
      title: 'Add Product Main',
      message: e.message
    }

    ToastMessageError(message)
    setOpenConfirmModal(false)
  }

  const { mutate: createMutate, isPending: isCreating } = useCreate(onMutateSuccess, onMutateError)
  const { mutate: updateMutate, isPending: isUpdating } = useUpdate(onMutateSuccess, onMutateError)

  // #endregion react-query

  const sensors = useSensors(
    useSensor(PointerSensor, {
      //@ts-ignore
      activationConstraint: { delay: 200, distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Render
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
        open={openModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            {mode} Product Main
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Header
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='productCategory'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Product Category Name'
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                      }}
                      getOptionLabel={data => data?.PRODUCT_CATEGORY_NAME.toString()}
                      getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select ...'
                      {...(errors.productCategory && { error: true, helperText: errors.productCategory.message })}
                      isDisabled={mode === 'View' || mode === 'Edit'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Product Main Detail
                </Typography>
              </Divider>
            </Grid>
            <Grid container item xs={12} spacing={4}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='productMainCode'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      disabled
                      label='Product Main Code (Auto)'
                      autoComplete='off'
                      {...(errors.productMainCode && { error: true, helperText: errors.productMainCode.message })}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='productMainName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Main Name'
                    placeholder='Enter ...'
                    autoComplete='off'
                    {...(errors.productMainName && {
                      error: true,
                      helperText: errors.productMainName.message
                    })}
                    // disabled={mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)}
                    disabled={mode === 'View' || mode === 'Edit'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='productMainAlphabet'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Main Alphabet'
                    placeholder='Enter ...'
                    autoComplete='off'
                    {...(errors.productMainAlphabet && {
                      error: true,
                      helperText: errors.productMainAlphabet.message
                    })}
                    // disabled={mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)}
                    disabled={mode === 'View' || mode === 'Edit'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Account (optional)
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='accountDepartmentCode'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      label='Account Department Code (optional)'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      loadOptions={inputValue => {
                        return fetchAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse(inputValue, 1)
                      }}
                      getOptionLabel={data => data.ACCOUNT_DEPARTMENT_CODE}
                      getOptionValue={data => data.ACCOUNT_DEPARTMENT_CODE_ID.toString()}
                      classNamePrefix='select'
                      placeholder='Select ...'
                      {...(errors.accountDepartmentCode && {
                        error: true,
                        helperText: errors.accountDepartmentCode.message
                      })}
                      // isDisabled={mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)}
                      isDisabled={mode === 'View'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                label='Account Department Name (Auto)'
                value={watch('accountDepartmentCode')?.ACCOUNT_DEPARTMENT_NAME || ''}
                placeholder='Auto'
                fullWidth
                autoComplete='off'
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  BOI (optional)
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12}>
              <FormControl error={Boolean(errors.isBoi)}>
                <Controller
                  name='isBoi'
                  control={control}
                  render={({ field: { value, ...fieldProps } }) => (
                    <Stack direction='row' alignItems='center' spacing={2}>
                      <RadioGroup row {...fieldProps} name='radio-buttons-group'>
                        <FormControlLabel
                          value='1'
                          control={<Radio checked={value === '1'} />}
                          label='BOI'
                          // disabled={mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)}
                          disabled={mode === 'View'}
                        />
                        <FormControlLabel
                          value='0'
                          control={<Radio checked={value === '0'} />}
                          label='Non-BOI'
                          // disabled={mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)}
                          disabled={mode === 'View'}
                        />
                      </RadioGroup>
                      {mode !== 'View' ? (
                        <Button
                          variant='outlined'
                          color='secondary'
                          type='submit'
                          onClick={() => {
                            setValue('isBoi', null)
                            setValue('boiProject', null, { shouldValidate: false })
                          }}
                          //disabled={mode === 'Edit'}
                        >
                          Clear selection
                        </Button>
                      ) : null}
                    </Stack>
                  )}
                />
                {errors.isBoi && <FormHelperText error>{errors.isBoi.message}</FormHelperText>}
              </FormControl>
            </Grid>
            {isBOI === '1' && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='boiProject'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <>
                        <AsyncSelectCustom
                          label='BOI Project'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchBoiProjectByLikeBoiProjectAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data?.BOI_PROJECT_NAME || ''}
                          getOptionValue={data => (data?.BOI_PROJECT_ID ? data.BOI_PROJECT_ID.toString() : '')}
                          classNamePrefix='select'
                          placeholder='Select ...'
                          {...(errors?.boiProject && { error: true, helperText: errors.boiProject.message })}
                          // isDisabled={
                          //   mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)
                          // }
                          isDisabled={mode === 'View'}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    label='BOI Project Code (Auto)'
                    value={watch('boiProject')?.BOI_PROJECT_CODE || ''}
                    placeholder='Auto'
                    fullWidth
                    autoComplete='off'
                    disabled
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} mt={3}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Other (optional)
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Card
                sx={{
                  //   minHeight: '40vh',
                  //   maxHeight: '40vh',
                  //   overflowY: 'scroll',
                  //   overflowX: 'hidden',
                  border: '1px solid var(--mui-palette-customColors-inputBorder)'
                }}
              >
                <CardContent>
                  <Button
                    sx={{
                      marginBottom: '0.5rem'
                    }}
                    variant='tonal'
                    startIcon={<i className='tabler-plus' />}
                    onClick={() => {
                      const current = getValues('loc')
                      const hasEmpty = current.some(r => !r.LOC_ID || !r.LOC_CODE || String(r.LOC_CODE).trim() === '')
                      if (hasEmpty) {
                        current.forEach((r, i) => {
                          const empty = !r.LOC_ID || !r.LOC_CODE || String(r.LOC_CODE).trim() === ''
                          if (empty) {
                            setError(`loc.${i}.LOC_ID` as const, { type: 'manual', message: 'Please select LOC' })
                            setError(`loc.${i}.LOC_CODE` as const, { type: 'manual', message: 'Please select LOC' })
                          }
                        })
                        return
                      }

                      const index = current.length
                      setValue('loc', [...current, { NO: index + 1, LOC_ID: null, LOC_CODE: null, LOC_NAME: null }], {
                        shouldDirty: true,
                        shouldValidate: false
                      })
                    }}
                    disabled={mode === 'View'}
                  >
                    Add New LOC
                  </Button>
                  <Table sx={{ tableLayout: 'fixed' }}>
                    <TableBody>
                      <>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          // onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={watch('loc').map(item => item.NO)}
                            strategy={verticalListSortingStrategy}
                            key={watch('loc')
                              .map(item => item.NO)
                              .join('-')}
                          >
                            {watch('loc').map((lc, index) => {
                              const codeHasError = !!errors?.loc?.[index]?.LOC_CODE
                              const nameShouldReserveSpace = codeHasError || !!errors?.loc?.[index]?.LOC_NAME
                              return (
                                <SortableItem id={index}>
                                  <TableRow
                                    key={index}
                                    sx={{
                                      // width: '100%',
                                      backgroundColor:
                                        noSelected === lc.NO ? 'var(--mui-palette-success-lighterOpacity)' : ''
                                    }}
                                  >
                                    <TableCell
                                      onClick={() => {
                                        if (noSelected === lc.NO) {
                                          setNoSelected(undefined)
                                          return
                                        }
                                        setNoSelected(lc.NO)
                                      }}
                                    ></TableCell>
                                    <TableCell>{lc.NO}</TableCell>
                                    <TableCell>
                                      {noSelected === lc.NO ? (
                                        <>
                                          {/* <Button
                                            size='small'
                                            color='success'
                                            sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                            className='absolute -right-8 -top-3 min-w-0 z-50'
                                            onClick={() => {
                                              const current = getValues('loc')
                                              const index = current.length
                                              setValue(
                                                'loc',
                                                [
                                                  ...current.slice(0, index),
                                                  {
                                                    NO: index + 1,
                                                    LOC_ID: null,
                                                    LOC_CODE: null,
                                                    LOC_NAME: null
                                                  },
                                                  ...current.slice(index)
                                                ].map((item, idx) => ({
                                                  ...item,
                                                  NO: idx + 1 // รีเซ็ตลำดับใหม่
                                                }))
                                              )
                                            }}
                                          >
                                            <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                          </Button>
                                          <Button
                                            size='small'
                                            color='success'
                                            sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                            className='absolute -right-8 -bottom-3 min-w-0 z-50'
                                            onClick={() => {
                                              const current = getValues('loc')
                                              const index = current.length
                                              setValue(
                                                'loc',
                                                [
                                                  ...current.slice(0, index + 1),
                                                  {
                                                    NO: index + 2,
                                                    LOC_ID: null,
                                                    LOC_CODE: null,
                                                    LOC_NAME: null
                                                  },
                                                  ...current.slice(index + 1)
                                                ].map((item, idx) => {
                                                  return { ...item, NO: idx + 1 }
                                                })
                                              )
                                            }}
                                          >
                                            <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                          </Button> */}
                                        </>
                                      ) : null}

                                      <AsyncSelectCustom
                                        isDisabled={mode === 'View'}
                                        label='Location Code'
                                        inputId='loc'
                                        isSearchable
                                        cacheOptions
                                        defaultOptions
                                        key={index}
                                        styles={{ control: base => ({ ...base, width: '150px' }) }}
                                        value={
                                          watch('loc')[index].LOC_ID && watch('loc')[index].LOC_CODE
                                            ? {
                                                LOC_ID: watch('loc')[index].LOC_ID,
                                                LOC_CODE: watch('loc')[index].LOC_CODE,
                                                LOC_NAME: watch('loc')[index].LOC_NAME
                                              }
                                            : null
                                        }
                                        onChange={value => {
                                          const rows = getValues('loc') ?? []
                                          const isDup = rows.some(
                                            (r, i) => i !== index && r.LOC_ID != null && r.LOC_ID === value?.LOC_ID
                                          )
                                          if (isDup) {
                                            setError(`loc.${index}.LOC_ID` as const, {
                                              type: 'manual',
                                              message: 'Duplicate LOC is not allowed'
                                            })
                                            setError(`loc.${index}.LOC_CODE` as const, {
                                              type: 'manual',
                                              message: 'Duplicate LOC is not allowed'
                                            })
                                            return // ❌ ไม่อัปเดต
                                          }
                                          clearErrors([`loc.${index}.LOC_ID`, `loc.${index}.LOC_CODE`])

                                          setValue(
                                            'loc',
                                            rows.map((item, idx) => ({
                                              ...item,
                                              LOC_ID: idx === index ? (value?.LOC_ID ?? null) : item.LOC_ID,
                                              LOC_CODE: idx === index ? (value?.LOC_CODE ?? null) : item.LOC_CODE,
                                              LOC_NAME: idx === index ? (value?.LOC_NAME ?? null) : item.LOC_NAME
                                            })),
                                            { shouldDirty: true, shouldValidate: false } // ★ ไม่ต้อง validate ทุก key stroke
                                          )
                                        }}
                                        loadOptions={inputValue => {
                                          if (mode === 'View') {
                                            return Promise.resolve([])
                                          }
                                          return fetchGetLocTypeByLikeLocTypeNameAndInuseOnlyProductionType(inputValue)
                                        }}
                                        getOptionLabel={data => data?.LOC_CODE || ''}
                                        getOptionValue={data => data?.LOC_ID || ''}
                                        classNamePrefix='select'
                                        {...(() => {
                                          const rowErr = (errors.loc?.[index] ?? {}) as {
                                            LOC_ID?: { message?: string }
                                            LOC_CODE?: { message?: string }
                                          }
                                          const hasErr = !!rowErr.LOC_ID || !!rowErr.LOC_CODE
                                          const help = rowErr.LOC_ID?.message || rowErr.LOC_CODE?.message || ''
                                          return hasErr ? { error: true, helperText: help } : {}
                                        })()}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ width: '50%' }}>
                                      <CustomTextField
                                        disabled
                                        label='Location Name'
                                        value={lc.LOC_NAME || ''}
                                        placeholder='Enter Location Name'
                                        fullWidth
                                        autoComplete='off'
                                        onChange={e => {
                                          setValue(
                                            'loc',
                                            getValues('loc').map((item, idx) => ({
                                              ...item,
                                              LOC_NAME: idx === index ? e.target.value : item.LOC_NAME
                                            })),
                                            { shouldDirty: true, shouldValidate: true }
                                          )
                                        }}
                                        // ให้กรอบแดงตามเงื่อนไขที่ต้องการ
                                        error={codeHasError || !!errors?.loc?.[index]?.LOC_NAME}
                                        // สงวนพื้นที่ helper text แต่ไม่ให้เห็นข้อความ
                                        helperText={nameShouldReserveSpace ? ' ' : undefined}
                                        FormHelperTextProps={{
                                          sx: { visibility: 'hidden', minHeight: '1.8em', lineHeight: '1.5em' } // ซ่อนข้อความ แต่คงความสูง
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Button disabled={mode === 'View'}>
                                        {/* {noSelected === lc.NO ? ( */}
                                        <i
                                          className='tabler-trash'
                                          style={{
                                            color: 'var(--mui-palette-error-main)'
                                          }}
                                          onClick={() => {
                                            setValue(
                                              'loc',
                                              getValues('loc')
                                                .filter((_, idx) => idx !== index) // ลบแถว
                                                .map((item, idx) => ({ ...item, NO: idx + 1 })), // รี NO
                                              { shouldDirty: true, shouldValidate: true }
                                            )

                                            setNoSelected(undefined)
                                          }}
                                        />
                                        {/* ) : null} */}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                </SortableItem>
                              )
                            })}
                          </SortableContext>
                        </DndContext>
                      </>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/* <Grid item xs={12} sm={4}>
              <Controller
                name='pod'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    label='POD (optional)'
                    placeholder={mode === 'View' ? '' : 'Enter ...'}
                    {...field}
                    fullWidth
                    autoComplete='off'
                    {...(errors.pod && {
                      error: true,
                      helperText: errors.pod.message
                    })}
                    disabled={mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='pd'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    label='PD (optional)'
                    placeholder={mode === 'View' ? '' : 'Enter ...'}
                    {...field}
                    fullWidth
                    autoComplete='off'
                    {...(errors.pd && {
                      error: true,
                      helperText: errors.pd.message
                    })}
                    disabled={mode === 'View' || (mode === 'Edit' && rowSelected?.original?.inuseForSearch !== 1)}
                  />
                )}
              />
            </Grid> */}
            {mode === 'View' && (
              <>
                <Grid item xs={12} mt={3}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Status
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='INUSE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        isClearable
                        label='Status'
                        classNamePrefix='select'
                        isDisabled={true}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          {mode !== 'View' && (
            <Button
              color='success'
              onClick={() => handleSubmit(onSubmit, onError)()}
              variant='contained'
              disabled={isCreating || isUpdating}
            >
              Save & Complete
            </Button>
          )}
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmModal
        show={openConfirmModal}
        onConfirmClick={handleAddEdit}
        onCloseClick={() => setOpenConfirmModal(false)}
        isDelete={false}
        isLoading={isCreating || isUpdating}
      />
    </>
  )
}

export default ProductMainModal

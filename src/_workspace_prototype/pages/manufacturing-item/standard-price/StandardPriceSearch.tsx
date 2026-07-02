import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Typography
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { Dispatch, SetStateAction, useState } from 'react'
import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

// Components Imports
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

// types Imports
import type { FormData } from './page'

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useStandardPrice'
import { fetchItemCodeByLikeItemCodeAndInuseAndNotFGSemiFGSubAs } from '@/_workspace/react-select/async-promise-load-options/fetchItem'
import { fetchItemImportTypeByItemImportTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemImportType'
import { fetchSctPatternByLikePatternNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctPattern'
import { fetchVendorByLikeVendorNameAndImportType } from '@/_workspace/react-select/async-promise-load-options/fetchVendor'
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import StatusOption from '@/libs/react-select/option/StatusOption'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { FiscalYearType } from '../../cost-condition/exchange-rate/ExchangeRateSearch'
import { MENU_ID } from './env'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

// Year -10 to +1 from now
const FiscalYearOption: FiscalYearType[] = Array.from({ length: 12 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: year, label: year }
})

const StandardPriceSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit } = useFormContext<FormData>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      ITEM_CODE_FOR_SUPPORT_MES: null,
      FISCAL_YEAR: '',
      SCT_PATTERN: null,
      vendor: null,
      ITEM_IMPORT_TYPE: null,
      itemInternalFullName: '',
      itemInternalShortName: '',
      // manufacturingOption: null,
      includingCancelled: false,
      status: null
    })
    setValue('searchFilters.manufacturingOption', {
      value: 'All',
      label: 'All',
      icon: 'tabler-checks'
    })
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
    handleAdd()
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // react-query
  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: {
          ITEM_CODE_FOR_SUPPORT_MES: getValues('searchFilters.ITEM_CODE_FOR_SUPPORT_MES'),
          FISCAL_YEAR: getValues('searchFilters.FISCAL_YEAR'),
          SCT_PATTERN: getValues('searchFilters.SCT_PATTERN'),
          VENDOR: getValues('searchFilters.vendor'),
          ITEM_IMPORT_TYPE: getValues('searchFilters.ITEM_IMPORT_TYPE'),
          ITEM_INTERNAL_FULL_NAME: getValues('searchFilters.itemInternalFullName'),
          ITEM_INTERNAL_SHORT_NAME: getValues('searchFilters.itemInternalShortName'),
          includingCancelled: getValues('searchFilters.includingCancelled'),
          manufacturingOption: getValues('searchFilters.manufacturingOption'),
          status: getValues('searchFilters.status')
        },
        searchResults: {
          pageSize: getValues('searchResults.pageSize'),
          columnFilters: getValues('searchResults.columnFilters'),
          sorting: getValues('searchResults.sorting'),
          density: getValues('searchResults.density'),
          columnVisibility: getValues('searchResults.columnVisibility'),
          columnPinning: getValues('searchResults.columnPinning'),
          columnOrder: getValues('searchResults.columnOrder'),
          columnFilterFns: getValues('searchResults.columnFilterFns')
        }
      }
    }

    mutate(dataItem)
  }

  const onMutateSuccess = () => {
    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const { mutate } = useCreate(onMutateSuccess, onMutateError)

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isLoading ? (
            <>Loading</>
          ) : (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Header
                    </Typography>
                  </Divider>
                </Grid>

                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.FISCAL_YEAR'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        fullWidth
                        autoComplete='off'
                        label='Fiscal Year'
                        placeholder='Enter ...'
                      />
                    )}
                  />

                  {/* <Controller
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
                      />
                    )}
                  /> */}
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name='searchFilters.SCT_PATTERN'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <>
                        <AsyncSelectCustom
                          {...fieldProps}
                          label='SCT Pattern'
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchSctPatternByLikePatternNameAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data?.SCT_PATTERN_NAME.toString()}
                          getOptionValue={data => data.SCT_PATTERN_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select ...'
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Vendor
                    </Typography>
                  </Divider>
                </Grid>
                <Grid container item xs={12} spacing={3}>
                  <Grid item xs={12} sm={3} lg={3}>
                    <Controller
                      name='searchFilters.vendor'
                      control={control}
                      defaultValue={null}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchVendorByLikeVendorNameAndImportType(inputValue)
                          }}
                          onChange={value => {
                            onChange(value)
                            if (!value) {
                              setValue('searchFilters.ITEM_IMPORT_TYPE', null, {
                                shouldDirty: true,
                                shouldValidate: true
                              })
                            } else {
                              setValue(
                                'searchFilters.ITEM_IMPORT_TYPE',
                                {
                                  ITEM_IMPORT_TYPE_ID: value?.ITEM_IMPORT_TYPE_ID,
                                  ITEM_IMPORT_TYPE_NAME: value?.ITEM_IMPORT_TYPE_NAME
                                },
                                {
                                  shouldDirty: true,
                                  shouldValidate: true
                                }
                              )
                            }
                          }}
                          getOptionLabel={data => data?.VENDOR_NAME || ''}
                          getOptionValue={data => data?.VENDOR_ID?.toString() || ''}
                          classNamePrefix='select'
                          label='Vendor Name'
                          placeholder='Select ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} lg={3}>
                    <Controller
                      name='searchFilters.ITEM_IMPORT_TYPE'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          label='Item Import Type'
                          inputId='ITEM_IMPORT_TYPE'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          // value={watch('ITEM_IMPORT_TYPE')}
                          onChange={value => {
                            onChange(value)
                          }}
                          loadOptions={inputValue => {
                            return fetchItemImportTypeByItemImportTypeNameAndInuse(inputValue)
                          }}
                          getOptionLabel={data => data.ITEM_IMPORT_TYPE_NAME.toString()}
                          getOptionValue={data => data.ITEM_IMPORT_TYPE_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider textAlign='left'>
                      <Typography variant='body2' color='primary'>
                        Item
                      </Typography>
                    </Divider>
                  </Grid>
                  <Grid item xs={12} sm={3} lg={3}>
                    <Controller
                      name='searchFilters.ITEM_CODE_FOR_SUPPORT_MES'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom
                          label='Item Code'
                          inputId='ITEM_CODE_FOR_SUPPORT_MES'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          loadOptions={inputValue => {
                            return fetchItemCodeByLikeItemCodeAndInuseAndNotFGSemiFGSubAs(inputValue)
                          }}
                          onChange={value => {
                            onChange(value)
                            if (!value) {
                              setValue('searchFilters.itemInternalFullName', '', {
                                shouldDirty: true,
                                shouldValidate: true
                              })
                              setValue('searchFilters.itemInternalShortName', '', {
                                shouldDirty: true,
                                shouldValidate: true
                              })
                            } else {
                              setValue('searchFilters.itemInternalFullName', value?.ITEM_INTERNAL_FULL_NAME || '', {
                                shouldDirty: true,
                                shouldValidate: true
                              })
                              setValue('searchFilters.itemInternalShortName', value?.ITEM_INTERNAL_SHORT_NAME || '', {
                                shouldDirty: true,
                                shouldValidate: true
                              })
                            }
                          }}
                          getOptionLabel={data => data.ITEM_CODE_FOR_SUPPORT_MES.toString()}
                          getOptionValue={data => data.ITEM_MANUFACTURING_ID.toString()}
                          classNamePrefix='select'
                          placeholder='Select ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} lg={3}>
                    <Controller
                      name='searchFilters.itemInternalFullName'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <CustomTextField
                          {...fieldProps}
                          onChange={value => {
                            onChange(value)
                            setValue('searchFilters.ITEM_CODE_FOR_SUPPORT_MES', null, {
                              shouldDirty: true,
                              shouldValidate: true
                            })
                          }}
                          fullWidth
                          label='Item Internal Full Name'
                          autoComplete='off'
                          placeholder='Enter ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} lg={3}>
                    <Controller
                      name='searchFilters.itemInternalShortName'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <CustomTextField
                          {...fieldProps}
                          onChange={value => {
                            onChange(value)
                            setValue('searchFilters.ITEM_CODE_FOR_SUPPORT_MES', null, {
                              shouldDirty: true,
                              shouldValidate: true
                            })
                          }}
                          fullWidth
                          label='Item Internal Short Name'
                          autoComplete='off'
                          placeholder='Enter ...'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.manufacturingOption'
                    control={control}
                    defaultValue={{
                      value: 'All',
                      label: 'All',
                      icon: 'tabler-checks'
                    }}
                    render={({ field: { ref, onChange, ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={[
                          {
                            value: 'All',
                            label: 'All',
                            icon: 'tabler-checks'
                          },
                          {
                            value: 'Latest',
                            label: 'Latest',
                            icon: 'tabler-check'
                          }
                        ]}
                        onChange={value => {
                          onChange(value)
                          // if (value?.value === 'Latest') {
                          //   setValue('searchFilters.sctRevisionCode', '', { shouldDirty: true, shouldValidate: true })
                          // }
                        }}
                        isClearable
                        label='Standard Price Version'
                        placeholder='Select ...'
                        classNamePrefix='select'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3} lg={3}>
                  <Controller
                    name='searchFilters.status'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={StatusOption}
                        isClearable
                        label='Status'
                        placeholder='Select ...'
                        classNamePrefix='select'
                      />
                    )}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={3}
                  lg={3}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end'
                  }}
                >
                  <Controller
                    name='searchFilters.includingCancelled'
                    control={control}
                    render={({ field: { value, ...fieldProps } }) => (
                      <FormControlLabel
                        control={<Checkbox {...fieldProps} color='warning' checked={value} />}
                        label='Including Cancelled'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} className='flex gap-3'>
                  <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                    Search
                  </Button>
                  <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default StandardPriceSearch

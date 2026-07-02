// React Imports
import { Dispatch, SetStateAction, useState } from 'react'
// MUI Imports
import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton, Select, Skeleton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
// Third-party Imports
import classNames from 'classnames'
// react-hook-from Imports
import { Controller, useForm, useFormContext, useFormState } from 'react-hook-form'
import { FormProvider, SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
// react-select Imports
import CustomTextField from '@components/mui/TextField'
// react-query Imports
import type { FormData } from '../page'
import SkeletonCustom from '@/components/SkeletonCustom'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from '../env'
import StatusOption from '@/libs/react-select/option/StatusOption'
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchBoiProjectByLikeBoiProjectAndInuse } from '@/_workspace/react-select/async-promise-load-options/boi/fetchBoiProject'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'
import { fetchProductTypeStatusWorkingByLikeProductTypeStatusWorkingNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  CustomerOrderFromOption,
  fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
import { fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/specification-setting/fetchSpecificationType'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setIsCopying: Dispatch<SetStateAction<boolean>>
}
function SpecificationSettingCompleteTableForSearch({ setIsCopying, setIsEnableFetching }: Props) {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, trigger } = useFormContext<FormData>()

  const methods = useForm<FormData>({
    mode: 'onChange',
    resolver: undefined
  })

  //   {
  //   mode: 'onChange',
  //   resolver: undefined
  // }
  //   // resolver: valibotResolver(schema),
  // defaultValues: {
  //       productSpecificationType: null,
  //       specificationSetting: '',
  //       customerOrderFrom: null,
  //       productMain: null,
  //       pcName: '',
  //       partNumber: '',
  //       specificationSettingNumber: '',
  //       specificationSettingVersionRevision: '',
  //       modelNumber: ''
  //     }
  //   {

  //   // defaultValues
  //   defaultValues: {
  //     productSpecificationType: null,
  //     specificationSetting: '',
  //     customerOrderFrom: null,
  //     productMain: null,
  //     pcName: '',
  //     partNumber: '',
  //     specificationSettingNumber: '',
  //     specificationSettingVersionRevision: '',
  //     modelNumber: ''
  //   }
  // }
  // const { control, handleSubmit, setValue, reset, getValues } = useForm<FormData>({
  //   resolver: valibotResolver(schema),
  //   // defaultValues
  //   defaultValues: {
  //     // customerOrderFromName: null,
  //     accountDepartmentName: '',
  //     accountDepartmentCode: ''
  //   }
  // })

  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters', {
      productSpecificationType1: null,
      specificationSetting1: '',
      customerOrderFrom1: null,
      productMain1: null,
      partNumber1: '',
      specificationSettingNumber1: '',
      specificationSettingVersionRevision1: '',
      modelNumber1: '',
      // selectedProductLevelForGen: null,
      status1: null
    })
  }

  // Function - react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsCopying(false)
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: ['SPECIFICATION_SETTING_FOR_COPY_SPECIFICATION_SETTING'] })
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
          specificationSetting: getValues('searchFilters.specificationSetting1') || '',
          customerOrderFrom: getValues('searchFilters.customerOrderFrom1'),
          productMain: getValues('searchFilters.productMain1'),
          partNumber: getValues('searchFilters.partNumber1') || '',
          specificationSettingNumber: getValues('searchFilters.specificationSettingNumber1') || '',
          specificationSettingVersionRevision: getValues('searchFilters.specificationSettingVersionRevision1') || '',
          modelNumber: getValues('searchFilters.modelNumber1') || '',
          productSpecificationType: getValues('searchFilters.productSpecificationType1'),
          status: 1
        },
        searchResults: {
          pageSize: getValues('searchResults.pageSize'),
          columnFilters: getValues('searchResults.columnFilters1'),
          sorting: getValues('searchResults.sorting'),
          density: getValues('searchResults.density'),
          columnVisibility: getValues('searchResults.columnVisibility'),
          columnPinning: getValues('searchResults.columnPinning'),
          columnOrder: getValues('searchResults.columnOrder'),
          columnFilterFns: getValues('searchResults.columnFilterFns')
        }
      }
    }
    console.log('ForSearch', dataItem)
    // console.log('specificationSetting', getValues('searchFilters.specificationSetting'))
    // console.log('specificationSettingNumber', getValues('searchFilters.specificationSettingNumber'))
    mutate(dataItem)
  }

  const onMutateSuccess = () => {
    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    console.log('onMutateError', e)
  }

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters Completed Product Specification Document Setting'
        action={
          // <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)} disabled>
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
          </IconButton>
        }
        avatar={<i className='tabler-search text-xl' />}
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />
      <Collapse in={!collapse}>
        <CardContent>
          {isError ? <div>An error occurred: {error.message}</div> : null}
          {isLoading ? (
            <>
              <SkeletonCustom />
            </>
          ) : (
            <>
              <Grid container sx={{ position: 'relative', top: 0 }} spacing={6}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.specificationSetting1'
                    control={control}
                    // rules={{ required: false }}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        fullWidth
                        onChange={value => {
                          onChange(value)
                          console.log('onChangeSpecification', onChange(value))

                          // setValue('searchFilters.process', null)
                        }}
                        label='Product Specification Document Setting Name'
                        placeholder='Enter Product Specification Document Setting Name'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.specificationSettingNumber1'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Specification Document Setting Number'
                        placeholder='Enter Product Specification Document Setting Number'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.specificationSettingVersionRevision1'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Specification Setting Document Version Revision'
                        placeholder='Enter Product Specification Document Setting Version Revision'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.partNumber1'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Part Number'
                        placeholder='Enter Product Part Number'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.modelNumber1'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        // onChange={e => {
                        //   if (e.target.value === '') {
                        //     onChange('')
                        //   } else {
                        //     onChange(Number(e.target.value))
                        //   }
                        // }}
                        {...fieldProps}
                        fullWidth
                        label='Product Model Number'
                        placeholder='Enter Product Model Number'
                        autoComplete='off'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productMain1'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<ProductMainOption>
                        label='Product Main'
                        inputId='PRODUCT_MAIN'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.productMain1')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Main ...'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.customerOrderFrom1'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom<CustomerOrderFromOption>
                        label='Customer (in specification)'
                        inputId='CUSTOMER_ORDER_FROM'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.customerOrderFrom1')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data.CUSTOMER_ORDER_FROM_NAME.toString()}
                        getOptionValue={data => data.CUSTOMER_ORDER_FROM_ID?.toString()}
                        classNamePrefix='select'
                        placeholder='Select Customer In Specification ...'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.productSpecificationType1'
                    control={control}
                    render={({ field: { onChange, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Product Specification Type'
                        inputId='PRODUCT_SPECIFICATION_TYPE'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        value={getValues('searchFilters.productSpecificationType1')}
                        onChange={value => {
                          onChange(value)
                        }}
                        loadOptions={inputValue => {
                          return fetchProductSpecificationTypeByLikeProductSpecificationTypeNameAndInuse(inputValue, 1)
                        }}
                        getOptionLabel={data => data?.PRODUCT_SPECIFICATION_TYPE_NAME.toString()}
                        getOptionValue={data => data?.PRODUCT_SPECIFICATION_TYPE_ID?.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Specification Type ...'
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.status1'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={StatusOption}
                        isClearable
                        label='Status'
                        classNamePrefix='select'
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} className='flex gap-4 '>
                  <FormProvider {...methods}>
                    <Button
                      onClick={() => methods.handleSubmit(onSubmit, onError)()}
                      variant='contained'
                      type='button'

                      // disabled
                    >
                      Search
                    </Button>
                  </FormProvider>
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

export default SpecificationSettingCompleteTableForSearch

import { Dispatch, SetStateAction, useState } from 'react'
import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'
import { FormData } from './BomSelectModal'
import { useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Typography
} from '@mui/material'
import { Icon } from '@iconify/react'
import classNames from 'classnames'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  fetchProductCategoryByLikeProductCategoryNameAndInuse,
  ProductCategoryOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductionPurposeByProductionPurposeNameAndInuse,
  ProductionPurposeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductionPurpose'
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOption from '@/libs/react-select/option/StatusOption'
import FlowProcessSelectModal from '../../../flow/flow-process/modal/FlowProcessSelectModal/FlowProcessSelectModal'
import SearchIcon from '@mui/icons-material/Search'

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useBomData'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const BomSelectModalSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  const [isShowFlowProcessModal, setIsShowFlowProcessModal] = useState(false)

  // Hooks : react-hook-form
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { isLoading } = useFormState<FormData>()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      PRODUCT_CATEGORY: null,
      PRODUCT_MAIN: null,
      PRODUCTION_PURPOSE: null,
      FLOW_PROCESS_CODE: null,
      BOM_CODE: '',
      BOM_NAME: '',
      INUSE: null
    })
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  return (
    <>
      <Card
        style={{ overflow: 'visible', zIndex: 4 }}
        sx={{
          border: '1px solid var(--mui-palette-customColors-inputBorder)'
        }}
      >
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
                <Divider>
                  <Typography color='primary'>Product</Typography>
                </Divider>
                <Grid
                  container
                  spacing={6}
                  sx={{
                    paddingTop: '8px',
                    paddingBottom: '12px'
                  }}
                >
                  <Grid item xs={12} sm={4} lg={4}>
                    <Controller
                      name='searchFilters.PRODUCT_CATEGORY'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom<ProductCategoryOption>
                          label='Product Category'
                          inputId='PRODUCT_CATEGORY'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          value={getValues('searchFilters.PRODUCT_CATEGORY')}
                          onChange={value => {
                            onChange(value)

                            setValue('searchFilters.PRODUCT_MAIN', null)
                          }}
                          loadOptions={inputValue => {
                            return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
                          }}
                          getOptionLabel={data => data.PRODUCT_CATEGORY_NAME?.toString()}
                          getOptionValue={data => data.PRODUCT_CATEGORY_ID?.toString()}
                          classNamePrefix={'select'}
                          placeholder='Select Product Category ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                    <Controller
                      name='searchFilters.PRODUCT_MAIN'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom<ProductMainOption>
                          label='Product Main'
                          inputId='PRODUCT_MAIN'
                          {...fieldProps}
                          key={watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID}
                          isClearable
                          cacheOptions
                          defaultOptions
                          value={getValues('searchFilters.PRODUCT_MAIN')}
                          onChange={value => {
                            onChange(value)
                          }}
                          loadOptions={inputValue => {
                            if (watch('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID) {
                              return fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                                inputValue,
                                1,
                                getValues('searchFilters.PRODUCT_CATEGORY')?.PRODUCT_CATEGORY_ID ?? ''
                              )
                            }

                            return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data.PRODUCT_MAIN_NAME?.toString()}
                          getOptionValue={data => data.PRODUCT_MAIN_ID?.toString()}
                          classNamePrefix='select'
                          placeholder='Select Product Main ...'
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Divider>
                  <Typography color='primary'>Bom Detail</Typography>
                </Divider>
                <Grid
                  container
                  spacing={6}
                  sx={{
                    paddingTop: '8px',
                    paddingBottom: '12px'
                  }}
                >
                  <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                    <Controller
                      name='searchFilters.PRODUCTION_PURPOSE'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <AsyncSelectCustom<ProductionPurposeOption>
                          label='Production Purpose'
                          inputId='PRODUCTION_PURPOSE'
                          {...fieldProps}
                          isClearable
                          cacheOptions
                          defaultOptions
                          value={getValues('searchFilters.PRODUCTION_PURPOSE')}
                          onChange={value => {
                            onChange(value)
                          }}
                          loadOptions={inputValue => {
                            return fetchProductionPurposeByProductionPurposeNameAndInuse(inputValue, 1)
                          }}
                          getOptionLabel={data => data.PRODUCTION_PURPOSE_NAME?.toString()}
                          getOptionValue={data => data.PRODUCTION_PURPOSE_ID?.toString()}
                          classNamePrefix={'select'}
                          placeholder='Select Production Purpose ...'
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={4} sx={{ marginBottom: '1rem' }}>
                    <Controller
                      name='searchFilters.FLOW_PROCESS_CODE'
                      control={control}
                      render={({ field: { onChange, ...fieldProps } }) => (
                        <CustomTextField
                          {...fieldProps}
                          // sx={{
                          //   '& .MuiInputLabel-root': {
                          //     lineHeight: '1.4 !important'
                          //   }
                          // }}
                          onClick={() => {
                            setIsShowFlowProcessModal(true)
                          }}
                          fullWidth
                          label='Flow Process Code'
                          value={watch('searchFilters.FLOW_PROCESS_CODE')?.FLOW_CODE ?? ''}
                          placeholder='Select Flow Process Code'
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                {!watch('searchFilters.FLOW_PROCESS_CODE')?.FLOW_CODE ? null : (
                                  <IconButton
                                    edge='end'
                                    onClick={e => {
                                      e.stopPropagation()
                                      setValue('searchFilters.FLOW_PROCESS_CODE', null)
                                    }}
                                  >
                                    <Icon icon={'tabler:x'} />
                                  </IconButton>
                                )}
                                <IconButton edge='end' className='ms-3'>
                                  <Icon icon={'tabler:chevron-down'} />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={4} lg={4}>
                    <Controller
                      name='searchFilters.BOM_CODE'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Bom Code'
                          placeholder='Enter Bom Code'
                          autoComplete='off'
                          style={{ marginTop: '3px' }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} lg={4}>
                    <Controller
                      name='searchFilters.BOM_NAME'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Bom Name'
                          placeholder='Enter Bom Name'
                          autoComplete='off'
                          style={{ marginTop: '3px' }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} lg={3}>
                    <Controller
                      name='searchFilters.INUSE'
                      control={control}
                      render={({ field: { ...fieldProps } }) => (
                        <SelectCustom
                          label='Status'
                          {...fieldProps}
                          isClearable
                          options={StatusOption}
                          classNamePrefix='select'
                          placeholder='Select Status ...'
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Grid container className='mbs-0' spacing={6}>
                  <Grid item xs={12} className='flex gap-4'>
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
      <FlowProcessSelectModal
        get={'flow'}
        setFlowSelected={flow => {
          setValue('searchFilters.FLOW_PROCESS_CODE', flow)
          setIsShowFlowProcessModal(false)
        }}
        setIsShowFlowProcessModal={setIsShowFlowProcessModal}
        isShowFlowProcessModal={isShowFlowProcessModal}
        getValues={getValues}
      />
    </>
  )
}

export default BomSelectModalSearch

import { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler, useFormContext, useFormState } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

import classNames from 'classnames'

// Components Imports
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

// types Imports

// React Query Imports
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useClearTimeTotalForSctData'

import { FiscalYearType } from '@/_workspace/pages/cost-condition/exchange-rate/ExchangeRateSearch'
import { FormDataPage } from './validationSchema'
import { fetchProductTypeByLikeProductTypeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

// Year -10 to +1 from now
const FiscalYearOption: FiscalYearType[] = Array.from({ length: 12 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: year, label: year.toString() }
})

const ClearTimeSearch = ({ setIsEnableFetching }: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-hook-form
  const { setValue, control, handleSubmit } = useFormContext<FormDataPage>()
  const { isLoading } = useFormState()

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      PRODUCT_TYPE: null,
      FISCAL_YEAR: null
    })
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormDataPage> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    console.log(data)
  }

  return (
    <Card style={{ overflow: 'visible', zIndex: 4, border: '1px solid var(--mui-palette-customColors-inputBorder)' }}>
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
              <Grid container spacing={6}>
                <Grid item xs={12} sm={2} lg={2}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Product Type Code'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductTypeByLikeProductTypeNameAndInuse({
                            INUSE: 1,
                            PRODUCT_TYPE_CODE: inputValue,
                            PRODUCT_CATEGORY_ID: '',
                            PRODUCT_MAIN_ID: '',
                            PRODUCT_SUB_ID: '',
                            PRODUCT_TYPE_NAME: ''
                          })
                        }}
                        getOptionLabel={data => data.PRODUCT_TYPE_CODE.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Main ...'
                        isDisabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Controller
                    name='searchFilters.PRODUCT_TYPE'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <AsyncSelectCustom
                        label='Product Type Name'
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          return fetchProductTypeByLikeProductTypeNameAndInuse({
                            INUSE: 1,
                            PRODUCT_TYPE_CODE: '',
                            PRODUCT_CATEGORY_ID: '',
                            PRODUCT_MAIN_ID: '',
                            PRODUCT_SUB_ID: '',
                            PRODUCT_TYPE_NAME: inputValue
                          })
                        }}
                        getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                        getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                        classNamePrefix='select'
                        placeholder='Select Product Main ...'
                        isDisabled
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={4}>
                  <Controller
                    name='searchFilters.FISCAL_YEAR'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={FiscalYearOption}
                        isClearable
                        label='Fiscal Year'
                        classNamePrefix='select'
                        placeholder='Select Fiscal Year'
                        isDisabled
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container className='mbs-0' spacing={6}>
                <Grid item xs={12} className='flex gap-3'>
                  <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                    Search
                  </Button>
                  <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch} disabled>
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

export default ClearTimeSearch

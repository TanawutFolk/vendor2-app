import React, { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

import classNames from 'classnames'

// React Query Imports
import { PREFIX_QUERY_KEY as DIRECT_PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useDirectCostCondition'
import { PREFIX_QUERY_KEY as INDIRECT_PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useIndirectCostCondition'
import { PREFIX_QUERY_KEY as SPECIAL_PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useSpecialCostCondition'
import { PREFIX_QUERY_KEY as OTHER_PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useOtherCostCondition'

import SearchIcon from '@mui/icons-material/Search'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import SelectCustom from '@/components/react-select/SelectCustom'
import { FiscalYearType } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateSearch'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setValue: any
  control: any
  watch: any
  handleSubmit: any
  costConditionType: 'direct' | 'indirect' | 'special' | 'other'
}

// Year -10 to +1 from now
const FiscalYearOption: FiscalYearType[] = Array.from({ length: 12 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: year, label: year }
})

const MasterDataModalSearch = ({
  setIsEnableFetching,
  setValue,
  costConditionType,
  control,
  watch,
  handleSubmit
}: Props) => {
  // States
  const [collapse, setCollapse] = useState(false)

  // Hooks : react-query
  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('searchFilters', {
      FISCAL_YEAR: null,
      PRODUCT_MAIN: null
    })
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    queryClient.invalidateQueries({
      queryKey: [
        costConditionType === 'direct'
          ? DIRECT_PREFIX_QUERY_KEY
          : costConditionType === 'indirect'
            ? INDIRECT_PREFIX_QUERY_KEY
            : costConditionType === 'special'
              ? SPECIAL_PREFIX_QUERY_KEY
              : OTHER_PREFIX_QUERY_KEY
      ]
    })
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

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
          <>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={4} lg={4}>
                <Controller
                  name='searchFilters.PRODUCT_MAIN'
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom<ProductMainOption>
                      label='Product Main'
                      inputId='PRODUCT_MAIN'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      value={watch('searchFilters.PRODUCT_MAIN')}
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
                      value={watch('searchFilters.FISCAL_YEAR')}
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
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default MasterDataModalSearch

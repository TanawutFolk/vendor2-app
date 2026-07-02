import React, { Dispatch, SetStateAction, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { Controller, SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { Button, Card, CardContent, CardHeader, Collapse, Grid, IconButton } from '@mui/material'

import classNames from 'classnames'

import SearchIcon from '@mui/icons-material/Search'

import SelectCustom from '@/components/react-select/SelectCustom'

import { FiscalYearType } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateSearch'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  setValue: any
  control: any
  watch: any
  handleSubmit: any
  masterDataType: 'MATERIAL_PRICE' | 'YR_GR_FROM_ENGINEER' | 'TIME_FROM_MFG' | 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
}

// Year -10 to +1 from now
const FiscalYearOption: FiscalYearType[] = Array.from({ length: 12 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i
  return { value: year, label: year }
})

const MasterDataOtherModalSearch = ({
  setIsEnableFetching,
  setValue,
  masterDataType,
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
      FISCAL_YEAR: null
    })
  }

  // Function : react-hook-form
  const onSubmit: SubmitHandler<FormData> = () => {
    setIsEnableFetching(true)
    // queryClient.invalidateQueries({
    //   queryKey: []
    // })
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
                      placeholder='Select Fiscal Year'
                      value={watch('searchFilters.FISCAL_YEAR')}
                    />
                  )}
                /> */}
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

export default MasterDataOtherModalSearch

// ** React Imports
import { SyntheticEvent, useState } from 'react'

// ** MUI Imports
import Tab from '@mui/material/Tab'
import Grid from '@mui/material/Grid'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'

import MaterialInProcess from './DirectCost/MaterialInProcess'
import IndirectCost from './IndirectCost/IndirectCostCondition'
import Price from './Price/Price'
import FlowProcess from './DirectCost/FlowProcess'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import { FormDataPage } from './validationSchema'
import { useDirectCostCondition } from './MasterDataSelection/hooks/useDirectCostCondition'
import { useIndirectCostCondition } from './MasterDataSelection/hooks/useIndirectCostCondition'
import { useSpecialCostCondition } from './MasterDataSelection/hooks/useSpecialCostCondition'
import { useOtherCostCondition } from './MasterDataSelection/hooks/useOtherCostCondition'
import { useYieldRateGoStraightRate } from './MasterDataSelection/hooks/useYieldRateGoStraightRate'
import { useClearTime } from './MasterDataSelection/hooks/useClearTime'
import { useManufacturingItemPrice } from './MasterDataSelection/hooks/useManufacturingItemPrice'

// Styled TabList component
const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  borderBottom: '0 !important',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))

const CostPriceTab = () => {
  // ** State
  const [value, setValue] = useState<string>('1')

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const { control } = useFormContext<FormDataPage>()

  const { isLoading } = useFormState({
    control
  })

  // #region Direct Cost Condition
  const { isFetching: isFetching_DirectCost } = useDirectCostCondition(isLoading)
  // #endregion Direct Cost Condition

  //#region Indirect Cost Condition
  const { isFetching: isFetching_IndirectCost } = useIndirectCostCondition(isLoading)
  // #endregion Indirect Cost Condition

  // #region Special Cost Condition
  const { isFetching: isFetching_SpecialCost } = useSpecialCostCondition(isLoading)
  // #endregion Special Cost Condition

  // #region Other Cost Condition
  const { isFetching: isFetching_OtherCost } = useOtherCostCondition(isLoading)
  // #endregion Other Cost Condition

  // #region Yield Rate Go Straight Rate
  const { isFetching: isFetching_YieldRate } = useYieldRateGoStraightRate(isLoading)
  // #endregion Yield Rate Go Straight Rate

  // #region Clear Time
  const { isFetching: isFetching_ClearTime } = useClearTime(isLoading)
  // #endregion Clear Time

  // #region Clear Time
  const { isFetching: isFetching_ManufacturingItemPrice } = useManufacturingItemPrice(isLoading)
  // #endregion Clear Time

  const yieldRateAndGoStraightRate = useWatch({
    control,
    name: 'directCost.flowProcess.total.main.yieldRateAndGoStraightRate' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: "default", // default value before the render
  })
  const clearTime = useWatch({
    control,
    name: 'directCost.flowProcess.total.main.clearTime' // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: "default", // default value before the render
  })

  return (
    <>
      <Grid item xs={12} sm={12} lg={12}>
        <TabContext value={value}>
          <TabList onChange={handleChange}>
            <Tab value='1' label='Direct Cost' />
            <Tab value='2' label='Indirect Cost' />
            <Tab value='3' label='Price' />
          </TabList>
          <TabPanel value='1'>
            <Grid container spacing={6} className='mb-7'>
              {isFetching_YieldRate || isFetching_ClearTime ? 'Loading' : <FlowProcess />}
            </Grid>
            <Grid container spacing={6}>
              {isFetching_YieldRate || isFetching_ClearTime || isFetching_ManufacturingItemPrice ? (
                'Loading'
              ) : (
                <MaterialInProcess />
              )}
            </Grid>
          </TabPanel>
          <TabPanel value='2'>
            <Grid container spacing={6} className='mb-7'>
              <IndirectCost />
            </Grid>
          </TabPanel>
          <TabPanel value='3'>
            <Typography>
              <Price />
            </Typography>
          </TabPanel>
        </TabContext>
      </Grid>
    </>
  )
}

export default CostPriceTab

import { FormControl, FormControlLabel, Radio, TableCell, Typography } from '@mui/material'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { FormDataPage } from '../validationSchema'
import DirectCostCondition from './Direct Cost Condition'
import { useState } from 'react'
import IndirectCostCondition from './Indirect Cost Condition'
import OtherCostCondition from './Other Cost Condition'
import SpecialCostCondition from './Special Cost Condition'
import YieldRateGoStraightRate from './Yield Rate Go Straight Rate'
import ClearTime from './Clear Time'

interface Props {
  name:
    | 'masterDataSelection.directCostCondition'
    | 'masterDataSelection.indirectCostCondition'
    | 'masterDataSelection.specialCostCondition'
    | 'masterDataSelection.otherCostCondition'
    | 'masterDataSelection.yieldRateAndGoStraightRate'
    | 'masterDataSelection.manufacturingItemPrice'
    | 'masterDataSelection.clearTime'
    | 'masterDataSelection.yieldRateMaterial'
  SCT_COMPONENT_TYPE_ID: number
}

const Body = ({ name, SCT_COMPONENT_TYPE_ID }: Props) => {
  const formContext = useFormContext<FormDataPage>()
  const { control, getValues, setValue } = formContext

  const { errors } = useFormState({
    control
  })

  const [isOpenModal_RevisionMasterData, setIsOpenModal_RevisionMasterData] = useState<boolean>(false)

  return (
    <>
      {/* 1.Manual Input */}
      <TableCell align='center'>
        <Radio value={1} disabled />
      </TableCell>

      {/* 2.Master Data (Latest) */}
      <TableCell align='center'>
        <FormControl error={!!errors?.masterDataSelection || !!errors?.[name as keyof FormDataPage]}>
          <Controller
            name={`${name}`}
            control={control}
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <>
                <FormControlLabel
                  {...fieldProps}
                  value={1}
                  checked={value?.SCT_RESOURCE_OPTION_ID == 1}
                  onChange={() => {
                    setValue(
                      name,
                      { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 1 },
                      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    )
                  }}
                  disabled={getValues('mode') == 'view' || getValues('isCalculationAlready')}
                  control={<Radio />}
                  label=''
                />
              </>
            )}
          />
        </FormControl>
      </TableCell>

      {/* 3.SCT Selection */}
      <TableCell align='center'>
        <FormControl
          error={!!errors?.masterDataSelection || !!errors?.[name as keyof FormDataPage]}
          disabled={[1, 2].includes(getValues('header.sctCreateFrom.SCT_CREATE_FROM_SETTING_ID')) || false}
        >
          <Controller
            name={`${name}`}
            control={control}
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <>
                <FormControlLabel
                  {...fieldProps}
                  value={4}
                  checked={value?.SCT_RESOURCE_OPTION_ID == 4}
                  onChange={() => {
                    setValue(
                      name,
                      { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 4 },
                      { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                    )
                  }}
                  control={<Radio />}
                  disabled={
                    getValues('mode') == 'view' ||
                    getValues('isCalculationAlready') ||
                    [1, 2].includes(getValues('header.sctCreateFrom.SCT_CREATE_FROM_SETTING_ID'))
                  }
                  label=''
                />
              </>
            )}
          />
        </FormControl>
      </TableCell>

      {/* 4.Revision Master Data */}
      <TableCell align='center'>
        <>
          <FormControl error={!!errors?.masterDataSelection || !!errors?.[name as keyof FormDataPage]}>
            <Controller
              name={`${name}`}
              control={control}
              render={({ field: { value, name, onChange, ...fieldProps } }) => (
                <>
                  <FormControlLabel
                    {...fieldProps}
                    value={4}
                    checked={value?.SCT_RESOURCE_OPTION_ID == 2}
                    onClick={() => {
                      setIsOpenModal_RevisionMasterData(true)
                    }}
                    disabled
                    // disabled={
                    //   ['masterDataSelection.manufacturingItemPrice', 'masterDataSelection.yieldRateMaterial'].includes(
                    //     name
                    //   ) ||
                    //   getValues('mode') == 'view' ||
                    //   getValues('isCalculationAlready')
                    // }
                    control={<Radio />}
                    label=''
                  />
                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.directCostCondition' ? (
                    <DirectCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        setValue(
                          name,
                          { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 2 },
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.indirectCostCondition' ? (
                    <IndirectCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        setValue(
                          name,
                          { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 2 },
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.otherCostCondition' ? (
                    <OtherCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        setValue(
                          name,
                          { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 2 },
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.specialCostCondition' ? (
                    <SpecialCostCondition
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_MAIN={getValues('product.productMain')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        setValue(
                          name,
                          { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 2 },
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.yieldRateAndGoStraightRate' ? (
                    <YieldRateGoStraightRate
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_TYPE={getValues('product.productType')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        setValue(
                          name,
                          { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 2 },
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                      }
                    />
                  ) : null}

                  {isOpenModal_RevisionMasterData && name == 'masterDataSelection.clearTime' ? (
                    <ClearTime
                      isOpenModal={isOpenModal_RevisionMasterData}
                      setIsOpenModal={setIsOpenModal_RevisionMasterData}
                      PRODUCT_TYPE={getValues('product.productType')}
                      FISCAL_YEAR={getValues('header.fiscalYear')}
                      RHF_parent={formContext}
                      onChange={() =>
                        setValue(
                          name,
                          { SCT_COMPONENT_TYPE_ID, SCT_RESOURCE_OPTION_ID: 2 },
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                      }
                    />
                  ) : null}
                </>
              )}
            />
          </FormControl>
        </>
      </TableCell>

      {/* Revision No.*/}
      <TableCell align='center'>
        {name === 'masterDataSelection.directCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.directCostCondition.fiscalYear') ?? ''} Ver.
            {getValues('indirectCost.main.costCondition.directCostCondition.version') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.indirectCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.indirectCostCondition.fiscalYear') ?? ''} Ver.
            {getValues('indirectCost.main.costCondition.indirectCostCondition.version') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.specialCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.specialCostCondition.fiscalYear') ?? ''} Ver.
            {getValues('indirectCost.main.costCondition.specialCostCondition.version') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.otherCostCondition' ? (
          <Typography>
            {getValues('indirectCost.main.costCondition.otherCostCondition.fiscalYear') ?? ''} Ver.
            {getValues('indirectCost.main.costCondition.otherCostCondition.version') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.yieldRateAndGoStraightRate' ? (
          <Typography>
            {getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.fiscalYear') ?? ''} Ver.
            {getValues('directCost.flowProcess.total.main.yieldRateAndGoStraightRate.version') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.clearTime' ? (
          <Typography>
            {getValues('directCost.flowProcess.total.main.clearTime.fiscalYear') ?? ''} Ver.
            {getValues('directCost.flowProcess.total.main.clearTime.version') ?? ''}
          </Typography>
        ) : null}
        {name === 'masterDataSelection.manufacturingItemPrice' && <Typography>-</Typography>}
        {name === 'masterDataSelection.yieldRateMaterial' && <Typography>-</Typography>}
      </TableCell>
    </>
  )
}

export default Body

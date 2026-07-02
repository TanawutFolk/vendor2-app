import React, { useEffect, useState } from 'react'

import type { TooltipProps } from '@mui/material'
import { FormControlLabel, Grid, Radio, RadioGroup, styled, Tooltip, tooltipClasses } from '@mui/material'

import { Controller, useFormContext } from 'react-hook-form'

import MasterDataSelectionModal from './CostConditionModal/SelectionModal'
import MasterDataOtherModal from './OtherModal/OtherModal'
import SctDataModal from './sctDataModal/SctDataModal'
import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'

interface Props {
  name:
    | 'MATERIAL_PRICE'
    | 'YR_GR_FROM_ENGINEER'
    | 'TIME_FROM_MFG'
    | 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
    | 'COST_CONDITION'
}

const SctDataInput = ({ name }: Props) => {
  const [isOpenMasterDataSelectionModal, setIsOpenMasterDataSelectionModal] = useState(false)
  const [isOpenSctModal, setIsOpenSctDataModal] = useState(false)

  const { control, watch, setValue, getValues } = useFormContext()

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2) return

    setValue(name, event.target.value)
    setValue(`${name}_RESOURCE_OPTION_ID`, event.target.value)

    if (event.target.value === '2') {
      setIsOpenMasterDataSelectionModal(true)
    }

    if (event.target.value === '4') {
      setIsOpenSctDataModal(true)
    }

    if (event.target.value === '1' || event.target.value === '3') {
      if (name === 'COST_CONDITION') {
        StandardCostForProductServices.getCostConditionData({
          RESOURCE_OPTION_ID: event.target.value,
          FISCAL_YEAR: getValues('FISCAL_YEAR.value'),
          PRODUCT_TYPE_ID: getValues('PRODUCT_TYPE.PRODUCT_TYPE_ID'),
          PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN.PRODUCT_MAIN_ID'),
          ITEM_CATEGORY_NAME: getValues('ITEM_CATEGORY.ITEM_CATEGORY_NAME')
        }).then(res => {
          setValue('DIRECT_COST_CONDITION', res.data.ResultOnDb[0]?.[0] ?? null)
          setValue('INDIRECT_COST_CONDITION', res.data.ResultOnDb[1]?.[0] ?? null)
          setValue('OTHER_COST_CONDITION', res.data.ResultOnDb[2]?.[0] ?? null)
          setValue('SPECIAL_COST_CONDITION', res.data.ResultOnDb[3]?.[0] ?? null)
        })
      } else if (name === 'YR_GR_FROM_ENGINEER') {
        StandardCostForProductServices.getYrGrData({
          RESOURCE_OPTION_ID: event.target.value,
          FISCAL_YEAR: getValues('FISCAL_YEAR.value'),
          PRODUCT_TYPE_ID: getValues('PRODUCT_TYPE.PRODUCT_TYPE_ID'),
          SCT_REASON_SETTING_ID: getValues('SCT_REASON_SETTING.SCT_REASON_SETTING_ID'),
          SCT_TAG_SETTING_ID: getValues('SCT_TAG_SETTING.SCT_TAG_SETTING_ID'),
          BOM_ID: getValues('BOM_ID')
        }).then(res => {
          setValue('YR_GR', res.data.ResultOnDb[0])
          setValue('YR_GR_TOTAL', res.data.ResultOnDb[1]?.[0] ?? null)
        })
      } else if (name === 'TIME_FROM_MFG') {
        StandardCostForProductServices.getTimeData({
          RESOURCE_OPTION_ID: event.target.value,
          FISCAL_YEAR: getValues('FISCAL_YEAR.value'),
          PRODUCT_TYPE_ID: getValues('PRODUCT_TYPE.PRODUCT_TYPE_ID'),
          SCT_REASON_SETTING_ID: getValues('SCT_REASON_SETTING.SCT_REASON_SETTING_ID'),
          SCT_TAG_SETTING_ID: getValues('SCT_TAG_SETTING.SCT_TAG_SETTING_ID'),
          BOM_ID: getValues('BOM_ID')
        }).then(res => {
          setValue('CLEAR_TIME', res.data.ResultOnDb[0])
          setValue('CLEAR_TIME_TOTAL', res.data.ResultOnDb[1]?.[0] ?? null)
        })
      } else if (name === 'MATERIAL_PRICE') {
        const sctPatternId = getValues('SCT_PATTERN_NO.value')

        StandardCostForProductServices.getMaterialPriceData({
          RESOURCE_OPTION_ID: event.target.value,
          FISCAL_YEAR:
            sctPatternId === 1 ? Number(getValues('FISCAL_YEAR.value')) - 1 : Number(getValues('FISCAL_YEAR.value')),
          SCT_ID: getValues('SCT_ID'),
          PRODUCT_TYPE_ID: getValues('PRODUCT_TYPE.PRODUCT_TYPE_ID')
        }).then(res => {
          setValue('MATERIAL_PRICE_DATA', res.data.ResultOnDb)
        })
      } else if (name === 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER') {
        StandardCostForProductServices.getYrAccumulationMaterialData({
          RESOURCE_OPTION_ID: event.target.value,
          FISCAL_YEAR: getValues('FISCAL_YEAR.value'),
          PRODUCT_TYPE_ID: getValues('PRODUCT_TYPE.PRODUCT_TYPE_ID'),
          SCT_REASON_SETTING_ID: getValues('SCT_REASON_SETTING.SCT_REASON_SETTING_ID'),
          SCT_TAG_SETTING_ID: getValues('SCT_TAG_SETTING.SCT_TAG_SETTING_ID') ?? null,
          BOM_ID: getValues('BOM_ID')
        }).then(res => {
          setValue('YIELD_MATERIAL_DATA', res.data.ResultOnDb)
        })
      }
    }
  }

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
            <RadioGroup
              {...field}
              aria-labelledby='demo-controlled-radio-buttons-group'
              name='controlled-radio-buttons-group'
              value={watch(name)}
              onChange={handleChange}
            >
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6} lg={6}>
                  <div className='flex justify-start items-center'>
                    <FormControlLabel
                      checked={watch(`${name}_RESOURCE_OPTION_ID`) === 1 || watch(`${name}_RESOURCE_OPTION_ID`) === '1'}
                      className='mr-1'
                      value={1}
                      control={<Radio />}
                      label='Master Data Latest (Auto Realtime)'
                      disabled={getValues('mode') === 'view' || getValues('SCT_STATUS_PROGRESS_ID') !== 2}
                    />
                    <NoMaxWidthTooltip
                      title={
                        <>
                          {"คำเตือน: หลังจาก SCT เป็นสถานะ 'Prepared' ข้อมูลจะเป็นค่าคงที่"}
                          <br />
                          {"Warning: After SCT status is 'Prepared', the data will be fixed value"}
                        </>
                      }
                      placement='top'
                    >
                      <i className='tabler-info-circle text-md ms-1' />
                    </NoMaxWidthTooltip>
                  </div>
                  <FormControlLabel
                    checked={watch(`${name}_RESOURCE_OPTION_ID`) === 2 || watch(`${name}_RESOURCE_OPTION_ID`) === '2'}
                    value={2}
                    control={<Radio />}
                    label='Master Data Select version (Fixed value)'
                    onClick={() => {
                      // if (getValues('mode') === 'view') return
                      // setIsOpenMasterDataSelectionModal(true)
                    }}
                    //disabled={getValues('mode') === 'view'}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <div className='flex justify-start items-center'>
                    <FormControlLabel
                      checked={watch(`${name}_RESOURCE_OPTION_ID`) === 3 || watch(`${name}_RESOURCE_OPTION_ID`) === '3'}
                      className='mr-1'
                      value={3}
                      control={<Radio />}
                      label='SCT Latest (Fixed value after save)'
                      // disabled={getValues('mode') === 'view'}
                      disabled
                    />
                    <NoMaxWidthTooltip title={<>{"SCT Status is 'Can use'"}</>} placement='top'>
                      <i className='tabler-info-circle text-md ms-1' />
                    </NoMaxWidthTooltip>
                  </div>
                  <div className='flex justify-start items-center'>
                    <FormControlLabel
                      className='mr-1'
                      checked={watch(`${name}_RESOURCE_OPTION_ID`) === 4 || watch(`${name}_RESOURCE_OPTION_ID`) === '4'}
                      value={4}
                      control={<Radio />}
                      label='SCT Select version (Fixed value)'
                      onClick={() => {
                        // if (getValues('mode') === 'view') return
                        // setIsOpenSctDataModal(true)
                      }}
                      //disabled={getValues('mode') === 'view'}
                      disabled
                    />
                    <NoMaxWidthTooltip title={<>{"SCT Status is 'Can use'"}</>} placement='top'>
                      <i className='tabler-info-circle text-md ms-1' />
                    </NoMaxWidthTooltip>
                  </div>
                </Grid>
              </Grid>
            </RadioGroup>
          </>
        )}
      />
      {name === 'COST_CONDITION' ? (
        <MasterDataSelectionModal
          originalName={name}
          name={`${name}_ID`}
          isOpenMasterDataSelectionModal={isOpenMasterDataSelectionModal}
          setIsOpenMasterDataSelectionModal={setIsOpenMasterDataSelectionModal}
        />
      ) : (
        <MasterDataOtherModal
          originalName={name}
          isOpenMasterDataSelectionModal={isOpenMasterDataSelectionModal}
          setIsOpenMasterDataSelectionModal={setIsOpenMasterDataSelectionModal}
        />
      )}
      <SctDataModal originalName={name} isOpenSctModal={isOpenSctModal} setIsOpenSctDataModal={setIsOpenSctDataModal} />
    </>
  )
}

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    backgroundColor: 'var(--background-color)',
    color: 'var(--secondary-color)'
  }
})

export default SctDataInput

// React Imports
import type { Ref, ReactElement, Dispatch, SetStateAction } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'

import type { SlideProps } from '@mui/material'
import { Checkbox, Container, Divider, FormControlLabel, FormGroup, Grid, List, ListItem, Slide } from '@mui/material'
import { useForm } from 'react-hook-form'
import { json } from 'stream/consumers'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Types
const SelectColumnForm = ({ watch, setValue, control, errors }: any) => {
  // useState

  useEffect(() => {
    const isCheck =
      watch('selectColumn.productGroup.productCategory') &&
      watch('selectColumn.productGroup.productMain') &&
      watch('selectColumn.productGroup.productSub')

    if (!isCheck) {
      setValue('selectColumn.productGroup.productCategory', false)
      setValue('selectColumn.productGroup.productMain', false)
      setValue('selectColumn.productGroup.productSub', false)
    }
  }, [watch])

  useEffect(() => {
    const isCheck =
      watch('selectColumn.costCondition.directUnitProcessCost') &&
      watch('selectColumn.costCondition.indirectRateOfDirectProcessCost') &&
      watch('selectColumn.costCondition.importFeeRate') &&
      watch('selectColumn.costCondition.sellingExpenseRate') &&
      watch('selectColumn.costCondition.gaRate') &&
      watch('selectColumn.costCondition.marginRate')

    if (!isCheck) {
      setValue('selectColumn.costCondition.directUnitProcessCost', false)
      setValue('selectColumn.costCondition.indirectRateOfDirectProcessCost', false)
      setValue('selectColumn.costCondition.importFeeRate', false)
      setValue('selectColumn.costCondition.sellingExpenseRate', false)
      setValue('selectColumn.costCondition.gaRate', false)
      setValue('selectColumn.costCondition.marginRate', false)
    }
  }, [watch])

  return (
    <Grid container spacing={2} alignItems='flex-start'>
      {/* Section 1: Header */}
      <Grid item xs={12}>
        <Divider textAlign='left'>
          <Typography variant='h6' color='primary'>
            Select Columns
          </Typography>
        </Divider>
      </Grid>

      {/* Section 2: Checkboxes */}
      <Grid item xs={12} md={6}>
        <FormGroup sx={{ ml: 5 }}>
          {/* Example Checkbox Group */}
          <FormControlLabel
            control={<Checkbox checked={watch('selectColumn.sctCode')} disabled />}
            label='SCT Code (Product Type Code)'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.sctRevisionCode')}
                // onChange={e => setValue('selectColumn.sctRevisionCode', e.target.checked)}

                disabled
              />
            }
            label='SCT Revision Code'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.sctStatus')}
                // onChange={e => setValue('selectColumn.sctStatus', e.target.checked)}

                disabled
              />
            }
            label='SCT Status'
          />
          {/* Item Category */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.itemCategory')}
                // onChange={e => setValue('selectColumn.itemCategory', e.target.checked)}

                disabled
              />
            }
            label='Item Category'
          />
        </FormGroup>

        <Divider textAlign='left' sx={{ mt: 2 }}>
          <Typography variant='subtitle1' color='primary'>
            Product Group
          </Typography>
        </Divider>
        <FormGroup sx={{ ml: 5 }}>
          {/* Select All / Unselect All */}
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  watch('selectColumn.productGroup.productCategory') &&
                  watch('selectColumn.productGroup.productMain') &&
                  watch('selectColumn.productGroup.productSub')
                }
                onChange={e => {
                  const isChecked = e.target.checked
                  setValue('selectColumn.productGroup.productCategory', isChecked)
                  setValue('selectColumn.productGroup.productMain', isChecked)
                  setValue('selectColumn.productGroup.productSub', isChecked)
                }}
              />
            }
            label='Select All / Unselect All'
          />
          {/* Product Group Checkboxes */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.productGroup.productCategory') || false}
                onChange={e => setValue('selectColumn.productGroup.productCategory', e.target.checked)}
              />
            }
            label='Product Category'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.productGroup.productMain') || false}
                onChange={e => setValue('selectColumn.productGroup.productMain', e.target.checked)}
              />
            }
            label='Product Main'
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.productGroup.productSub') || false}
                onChange={e => setValue('selectColumn.productGroup.productSub', e.target.checked)}
              />
            }
            label='Product Sub'
          />

          {/* Product Type */}
          <FormControlLabel
            control={<Checkbox checked={watch('selectColumn.productGroup.productType')} disabled />}
            label='Product Type'
          />
        </FormGroup>
        <Divider textAlign='left' sx={{ mt: 2 }}>
          <Typography variant='subtitle1' color='primary'>
            Cost Condition
          </Typography>
        </Divider>
        <FormGroup sx={{ ml: 5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  watch('selectColumn.costCondition.directUnitProcessCost') &&
                  watch('selectColumn.costCondition.indirectRateOfDirectProcessCost') &&
                  watch('selectColumn.costCondition.importFeeRate') &&
                  watch('selectColumn.costCondition.sellingExpenseRate') &&
                  watch('selectColumn.costCondition.gaRate') &&
                  watch('selectColumn.costCondition.marginRate')
                }
                onChange={e => {
                  const isCheck = e.target.checked
                  setValue('selectColumn.costCondition.directUnitProcessCost', isCheck)
                  setValue('selectColumn.costCondition.indirectRateOfDirectProcessCost', isCheck)
                  setValue('selectColumn.costCondition.importFeeRate', isCheck)
                  setValue('selectColumn.costCondition.sellingExpenseRate', isCheck)
                  setValue('selectColumn.costCondition.gaRate', isCheck)
                  setValue('selectColumn.costCondition.marginRate', isCheck)
                }}
              />
            }
            label={<span style={{ fontStyle: 'italic', color: '#adb5bd' }}>Select All / Unselect All</span>}
          />
          {/* Direct Unit Process Cost */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.costCondition.directUnitProcessCost') || false}
                onChange={e => setValue('selectColumn.costCondition.directUnitProcessCost', e.target.checked)}
              />
            }
            label='Direct Unit Process Cost (/h)'
          />
          {/* Indirect Rate */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.costCondition.indirectRateOfDirectProcessCost') || false}
                onChange={e => setValue('selectColumn.costCondition.indirectRateOfDirectProcessCost', e.target.checked)}
              />
            }
            label='Indirect Rate of Direct Process Cost'
          />
          {/* Import Fee */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.costCondition.importFeeRate') || false}
                onChange={e => setValue('selectColumn.costCondition.importFeeRate', e.target.checked)}
              />
            }
            label='Import Fee Rate (%)'
          />
          {/* Selling Expense */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.costCondition.sellingExpenseRate') || false}
                onChange={e => setValue('selectColumn.costCondition.sellingExpenseRate', e.target.checked)}
              />
            }
            label='Selling Expense Rate (%)'
          />
          {/* GA Rate */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.costCondition.gaRate') || false}
                onChange={e => setValue('selectColumn.costCondition.gaRate', e.target.checked)}
              />
            }
            label='GA Rate (%)'
          />
          {/* Margin Rate */}
          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.costCondition.marginRate') || false}
                onChange={e => setValue('selectColumn.costCondition.marginRate', e.target.checked)}
              />
            }
            label='Margin Rate (%)'
          />
        </FormGroup>
      </Grid>

      {/* Section 3: Cost Conditions */}
      <Grid item xs={12} md={6}>
        <Divider textAlign='left'>
          <Typography variant='h6' color='primary'>
            Direct Cost
          </Typography>
        </Divider>
        <FormGroup sx={{ ml: 5 }}>
          {/* Select All */}

          <FormControlLabel
            control={
              <Checkbox
                checked={
                  watch('selectColumn.directCost.rm_importedFee') &&
                  watch('selectColumn.directCost.consume_packing') &&
                  watch('selectColumn.directCost.processCost')
                }
                onChange={e => {
                  const isCheck = e.target.checked
                  setValue('selectColumn.directCost.rm_importedFee', isCheck)
                  setValue('selectColumn.directCost.consume_packing', isCheck)
                  setValue('selectColumn.directCost.processCost', isCheck)
                }}
              />
            }
            label={<span style={{ fontStyle: 'italic', color: '#adb5bd' }}>Select All / Unselect All</span>}
            // label='Select All / Unselect All'
            // sx={{ color: '#adb5bd', fontStyle: 'italic' }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.directCost.rm_importedFee') || false}
                onChange={e => setValue('selectColumn.directCost.rm_importedFee', e.target.checked)}
              />
            }
            label='RM Imported Fee'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.directCost.consume_packing') || false}
                onChange={e => setValue('selectColumn.directCost.consume_packing', e.target.checked)}
              />
            }
            label='Consume Packing'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.directCost.processCost') || false}
                onChange={e => setValue('selectColumn.directCost.processCost', e.target.checked)}
              />
            }
            label='Process Cost'
          />

          <Grid item xs={12}>
            {' '}
            <br />
          </Grid>

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.indirectCost_Bath')}
                onChange={e => setValue('selectColumn.indirectCost_Bath', e.target.checked)}
              />
            }
            label='Indirect Cost (Baht)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.sellingExpense_Bath')}
                onChange={e => setValue('selectColumn.sellingExpense_Bath', e.target.checked)}
              />
            }
            label='Selling Expense (Baht)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.ga_Bath')}
                onChange={e => setValue('selectColumn.ga_Bath', e.target.checked)}
              />
            }
            label='GA (Baht)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.margin_Bath')}
                onChange={e => setValue('selectColumn.margin_Bath', e.target.checked)}
              />
            }
            label='Margin (Baht)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.sellingPriceByFormula_Bath')}
                onChange={e => setValue('selectColumn.sellingPriceByFormula_Bath', e.target.checked)}
              />
            }
            label='Selling Price By Formula (Baht)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.adjustPrice_Bath')}
                onChange={e => setValue('selectColumn.adjustPrice_Bath', e.target.checked)}
              />
            }
            label='Adjust Price (Baht)'
          />

          <FormControlLabel
            control={<Checkbox checked={watch('selectColumn.sellingPrice_Bath')} disabled />}
            label='Selling Price (Baht)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.citPercent')}
                onChange={e => setValue('selectColumn.citPercent', e.target.checked)}
              />
            }
            label='CIT (%)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.citBath')}
                onChange={e => setValue('selectColumn.citBath', e.target.checked)}
              />
            }
            label='CIT (Bath)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.vatPercent')}
                onChange={e => setValue('selectColumn.vatPercent', e.target.checked)}
              />
            }
            label='VAT (%)'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={watch('selectColumn.vatBath')}
                onChange={e => setValue('selectColumn.vatBath', e.target.checked)}
              />
            }
            label='VAT (Baht)'
          />
        </FormGroup>
      </Grid>
    </Grid>
  )
}

export default SelectColumnForm

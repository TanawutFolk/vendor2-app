import { FormControl, FormControlLabel, Radio, TableCell } from '@mui/material'
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import { FormDataPage } from '../../dataValidation'
import { useEffect } from 'react'

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

const SctDataInputTable = ({ name, SCT_COMPONENT_TYPE_ID }: Props) => {
  const { control, getValues, setValue, watch } = useFormContext<FormDataPage>()

  const { errors } = useFormState({
    control
  })

  useEffect(() => {
    const arr = Object.entries(getValues('productType.body') ?? {}).map(([key, value]) => ({
      key,
      ...value
    }))

    if (arr.every(item => item.sctCreateFrom == 'BOM - BOM Actual')) {
      setValue(
        name,
        {
          SCT_COMPONENT_TYPE_ID,
          SCT_RESOURCE_OPTION_ID: 1
        },
        {
          shouldValidate: true,
          shouldDirty: true
        }
      )
    } else {
      setValue(name, null, {
        shouldValidate: true,
        shouldDirty: true
      })
    }

    if (arr.some(item => !item.sctCreateFrom)) {
      setValue(name, null, {
        shouldValidate: true,
        shouldDirty: true
      })
    }
    // const fetchData = async () => {
    //   await fetchBomByLikeProductTypeIdAndCondition({
    //     CONDITION: 'BOM_ACTUAL',
    //     PRODUCT_TYPE_ID: row.original.PRODUCT_TYPE_ID
    //   })
    //     .then(responseJson => {
    //       resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
    //         sctCreateFrom: 'BOM - BOM Actual',
    //         bomId: responseJson?.BOM_ID,
    //         bomCode: responseJson?.BOM_CODE,
    //         bomName: responseJson?.BOM_NAME
    //       })
    //     })
    //     .catch(error => {
    //       toast.error(error.message)
    //       resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
    //         sctCreateFrom: 'BOM - BOM Actual'
    //       })
    //     })
    // }

    // if (watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`) == 'BOM - BOM Actual') {
    //   fetchData()
    // }
  }, [
    JSON.stringify(
      Object.entries(watch('productType.body') ?? {})?.map(([key, value]) => ({
        key,
        ...value
      }))
    )
  ])

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
                  value={1}
                  checked={value?.SCT_RESOURCE_OPTION_ID == 1}
                  onChange={() => {
                    onChange({
                      SCT_COMPONENT_TYPE_ID,
                      SCT_RESOURCE_OPTION_ID: 1
                    })
                  }}
                  {...fieldProps}
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
          disabled={Object.entries(getValues('productType.body') ?? {})
            .map(([key, value]) => ({
              key,
              ...value
            }))
            .every(item => item.sctCreateFrom == 'BOM - BOM Actual')}
        >
          <Controller
            name={`${name}`}
            control={control}
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <>
                <FormControlLabel
                  value={4}
                  checked={value?.SCT_RESOURCE_OPTION_ID == 4}
                  onChange={() => {
                    onChange({
                      SCT_COMPONENT_TYPE_ID,
                      SCT_RESOURCE_OPTION_ID: 4
                    })
                  }}
                  {...fieldProps}
                  control={<Radio />}
                  label=''
                />
              </>
            )}
          />
        </FormControl>
      </TableCell>

      {/* 4.Revision Master Data */}
      <TableCell align='center'>
        <Radio value={2} disabled />
      </TableCell>
    </>
  )
}

export default SctDataInputTable

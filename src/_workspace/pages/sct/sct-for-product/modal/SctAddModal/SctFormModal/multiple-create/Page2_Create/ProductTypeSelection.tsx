import { Button, FormControlLabel, Grid, Switch, Typography } from '@mui/material'
import { MaterialReactTable, MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { FormDataPage } from '../dataValidation'
import { fetchBomByLikeProductTypeIdAndCondition } from '@/_workspace/react-select/async-promise-load-options/fetchBom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import { fetchSctPatternByLikePatternNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSctPattern'
import { twMerge } from 'tailwind-merge'
import { fetchSctByLikeProductTypeCodeAndCondition } from '@/_workspace/react-select/async-promise-load-options/fetchStandardCostData'
import SctSelectionModal from './SctSelectionModal'
import CustomTextField from '@/components/mui/TextField'
import { toast } from 'react-toastify'

interface Props {
  dataProductTypeSelected: ProductTypeI[]
  //setRowSelection: Dispatch<SetStateAction<RowSelectionState>>
}

function ProductTypeSelection({ dataProductTypeSelected }: Props) {
  const formContext = useFormContext<FormDataPage>()
  const { control, setValue, watch, getValues } = formContext

  const { errors } = useFormState({
    control
  })

  // const [sctSwitchHeader, setSctSwitchHeader] = useState({
  //   MES: false,
  //   BUDGET: false,
  //   PRICE: false,
  //   SCT_LATEST_REVISION: false,
  //   SCT_SELECT: false
  // })

  // const handleEditSctSwitch = async (
  //   columnName: string,
  //   isCheck: boolean,
  //   formName: string,
  //   productTypeIdClicked: number
  // ) => {
  //   setValue('CREATE_FROM', 'SCT')

  //   for (let dataProductType of dataProductTypeSelected) {
  //     if (dataProductType.PRODUCT_TYPE_ID === productTypeIdClicked) {
  //       setValue(`SCT_SWITCH.MES.ID-${dataProductType.PRODUCT_TYPE_ID}`, false)
  //       setValue(`SCT_SWITCH.BUDGET.ID-${dataProductType.PRODUCT_TYPE_ID}`, false)
  //       setValue(`SCT_SWITCH.PRICE.ID-${dataProductType.PRODUCT_TYPE_ID}`, false)
  //       setValue(`SCT_SWITCH.SCT_LATEST_REVISION.ID-${dataProductType.PRODUCT_TYPE_ID}`, false)
  //       setValue(`SCT_SWITCH.SCT_SELECT.ID-${dataProductType.PRODUCT_TYPE_ID}`, false)
  //       setValue(`SCT_SWITCH.MES.DATA-${dataProductType.PRODUCT_TYPE_ID}`, null)
  //       setValue(`SCT_SWITCH.BUDGET.DATA-${dataProductType.PRODUCT_TYPE_ID}`, null)
  //       setValue(`SCT_SWITCH.PRICE.DATA-${dataProductType.PRODUCT_TYPE_ID}`, null)
  //       setValue(`SCT_SWITCH.SCT_LATEST_REVISION.DATA-${dataProductType.PRODUCT_TYPE_ID}`, null)
  //       setValue(`SCT_SWITCH.SCT_SELECT.DATA-${dataProductType.PRODUCT_TYPE_ID}`, null)
  //     }
  //   }

  //   setValue(formName, isCheck)

  //   let dataItem: any = {
  //     PRODUCT_TYPE_ID: productTypeIdClicked,
  //     CONDITION: columnName,
  //     FISCAL_YEAR: getValues(`SCT_SWITCH.SCT_FISCAL_YEAR.ID-${productTypeIdClicked}.SCT_FISCAL_YEAR_ID`),
  //     SCT_PATTERN_ID: getValues(`SCT_SWITCH.SCT_PATTERN.ID-${productTypeIdClicked}.SCT_PATTERN_ID`)
  //   }

  //   let res = undefined

  //   if (isCheck) {
  //     switch (columnName) {
  //       case 'MES':
  //         res = await fetchSctByLikeProductTypeIdAndCondition(dataItem)

  //         setValue(`SCT_SWITCH.MES.DATA-${productTypeIdClicked}`, res)

  //         //* Clear BOM
  //         setValue(`BOM_ACTUAL-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_THEN-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`MES-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BUDGET-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`PRICE-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_ACTUAL_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BOM_THEN_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`MES_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BUDGET_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`PRICE_BOM_BOM-${Number(productTypeIdClicked)}`, null)

  //         break

  //       case 'BUDGET':
  //         res = await fetchSctByLikeProductTypeIdAndCondition(dataItem)

  //         setValue(`SCT_SWITCH.BUDGET.DATA-${productTypeIdClicked}`, res)

  //         //* Clear BOM
  //         setValue(`BOM_ACTUAL-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_THEN-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`MES-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BUDGET-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`PRICE-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_ACTUAL_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BOM_THEN_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`MES_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BUDGET_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`PRICE_BOM_BOM-${Number(productTypeIdClicked)}`, null)

  //         break

  //       case 'PRICE':
  //         res = await fetchSctByLikeProductTypeIdAndCondition(dataItem)

  //         setValue(`SCT_SWITCH.PRICE.DATA-${productTypeIdClicked}`, res)

  //         //* Clear BOM
  //         setValue(`BOM_ACTUAL-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_THEN-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`MES-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BUDGET-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`PRICE-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_ACTUAL_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BOM_THEN_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`MES_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BUDGET_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`PRICE_BOM_BOM-${Number(productTypeIdClicked)}`, null)

  //         break

  //       case 'SCT_LATEST_REVISION':
  //         dataItem = {
  //           ...dataItem,
  //           FISCAL_YEAR: getValues(`SCT_SWITCH.SCT_FISCAL_YEAR.ID-${productTypeIdClicked}.SCT_FISCAL_YEAR_ID`),
  //           SCT_PATTERN_ID: getValues(`SCT_SWITCH.SCT_PATTERN.ID-${productTypeIdClicked}.SCT_PATTERN_ID`)
  //         }

  //         res = await fetchSctByLikeProductTypeIdAndCondition(dataItem)

  //         setValue(`SCT_SWITCH.SCT_LATEST_REVISION.DATA-${productTypeIdClicked}`, res)
  //         // if (res?.error) {
  //         //   toast.error(res.message)
  //         //   setValue(`SCT_SWITCH.SCT_LATEST_REVISION.ID-${productTypeIdClicked}`, false)
  //         // } else {
  //         //   console.log(res)
  //         //   setValue(`SCT_SWITCH.SCT_LATEST_REVISION.DATA-${productTypeIdClicked}`, res)
  //         // }

  //         //* Clear BOM
  //         setValue(`BOM_ACTUAL-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_THEN-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`MES-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BUDGET-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`PRICE-${Number(productTypeIdClicked)}`, 0)
  //         setValue(`BOM_ACTUAL_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BOM_THEN_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`MES_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`BUDGET_BOM_BOM-${Number(productTypeIdClicked)}`, null)
  //         setValue(`PRICE_BOM_BOM-${Number(productTypeIdClicked)}`, null)

  //         break

  //       case 'SCT_SELECT':
  //         setValue('isMultipleCreate', true)
  //         break

  //       default:
  //         break
  //     }
  //   } else {
  //     switch (columnName) {
  //       case 'MES':
  //         setValue(`SCT_SWITCH.MES.DATA-${productTypeIdClicked}`, null)
  //         setValue(formName, false)

  //         break

  //       case 'BUDGET':
  //         setValue(`SCT_SWITCH.BUDGET.DATA-${productTypeIdClicked}`, null)
  //         setValue(formName, false)

  //         break

  //       case 'PRICE':
  //         setValue(`SCT_SWITCH.PRICE.DATA-${productTypeIdClicked}`, null)
  //         setValue(formName, false)

  //         break

  //       case 'SCT_LATEST_REVISION':
  //         setValue(`SCT_SWITCH.SCT_LATEST_REVISION.DATA-${productTypeIdClicked}`, null)
  //         setValue(formName, false)

  //         break

  //       case 'SCT_SELECT':
  //         break

  //       default:
  //         break
  //     }
  //   }
  // }

  const resetAndSetNewValue = (
    key_productTypeCode: string,
    newData?: {
      sctCreateFrom?: 'BOM - BOM Actual' | 'SCT Last Revision' | 'SCT Selection'
      sctPatternNameForSelection?:
        | {
            SCT_PATTERN_ID: number
            SCT_PATTERN_NAME: string
          }
        | null
        | undefined
      bomId?: number | null | undefined
      bomCode?: string | null | undefined
      bomName?: string | null | undefined
      sctSelectId?: string | null | undefined
      sctRevisionCode?: string | null | undefined
      sctSelectStatusProgress?:
        | {
            SCT_STATUS_PROGRESS_ID?: number
            SCT_STATUS_PROGRESS_NAME?: string
          }
        | null
        | undefined
      sctSelectStatusName?: string | null | undefined
      fiscalYearForSelection?:
        | {
            value: number
            label: string
          }
        | null
        | undefined
    }
  ) => {
    const name = `productType.body.${key_productTypeCode}` as const

    const currentValue = getValues(name)

    // let { sctCreateFrom, fiscalYearForSelection, sctPatternNameForSelection } = data

    if (newData?.fiscalYearForSelection?.value) {
      setValue(
        name,
        {
          ...currentValue,
          fiscalYearForSelection: newData?.fiscalYearForSelection
        },
        { shouldValidate: true, shouldDirty: true }
      )
    } else if (newData?.sctPatternNameForSelection?.SCT_PATTERN_ID) {
      // setValue(
      //   name,
      //   {
      //     ...currentValue,
      //     sctPatternNameForSelection: newData?.sctPatternNameForSelection
      //   },
      //   { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      // )
      setValue(
        `productType.body.${key_productTypeCode}.sctPatternNameForSelection`,
        // {
        //   ...currentValue,
        newData?.sctPatternNameForSelection,
        // },
        { shouldValidate: true, shouldDirty: true, shouldTouch: true }
      )
    } else {
      setValue(
        name,
        {
          ...currentValue,
          sctCreateFrom: newData?.sctCreateFrom,
          // sctPatternNameForSelection: newData?.sctPatternNameForSelection,
          bomId: newData?.bomId,
          bomCode: newData?.bomCode,
          bomName: newData?.bomName,
          sctRevisionCode: newData?.sctRevisionCode,
          sctSelectStatusProgress: newData?.sctSelectStatusProgress,
          // fiscalYearForSelection: newData?.fiscalYearForSelection,
          sctSelectId: newData?.sctSelectId
        },
        { shouldValidate: true, shouldDirty: true }
      )
    }
    // setValue(
    //   name,
    //   {
    //     ...currentValue,
    //     sctPatternNameForSelection: newData?.sctPatternNameForSelection
    //   },
    //   { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    // )
    // setValue(
    //   `productType.body.PMFFCF04`,
    //   sctPatternNameForSelection {
    //     ...currentValue,
    //     sctPatternNameForSelection: {
    //       SCT_PATTERN_ID: 1,
    //       SCT_PATTERN_NAME: 'PMFFCF04'
    //     }
    //   },

    //   { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    // )

    // console.log(name)

    // setValue(
    //   `productType.body.PMFFCF04.sctPatternNameForSelection`,
    //   {
    //     SCT_PATTERN_ID: 1,
    //     SCT_PATTERN_NAME: 'PMFFCF04'
    //   },
    //   { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    // )
  }

  const columns = useMemo<MRT_ColumnDef<ProductTypeI>[]>(
    () => [
      {
        header: 'Product Group',
        columns: [
          {
            accessorKey: 'PRODUCT_TYPE_CODE',
            header: 'Product Type Code',
            Cell: ({ row }) => (
              <>
                <div className='flex  flex-col items-stretch gap-2'>
                  {row.original.PRODUCT_TYPE_CODE}{' '}
                  {/* {JSON.stringify(errors?.productType?.body?.[row.original.PRODUCT_TYPE_CODE])} */}
                  {/* {watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`) ?? '555'} */}
                  <Typography color='error'>
                    {errors?.productType?.body?.[row.original.PRODUCT_TYPE_CODE]?.sctCreateFrom?.message}
                  </Typography>
                </div>
              </>
            ),
            size: 300
          },
          {
            accessorKey: 'PRODUCT_TYPE_NAME',
            header: 'Product Type Name',
            size: 450
          },
          {
            accessorKey: 'PRODUCT_SUB_NAME',
            header: 'Product Sub'
          },
          {
            accessorKey: 'PRODUCT_MAIN_NAME',
            header: 'Product Main'
          },
          {
            accessorKey: 'PRODUCT_CATEGORY_NAME',
            header: 'Product Category'
          }
        ]
      },
      {
        header: 'Create From BOM',
        columns: [
          {
            header: 'BOM Actual',
            size: 300,
            Header: () => {
              useEffect(() => {
                const arr = Object.entries(getValues('productType.body') ?? {}).map(([key, value]) => ({
                  key,
                  ...value
                }))

                if (arr.every(item => item.sctCreateFrom == 'BOM - BOM Actual')) {
                  setValue('productType.header.switchBomActualAll', true, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                } else {
                  setValue('productType.header.switchBomActualAll', false, {
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
                  <Grid container className='items-center'>
                    <Controller
                      control={control}
                      name='productType.header.switchBomActualAll'
                      defaultValue={false}
                      render={({ field: { onChange, value, ...fieldProps } }) => (
                        <Switch
                          color='success'
                          size='medium'
                          checked={!!value}
                          onChange={async e => {
                            const isChecked = !!e.target.checked
                            onChange(isChecked)
                            const arr = Object.entries(getValues('productType.body') ?? {}).map(([key, value]) => ({
                              key,
                              ...value
                            }))
                            if (arr && arr.length > 0) {
                              for (let index = 0; index < arr.length; index++) {
                                if (isChecked) {
                                  if (arr[index].sctCreateFrom == 'BOM - BOM Actual') continue

                                  resetAndSetNewValue(arr[index].key, {
                                    sctCreateFrom: 'BOM - BOM Actual'
                                  })
                                  // await fetchBomByLikeProductTypeCodeAndCondition({
                                  //   CONDITION: 'BOM_ACTUAL',
                                  //   PRODUCT_TYPE_CODE: arr[index].key
                                  // }).then(responseJson => {
                                  //   //const currentValue = getValues(`productType.body.${arr[index].key}`)

                                  //   resetAndSetNewValue(arr[index].key, {
                                  //     sctCreateFrom: 'BOM - BOM Actual',
                                  //     bomId: responseJson?.BOM_ID,
                                  //     bomCode: responseJson?.BOM_CODE,
                                  //     bomName: responseJson?.BOM_NAME
                                  //   })
                                  //   // setValue(`productType.body.${arr[index].key}`, {
                                  //   //   ...currentValue,
                                  //   //   sctCreateFrom: 'BOM - BOM Actual',
                                  //   //   bomId: responseJson?.BOM_ID,
                                  //   //   bomCode: responseJson?.BOM_CODE,
                                  //   //   bomName: responseJson?.BOM_NAME,
                                  //   //   sctSelectId: null
                                  //   // })
                                  // })
                                } else {
                                  // if (
                                  //   getValues(`productType.body.${arr[index].key}`)?.sctCreateFrom == 'BOM - BOM Actual'
                                  // ) {
                                  resetAndSetNewValue(arr[index].key)
                                  // }
                                }
                              }
                            }

                            // onChange({
                            //   ...currentValue,
                            //   sctCreateFrom: '',
                            //   sctSelectId: null,
                            //   sctRevisionCode: '',
                            //   bomId: null,
                            //   bomCode: null,
                            //   bomName: null,
                            //   sctSelectStatusId: null,
                            //   sctSelectStatusName: null
                            // })
                            // setValue('productType.header.switchBomActualAll', false, {
                            //   shouldValidate: true,
                            //   shouldDirty: true
                            // })
                            // setValue('productType.header.switchSctLatestRevisionAll', false, {
                            //   shouldValidate: true,
                            //   shouldDirty: true
                            // })
                            // setValue('productType.header.switchSctSelectionAll', false, {
                            //   shouldValidate: true,
                            //   shouldDirty: true
                            // })
                          }}
                          {...fieldProps}
                        />
                      )}
                    />
                    <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>BOM Actual</Typography>
                  </Grid>
                </>
              )
            },
            Cell: ({ row }) => {
              //               const fiscalYearForSelection = useWatch({
              //   control: control,
              //   name: `productType.body.${row.original.PRODUCT_TYPE_CODE}.`
              // })

              // const sctPatternNameForSelection = useWatch({
              //   control: control,
              //   name: `productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`
              // })

              useEffect(() => {
                const fetchData = async () => {
                  await fetchBomByLikeProductTypeIdAndCondition({
                    CONDITION: 'BOM_ACTUAL',
                    PRODUCT_TYPE_ID: row.original.PRODUCT_TYPE_ID
                  })
                    .then(responseJson => {
                      resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                        sctCreateFrom: 'BOM - BOM Actual',
                        bomId: responseJson?.BOM_ID,
                        bomCode: responseJson?.BOM_CODE,
                        bomName: responseJson?.BOM_NAME
                      })
                    })
                    .catch(error => {
                      toast.error(error.message)
                      resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                        sctCreateFrom: 'BOM - BOM Actual'
                      })
                    })
                }

                if (watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`) == 'BOM - BOM Actual') {
                  fetchData()
                }
              }, [watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`)])

              return (
                <>
                  {/* {watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`)} */}
                  <Controller
                    control={control}
                    name={`productType.body.${row.original.PRODUCT_TYPE_CODE}`}
                    defaultValue={null}
                    render={({ field: { value, ...fieldProps } }) => {
                      return (
                        <>
                          <FormControlLabel
                            {...fieldProps}
                            label={
                              value?.bomId &&
                              value?.sctCreateFrom == 'BOM - BOM Actual' && (
                                <>
                                  <div className='flex items-center'>
                                    <Typography>{value?.bomCode}</Typography>
                                  </div>
                                </>
                              )
                            }
                            control={
                              <Switch
                                style={{
                                  cursor: 'pointer'
                                }}
                                color='success'
                                checked={!!(value?.sctCreateFrom == 'BOM - BOM Actual')}
                                size='medium'
                                onChange={async e => {
                                  if (e?.target?.checked) {
                                    await fetchBomByLikeProductTypeIdAndCondition({
                                      CONDITION: 'BOM_ACTUAL',
                                      PRODUCT_TYPE_ID: row.original.PRODUCT_TYPE_ID
                                    }).then(responseJson => {
                                      resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                                        sctCreateFrom: 'BOM - BOM Actual',
                                        bomId: responseJson?.BOM_ID,
                                        bomCode: responseJson?.BOM_CODE,
                                        bomName: responseJson?.BOM_NAME
                                      })
                                    })
                                  } else {
                                    resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE)
                                  }

                                  // setValue('productType.header.switchBomActualAll', false, {
                                  //   shouldValidate: true,
                                  //   shouldDirty: true
                                  // })
                                  // setValue('productType.header.switchSctLatestRevisionAll', false, {
                                  //   shouldValidate: true,
                                  //   shouldDirty: true
                                  // })
                                  // setValue('productType.header.switchSctSelectionAll', false, {
                                  //   shouldValidate: true,
                                  //   shouldDirty: true
                                  // })
                                }}
                              />
                            }
                          />
                        </>
                      )
                    }}
                  />
                  {errors?.productType?.body?.[row.original.PRODUCT_TYPE_CODE] && (
                    <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
                      {errors.productType.body?.[row.original.PRODUCT_TYPE_CODE]?.message}
                    </span>
                  )}
                </>
              )
            }
          }
        ]
      },
      {
        header: 'Create From SCT Latest Revision',
        columns: [
          {
            header: 'FISCAL YEAR',
            size: 270,
            Header: () => {
              return (
                <>
                  <Grid container alignItems='flex-end'>
                    <div className='flex gap-2 items-end'>
                      <Controller
                        name='productType.header.SwitchFiscalYearForSelection'
                        control={control}
                        defaultValue={null}
                        render={({ field: { ...fieldProps } }) => (
                          <AsyncSelectCustom
                            {...fieldProps}
                            label='Fiscal Year'
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={() => {
                              const fiscalYear = Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i + 1

                                return { value: year, label: year.toString() }
                              })

                              return Promise.resolve(fiscalYear)
                            }}
                            classNamePrefix='select'
                            placeholder='Select ...'
                            className='w-40'
                          />
                        )}
                      />
                      <Button
                        color='primary'
                        onClick={() => {
                          const arr = Object.entries(getValues('productType.body') ?? {}).map(([key, value]) => ({
                            key,
                            ...value
                          }))
                          if (arr && arr.length > 0) {
                            for (let index = 0; index < arr.length; index++) {
                              setValue(
                                `productType.body.${arr[index].key}.fiscalYearForSelection`,
                                getValues('productType.header.SwitchFiscalYearForSelection')
                              )
                            }
                          }
                        }}
                        variant='contained'
                      >
                        OK
                      </Button>
                    </div>
                  </Grid>
                </>
              )
            },
            Cell: ({ row }) => {
              return (
                <>
                  <Controller
                    control={control}
                    name={`productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`}
                    render={({ field: { ...fieldProps } }) => {
                      return (
                        <>
                          <AsyncSelectCustom
                            {...fieldProps}
                            label=''
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={() => {
                              const fiscalYear = Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i + 1

                                return { value: year, label: year.toString() }
                              })

                              return Promise.resolve(fiscalYear)
                            }}
                            getOptionLabel={data => data?.label.toString()}
                            getOptionValue={data => data.value.toString()}
                            classNamePrefix='select'
                            placeholder='Select ...'
                            className='w-30'
                          />
                        </>
                      )
                    }}
                  />
                </>
              )
            }
          },
          {
            header: 'SCT PATTERN NO',
            size: 270,
            Header: () => {
              return (
                <>
                  <Grid container alignItems='flex-end'>
                    <div className='flex gap-2 items-end m-1'>
                      <Controller
                        name='productType.header.SwitchSctPatternNameForSelection'
                        control={control}
                        render={({ field: { ...fieldProps } }) => (
                          <AsyncSelectCustom
                            {...fieldProps}
                            label='SCT Pattern'
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={inputValue => {
                              return fetchSctPatternByLikePatternNameAndInuse(inputValue, 1)
                            }}
                            getOptionLabel={data => data?.SCT_PATTERN_NAME}
                            getOptionValue={data => data.SCT_PATTERN_ID.toString()}
                            classNamePrefix='select'
                            placeholder='Select ...'
                            className='w-40'
                            //isDisabled={Object.values(watch(`BOM_SWITCH`) ?? {}).some((item: any) => item === true)}
                          />
                        )}
                      />
                      <Button
                        color='primary'
                        onClick={() => {
                          const arr = Object.entries(getValues('productType.body') ?? {}).map(([key, value]) => ({
                            key,
                            ...value
                          }))
                          if (arr && arr.length > 0) {
                            for (let index = 0; index < arr.length; index++) {
                              resetAndSetNewValue(arr[index].key, {
                                sctPatternNameForSelection: getValues(
                                  'productType.header.SwitchSctPatternNameForSelection'
                                )
                              })
                            }
                          }
                        }}
                        variant='contained'
                      >
                        OK
                      </Button>
                    </div>
                  </Grid>
                </>
              )
            },
            Cell: ({ row }) => {
              return (
                <>
                  <Controller
                    control={control}
                    name={`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`}
                    render={({ field: { ...fieldProps } }) => {
                      return (
                        <>
                          <AsyncSelectCustom
                            label=''
                            isClearable
                            cacheOptions
                            defaultOptions
                            loadOptions={inputValue => {
                              // console.log(inputValue)
                              return fetchSctPatternByLikePatternNameAndInuse(inputValue, 1)
                            }}
                            getOptionLabel={data => data?.SCT_PATTERN_NAME.toString()}
                            getOptionValue={data => data.SCT_PATTERN_ID.toString()}
                            classNamePrefix='select'
                            placeholder='Select ...'
                            className='w-30'
                            {...fieldProps}
                          />
                        </>
                      )
                    }}
                  />
                </>
              )
            }
          },
          {
            header: 'SCT Latest Revision',
            size: 370,
            Header: () => {
              useEffect(() => {
                const arr = Object.entries(getValues('productType.body') ?? {}).map(([key, value]) => ({
                  key,
                  ...value
                }))

                if (arr.every(item => item.sctCreateFrom == 'SCT Last Revision')) {
                  setValue('productType.header.switchSctLatestRevisionAll', true, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                } else {
                  setValue('productType.header.switchSctLatestRevisionAll', false, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                }
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
                  <Grid container className='items-center'>
                    <Controller
                      control={control}
                      name='productType.header.switchSctLatestRevisionAll'
                      defaultValue={false}
                      render={({ field: { onChange, value, ...fieldProps } }) => (
                        <Switch
                          color='success'
                          size='medium'
                          checked={!!value}
                          onChange={async e => {
                            const isChecked = !!e.target.checked

                            onChange(isChecked)

                            const arr = Object.entries(getValues('productType.body') ?? {}).map(([key, value]) => ({
                              key,
                              ...value
                            }))

                            if (arr && arr.length > 0) {
                              for (let index = 0; index < arr.length; index++) {
                                if (isChecked) {
                                  if (arr[index].sctCreateFrom === 'SCT Last Revision') continue
                                  resetAndSetNewValue(arr[index].key, {
                                    sctCreateFrom: 'SCT Last Revision'
                                  })
                                } else {
                                  resetAndSetNewValue(arr[index].key)
                                }
                              }
                            }

                            setValue('productType.header.switchBomActualAll', false)
                          }}
                          {...fieldProps}
                        />
                      )}
                    />
                    <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>SCT Latest Revision</Typography>
                  </Grid>
                </>
              )
            },
            Cell: ({ row }) => {
              const fiscalYearForSelection = useWatch({
                control: control,
                name: `productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`
              })

              const sctPatternNameForSelection = useWatch({
                control: control,
                name: `productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`
              })

              useEffect(() => {
                const fetchData = async () => {
                  if (fiscalYearForSelection?.value && sctPatternNameForSelection?.SCT_PATTERN_ID) {
                    await fetchSctByLikeProductTypeCodeAndCondition({
                      CONDITION: 'SCT_LATEST_REVISION',
                      PRODUCT_TYPE_CODE: row.original.PRODUCT_TYPE_CODE,
                      FISCAL_YEAR:
                        getValues(`productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`)?.value ??
                        0,
                      SCT_PATTERN_ID:
                        getValues(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`)
                          ?.SCT_PATTERN_ID ?? 0
                    })
                      .then(responseJson => {
                        resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                          sctCreateFrom: 'SCT Last Revision',
                          sctSelectStatusProgress: {
                            SCT_STATUS_PROGRESS_ID: responseJson?.SCT_STATUS_PROGRESS_ID,
                            SCT_STATUS_PROGRESS_NAME: responseJson?.SCT_STATUS_PROGRESS_NAME
                          },
                          sctRevisionCode: responseJson?.SCT_REVISION_CODE,
                          bomId: responseJson?.BOM_ID,
                          bomCode: responseJson?.BOM_CODE,
                          bomName: responseJson?.BOM_NAME,
                          sctSelectId: responseJson?.SCT_ID
                        })
                      })
                      .catch(error => {
                        toast.error(error.message)
                        resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                          sctCreateFrom: 'SCT Last Revision'
                        })
                      })
                  } else {
                    resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                      sctCreateFrom: 'SCT Last Revision'
                    })
                  }
                }

                if (watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`) == 'SCT Last Revision')
                  fetchData()
              }, [watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`)])

              useEffect(() => {
                const fetchData = async () => {
                  if (fiscalYearForSelection?.value && sctPatternNameForSelection?.SCT_PATTERN_ID) {
                    await fetchSctByLikeProductTypeCodeAndCondition({
                      CONDITION: 'SCT_LATEST_REVISION',
                      PRODUCT_TYPE_CODE: row.original.PRODUCT_TYPE_CODE,
                      FISCAL_YEAR:
                        getValues(`productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`)?.value ??
                        0,
                      SCT_PATTERN_ID:
                        getValues(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`)
                          ?.SCT_PATTERN_ID ?? 0
                    })
                      .then(responseJson => {
                        resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                          sctCreateFrom: 'SCT Last Revision',
                          sctSelectStatusProgress: {
                            SCT_STATUS_PROGRESS_ID: responseJson?.SCT_STATUS_PROGRESS_ID,
                            SCT_STATUS_PROGRESS_NAME: responseJson?.SCT_STATUS_PROGRESS_NAME
                          },
                          sctRevisionCode: responseJson?.SCT_REVISION_CODE,
                          bomId: responseJson?.BOM_ID,
                          bomCode: responseJson?.BOM_CODE,
                          bomName: responseJson?.BOM_NAME,
                          sctSelectId: responseJson?.SCT_ID
                        })
                      })
                      .catch(error => {
                        toast.error(error.message)
                        resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                          sctCreateFrom: 'SCT Last Revision'
                        })
                      })
                  } else {
                    resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                      sctCreateFrom: 'SCT Last Revision'
                    })
                  }
                }

                if (watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctCreateFrom`) == 'SCT Last Revision')
                  fetchData()
              }, [fiscalYearForSelection?.value, sctPatternNameForSelection?.SCT_PATTERN_ID])

              // useEffect(async () => {
              //   const FISCAL_YEAR = watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.fiscalYearForSelection
              //     ?.value
              //   const SCT_PATTERN_ID = watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)
              //     ?.sctPatternNameForSelection?.SCT_PATTERN_ID

              //   await fetchSctByLikeProductTypeCodeAndCondition({
              //     CONDITION: 'SCT_LATEST_REVISION',
              //     PRODUCT_TYPE_CODE: row.original.PRODUCT_TYPE_CODE,
              //     FISCAL_YEAR:
              //       getValues(`productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`)?.value ?? 0,
              //     SCT_PATTERN_ID:
              //       getValues(`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`)
              //         ?.SCT_PATTERN_ID ?? 0
              //   }).then(responseJson => {
              //     resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
              //       sctCreateFrom: 'SCT Last Revision',
              //       sctSelectStatusId: responseJson?.SCT_STATUS_PROGRESS_ID,
              //       sctRevisionCode: responseJson?.SCT_REVISION_CODE,
              //       bomId: responseJson?.BOM_ID,
              //       bomCode: responseJson?.BOM_CODE,
              //       bomName: responseJson?.BOM_NAME,
              //       sctSelectId: responseJson?.SCT_ID,
              //       sctSelectStatusName: responseJson?.SCT_STATUS_PROGRESS_NAME
              //     })
              //   })
              // }, [
              //   watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.fiscalYearForSelection?.value,
              //   watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.sctPatternNameForSelection?.SCT_PATTERN_ID
              // ])

              return (
                <>
                  {/* {JSON.stringify(watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.fiscalYearForSelection)}
                  {JSON.stringify(
                    watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.sctPatternNameForSelection
                  )} */}
                  <Controller
                    control={control}
                    name={`productType.body.${row.original.PRODUCT_TYPE_CODE}`}
                    defaultValue={null}
                    render={({ field: { value, ...fieldProps } }) => {
                      return (
                        <>
                          <FormControlLabel
                            {...fieldProps}
                            label={
                              value?.sctCreateFrom == 'SCT Last Revision' ? (
                                <>
                                  {value?.sctSelectId && value?.sctRevisionCode ? (
                                    <div className='flex items-center'>
                                      <Typography>{value?.sctRevisionCode}</Typography>
                                    </div>
                                  ) : !value.fiscalYearForSelection?.value ||
                                    !value.sctPatternNameForSelection?.SCT_PATTERN_ID ? (
                                    <Typography className='text-nowrap' color='error.main'>
                                      Please Select a Fiscal Year and SCT Pattern
                                    </Typography>
                                  ) : (
                                    <Typography className='text-nowrap' color='error.main'>
                                      Not Found SCT
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                ''
                              )
                            }
                            control={
                              <Switch
                                style={{
                                  cursor: 'pointer'
                                }}
                                color='success'
                                checked={!!(value?.sctCreateFrom == 'SCT Last Revision')}
                                size='medium'
                                onChange={async e => {
                                  if (e?.target?.checked) {
                                    // console.log(
                                    //   getValues(
                                    //     `productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`
                                    //   )?.value
                                    // )

                                    if (
                                      !getValues(
                                        `productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`
                                      )?.value ||
                                      !getValues(
                                        `productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`
                                      )?.SCT_PATTERN_ID
                                    ) {
                                      toast.error('Please Select Fiscal Year and SCT Pattern Name First')
                                      return
                                    }

                                    setValue('productType.header.switchBomActualAll', false, {
                                      shouldValidate: true,
                                      shouldDirty: true
                                    })
                                    await fetchSctByLikeProductTypeCodeAndCondition({
                                      CONDITION: 'SCT_LATEST_REVISION',
                                      PRODUCT_TYPE_CODE: row.original.PRODUCT_TYPE_CODE,
                                      FISCAL_YEAR:
                                        getValues(
                                          `productType.body.${row.original.PRODUCT_TYPE_CODE}.fiscalYearForSelection`
                                        )?.value ?? 0,
                                      SCT_PATTERN_ID:
                                        getValues(
                                          `productType.body.${row.original.PRODUCT_TYPE_CODE}.sctPatternNameForSelection`
                                        )?.SCT_PATTERN_ID ?? 0
                                    }).then(responseJson => {
                                      resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                                        sctCreateFrom: 'SCT Last Revision',
                                        sctSelectStatusProgress: {
                                          SCT_STATUS_PROGRESS_ID: responseJson?.SCT_STATUS_PROGRESS_ID,
                                          SCT_STATUS_PROGRESS_NAME: responseJson?.SCT_STATUS_PROGRESS_NAME
                                        },
                                        sctRevisionCode: responseJson?.SCT_REVISION_CODE,
                                        bomId: responseJson?.BOM_ID,
                                        bomCode: responseJson?.BOM_CODE,
                                        bomName: responseJson?.BOM_NAME,
                                        sctSelectId: responseJson?.SCT_ID
                                      })
                                    })
                                  } else {
                                    resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE)
                                  }
                                  setValue('productType.header.switchBomActualAll', false, {
                                    shouldValidate: true,
                                    shouldDirty: true
                                  })
                                  setValue('productType.header.switchSctLatestRevisionAll', false, {
                                    shouldValidate: true,
                                    shouldDirty: true
                                  })
                                }}
                              />
                            }
                          />
                        </>
                      )
                    }}
                  />
                  {errors?.productType?.body?.[row.original.PRODUCT_TYPE_CODE]?.sctRevisionCode && (
                    <span className={twMerge('custom-error-message', 'error-mui-color', 'mx-auto')}>
                      {errors.productType.body?.[row.original.PRODUCT_TYPE_CODE]?.message}
                    </span>
                  )}
                </>
              )
            }
          }
          // {
          //   header: 'SCT Latest Revision',
          //   size: 250,
          //   Header: ({ column }) => {
          //     return (
          //       <>
          //         <Grid container className='items-center'>
          //           <Switch
          //             disabled={Object.values(watch(`BOM_SWITCH`) ?? {}).some((item: any) => item === true)}
          //             color='success'
          //             size='medium'
          //             checked={sctSwitchHeader.SCT_LATEST_REVISION}
          //             onChange={e => {
          //               setSctSwitchHeader({
          //                 MES: false,
          //                 BUDGET: false,
          //                 PRICE: false,
          //                 SCT_LATEST_REVISION: e.target.checked,
          //                 SCT_SELECT: false
          //               })

          //               if (e.target.checked) {
          //                 for (let dataProductType of dataProductTypeSelected) {
          //                   setValue(`SCT_SWITCH.SCT_LATEST_REVISION.ID-${dataProductType.PRODUCT_TYPE_ID}`, true)
          //                   handleEditSctSwitch(
          //                     'SCT_LATEST_REVISION',
          //                     e.target.checked,
          //                     `SCT_SWITCH.SCT_LATEST_REVISION.ID-${dataProductType.PRODUCT_TYPE_ID}`,
          //                     dataProductType.PRODUCT_TYPE_ID
          //                   )
          //                 }
          //               } else {
          //                 for (let dataProductType of dataProductTypeSelected) {
          //                   setValue(`SCT_SWITCH.SCT_LATEST_REVISION.ID-${dataProductType.PRODUCT_TYPE_ID}`, false)
          //                 }
          //               }
          //             }}
          //           />
          //           <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>SCT Latest Revision</Typography>
          //         </Grid>
          //       </>
          //     )
          //   },
          //   Cell: ({ renderedCellValue, row, cell }) => {
          //     return (
          //       <>
          //         <Controller
          //           control={control}
          //           name={`productType.body.${row.original.PRODUCT_TYPE_CODE}.sctLatestRevisionForSelection`}
          //           render={({ field: { value, onChange, ...fieldProps } }) => {
          //             return (
          //               <>
          //                 <FormControlLabel
          //                   control={
          //                     <Switch
          //                       //   disabled={Object.values(watch(`BOM_SWITCH`)).some((item: any) => item === true)}
          //                       style={{
          //                         cursor: 'pointer'
          //                       }}
          //                       color='success'
          //                       checked={value}
          //                       // checked={value == 1 ? true : false}
          //                       size='medium'
          //                       //innerRef={ref}
          //                       onChange={e => {
          //                         setSctSwitchHeader({
          //                           MES: false,
          //                           BUDGET: false,
          //                           PRICE: false,
          //                           SCT_LATEST_REVISION: false,
          //                           SCT_SELECT: false
          //                         })

          //                         // onChange(e.target.checked)
          //                         // e.target.name = `MES-${row.original.PRODUCT_TYPE_ID}`
          //                         handleEditSctSwitch(
          //                           'SCT_LATEST_REVISION',
          //                           e.target.checked,
          //                           fieldProps.name,
          //                           row.original.PRODUCT_TYPE_ID
          //                         )
          //                       }}
          //                       {...fieldProps}
          //                     />
          //                   }
          //                   label={
          //                     value && (
          //                       <>
          //                         <div className='flex items-center'>
          //                           {watch(
          //                             `SCT_SWITCH.SCT_LATEST_REVISION.DATA-${Number(row.original.PRODUCT_TYPE_ID)}.error`
          //                           ) ? null : (
          //                             <></>
          //                             // <IconButton
          //                             // // onClick={() => handleClickOpenModalView(row)}
          //                             // >
          //                             //   <i className='tabler-eye text-[22px] text-textSecondary' />
          //                             // </IconButton>
          //                           )}
          //                           <Typography
          //                             className={twMerge(
          //                               'text-nowrap',
          //                               watch(
          //                                 `SCT_SWITCH.SCT_LATEST_REVISION.DATA-${Number(row.original.PRODUCT_TYPE_ID)}.error`
          //                               )
          //                                 ? 'text-red-500'
          //                                 : ''
          //                             )}
          //                           >
          //                             {watch(
          //                               `SCT_SWITCH.SCT_LATEST_REVISION.DATA-${Number(row.original.PRODUCT_TYPE_ID)}.error`
          //                             )
          //                               ? watch(
          //                                   `SCT_SWITCH.SCT_LATEST_REVISION.DATA-${Number(row.original.PRODUCT_TYPE_ID)}.message`
          //                                 )
          //                               : watch(
          //                                   `SCT_SWITCH.SCT_LATEST_REVISION.DATA-${Number(row.original.PRODUCT_TYPE_ID)}.SCT_REVISION_CODE`
          //                                 )}
          //                           </Typography>
          //                         </div>
          //                       </>
          //                     )
          //                   }
          //                 />
          //               </>
          //             )
          //           }}
          //         />
          //       </>
          //     )
          //   }
          // },
        ]
      },
      {
        header: 'Create From SCT Selection',
        columns: [
          {
            header: 'SCT Selection',
            size: 320,
            // Header: () => {
            //   return (
            //     <>
            //       <Grid container className='items-center'>
            //         <Switch
            //           disabled={Object.values(watch(`BOM_SWITCH`) ?? {}).some((item: any) => item === true)}
            //           color='success'
            //           size='medium'
            //           checked={sctSwitchHeader.SCT_SELECT}
            //           onChange={e => {
            //             setSctSwitchHeader({
            //               MES: false,
            //               BUDGET: false,
            //               PRICE: false,
            //               SCT_LATEST_REVISION: false,
            //               SCT_SELECT: e.target.checked
            //             })

            //             if (e.target.checked) {
            //               for (let dataProductType of dataProductTypeSelected) {
            //                 setValue(`SCT_SWITCH.SCT_SELECT.ID-${dataProductType.PRODUCT_TYPE_ID}`, true)
            //                 handleEditSctSwitch(
            //                   'SCT_SELECT',
            //                   e.target.checked,
            //                   `SCT_SWITCH.SCT_SELECT.ID-${dataProductType.PRODUCT_TYPE_ID}`,
            //                   dataProductType.PRODUCT_TYPE_ID
            //                 )
            //               }
            //             } else {
            //               for (let dataProductType of dataProductTypeSelected) {
            //                 setValue(`SCT_SWITCH.SCT_SELECT.ID-${dataProductType.PRODUCT_TYPE_ID}`, false)
            //               }
            //             }
            //           }}
            //         />
            //         <Typography sx={{ fontSize: '13px', fontWeight: 'bold' }}>SCT Select</Typography>
            //       </Grid>
            //     </>
            //   )
            // },
            Cell: ({ row }) => {
              const [openSctDataModal, setOpenSctDataModal] = useState(false)

              return (
                <>
                  <div className='flex'>
                    <Controller
                      control={control}
                      name={`productType.body.${row.original.PRODUCT_TYPE_CODE}`}
                      render={({ field: { value, ...fieldProps } }) => {
                        return (
                          <Switch
                            style={{
                              cursor: 'pointer'
                            }}
                            color='success'
                            checked={value?.sctCreateFrom === 'SCT Selection'}
                            size='medium'
                            {...fieldProps}
                            onChange={e => {
                              if (e.target.checked) {
                                resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE, {
                                  sctCreateFrom: 'SCT Selection',
                                  sctSelectId: null,
                                  sctRevisionCode: '',
                                  bomId: null,
                                  bomCode: null,
                                  bomName: null,
                                  sctSelectStatusProgress: null,
                                  sctSelectStatusName: null
                                })
                              } else {
                                resetAndSetNewValue(row.original.PRODUCT_TYPE_CODE)
                              }
                            }}
                          />
                        )
                      }}
                    />

                    {watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.sctCreateFrom === 'SCT Selection' ? (
                      <CustomTextField
                        value={watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.sctRevisionCode ?? ''}
                        label=''
                        onClick={() => setOpenSctDataModal(true)}
                        fullWidth
                        className='w-[250px]'
                      />
                    ) : null}

                    {openSctDataModal && (
                      <>
                        <SctSelectionModal
                          isOpenSctModal={openSctDataModal}
                          setIsOpenSctDataModal={setOpenSctDataModal}
                          inputName={`SCT_SWITCH.SCT_SELECT.DATA-${row.original.PRODUCT_TYPE_ID}`}
                          rowData={row.original}
                          RHF_parent={formContext}
                        />
                      </>
                    )}
                  </div>
                </>
              )
            }
          }
        ]
      },
      {
        header: 'SCT Status',
        Cell: ({ row }) => {
          return (
            <>
              <div className='flex items-center'>
                <Typography className='text-nowrap'>
                  {watch(`productType.body.${row.original.PRODUCT_TYPE_CODE}`)?.sctSelectStatusProgress
                    ?.SCT_STATUS_PROGRESS_NAME ?? ''}
                </Typography>
              </div>
            </>
          )
        }
      }
    ],
    [errors]
  )

  const table = useMaterialReactTable({
    columns,
    enableRowActions: false,
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: false,
    enablePagination: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnFilterModes: false,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableGlobalFilterModes: false,
    enableHiding: false,
    enableColumnActions: false,
    enableRowDragging: false,
    enableRowSelection: false,
    enableBottomToolbar: false,
    enableTopToolbar: false,
    enableColumnPinning: true,
    enableColumnResizing: true,
    layoutMode: 'grid-no-grow',
    data: dataProductTypeSelected || [],
    //onRowSelectionChange: setRowSelection,
    initialState: { density: 'compact', columnPinning: { left: ['PRODUCT_TYPE_CODE'] } },
    muiTableHeadCellProps: ({ column }) => ({
      sx: {
        textAlign: 'center', // จัดกลางแนวนอน
        verticalAlign: 'middle', // จัดกลางแนวตั้ง
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 600,
        textTransform: 'uppercase',
        //backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)',
        display: 'flex',
        py: 1,
        backgroundColor:
          column.id === 'SCT Selection' ||
          column.id === 'Create From BOM' ||
          column.id === 'BOM Actual' ||
          column.id === 'Create From SCT Selection'
            ? 'rgb(var(--mui-palette-primary-mainChannel) / 0.15)'
            : // : [
              //       'Create From SCT',
              //       'FISCAL YEAR',
              //       'SCT PATTERN NO',
              //       'SCT Latest Revision',
              //       'SCT Status',
              //       'SCT Select'
              //     ].includes(column.id)
              //   ? 'rgb(var(--mui-palette-background-paperChannel) / 0.075)'
              'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
        // backgroundColor:
        //   column.id === 'Create From BOM' || column.id === 'BOM Actual'
        //     ? 'rgb(var(--mui-palette-primary-mainChannel) / 0.15)'
        //     : [
        //           'Create From SCT',
        //           'FISCAL YEAR',
        //           'SCT PATTERN NO',
        //           'SCT Latest Revision',
        //           'SCT Status',
        //           'SCT Select'
        //         ].includes(column.id)
        //       ? 'rgb(var(--mui-palette-background-paperChannel) / 0.075)'
        //       : 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
      }
    }),
    muiTableHeadRowProps: () => ({
      sx: {
        textAlign: 'center',
        verticalAlign: 'middle',
        '& th': { verticalAlign: 'middle' }
      }
    }),
    muiTableBodyProps: {
      sx: theme => ({
        //stripe the rows, make odd rows a darker color
        '& tr:nth-of-type(odd) > td': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgb(var(--mui-palette-primary-mainChannel) / 0.05)'
              : 'rgb(var(--mui-palette-primary-mainChannel) / 0.04)'
        }
      })
    },
    // muiTableHeadCellColumnGroupProps: {
    //   sx: {
    //     textAlign: 'center',
    //     verticalAlign: 'middle',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     py: 1,
    //     fontWeight: 700,
    //     color: '#fff'
    //   }
    // },
    muiTableBodyCellProps: {
      sx: theme => ({
        backgroundColor: 'var(--mui-palette-background-default)',
        fontSize: 15,
        borderRight:
          theme.palette.mode === 'dark'
            ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.2)'
            : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)',
        borderBottom:
          theme.palette.mode === 'dark'
            ? '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.08)'
            : '1px solid rgb(var(--mui-palette-primary-mainChannel) / 0.19)'
      })
    },
    muiTableBodyRowProps: {},
    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--mui-palette-background-default)'
      }
    },
    muiTablePaperProps: ({ table }) => ({
      elevation: 0, //change the mui box shadow
      style: {
        zIndex: table.getState().isFullScreen ? 2000 : undefined
      },
      sx: {
        borderRadius: '0'
      }
    })
  })

  return <MaterialReactTable table={table} />
}

export default ProductTypeSelection

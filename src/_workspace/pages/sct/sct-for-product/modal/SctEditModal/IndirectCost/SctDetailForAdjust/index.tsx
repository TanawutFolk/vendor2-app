import { Button, IconButton, Tooltip, Typography } from '@mui/material'
import { Controller, get, useFormContext, useFormState, useWatch } from 'react-hook-form'
import { FormDataPage } from '../../validationSchema'
import EditIcon from '@mui/icons-material/Edit'
import CustomTextField from '@/components/mui/TextField'
import IndirectCostConditionServices from '@/_workspace/services/cost-condition/IndirectCostConditionServices'
import { toast } from 'react-toastify'
import OtherCostConditionServices from '@/_workspace/services/cost-condition/OtherCostConditionServices'
import SpecialCostConditionServices from '@/_workspace/services/cost-condition/SpecialCostConditionServices'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'

interface Props {
  // name:
  //   | 'indirectCost.main.costCondition.indirectCostCondition.totalIndirectCost'
  //   | 'indirectCost.main.costCondition.otherCostCondition.ga'
  //   | 'indirectCost.main.costCondition.otherCostCondition.margin'
  //   | 'indirectCost.main.costCondition.otherCostCondition.sellingExpense'
  //   | 'indirectCost.main.costCondition.otherCostCondition.vat'
  //   | 'indirectCost.main.costCondition.otherCostCondition.cit'
  //   | 'indirectCost.main.costCondition.specialCostCondition.adjustPrice'
  // adjustName:
  //   | 'sctDetailForAdjust.indirectCostCondition.totalIndirectCost'
  //   | 'sctDetailForAdjust.otherCostCondition.sellingExpense'
  //   | 'sctDetailForAdjust.otherCostCondition.margin'
  //   | 'sctDetailForAdjust.otherCostCondition.ga'
  //   | 'sctDetailForAdjust.otherCostCondition.vat'
  //   | 'sctDetailForAdjust.otherCostCondition.cit'
  //   | 'sctDetailForAdjust.specialCostCondition.adjustPrice'
  inputName:
    | 'indirectCostCondition.totalIndirectCost'
    | 'otherCostCondition.ga'
    | 'otherCostCondition.margin'
    | 'otherCostCondition.sellingExpense'
    | 'otherCostCondition.vat'
    | 'otherCostCondition.cit'
    | 'specialCostCondition.adjustPrice'
  masterDataSelection: 'indirectCostCondition' | 'specialCostCondition' | 'otherCostCondition'
  unit: string
  isEnableEditing?: boolean
}

const SctDetailForAdjust = ({ inputName, unit = '', masterDataSelection, isEnableEditing = true }: Props) => {
  const { watch, setValue, control, getValues } = useFormContext<FormDataPage>()

  const { errors } = useFormState({
    control
  })

  const isAdjust = useWatch({
    control,
    name: `adjust.${inputName}.isAdjust`,
    defaultValue: false
  })

  const dataFromSctResourceOptionId = useWatch({
    control,
    name: `adjust.${inputName}.dataFromSctResourceOptionId`
  })
  const SCT_RESOURCE_OPTION_ID = useWatch({
    control,
    name: `masterDataSelection.${masterDataSelection}.SCT_RESOURCE_OPTION_ID`
  })

  const [mode, sctCreateFromSettingId] = useWatch({
    control,
    name: ['mode', 'header.sctCreateFrom.SCT_CREATE_FROM_SETTING_ID']
  })

  return (
    <>
      <div className='flex gap-2 justify-end  items-center w-full h-full'>
        {isEnableEditing && (
          <Tooltip title='Edit Data' arrow>
            <Controller
              name={`adjust.${inputName}.isAdjust`}
              control={control}
              render={({ field: { value: _, ...fieldProps } }) => (
                <IconButton
                  {...fieldProps}
                  size='small'
                  onClick={() => {
                    const isDisabledInput = getValues(`adjust.${inputName}.isDisabledInput`)
                    setValue(`adjust.${inputName}.isDisabledInput`, !isDisabledInput, {
                      shouldValidate: true
                    })
                  }}
                  disabled={mode === 'view' || watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') !== 2}
                >
                  <EditIcon />
                </IconButton>
              )}
            />
          </Tooltip>
        )}
        <Tooltip title='Refresh to Master Data' arrow>
          <Button
            size='small'
            variant='tonal'
            color='primary'
            startIcon={<i className='tabler-refresh' />}
            disabled={
              mode === 'view' ||
              watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') !== 2 ||
              1 === dataFromSctResourceOptionId
            }
            onClick={async () => {
              switch (inputName) {
                // ? Indirect Cost
                case 'indirectCostCondition.totalIndirectCost': {
                  await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest(
                    {
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                    }
                  )
                    .then(res => {
                      setValue(
                        `indirectCost.main.costCondition.${inputName}`,
                        res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST,
                        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                      )
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 1,
                          isAdjust: false,
                          isDisabledInput: true
                        },
                        {
                          shouldValidate: true
                        }
                      )
                    })
                    .catch(() => {
                      toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    })
                  break
                }

                // ? Other Cost
                case 'otherCostCondition.sellingExpense': {
                  await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
                    FISCAL_YEAR: getValues('header.fiscalYear').value,
                    PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                    ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                  })
                    .then(res => {
                      setValue(
                        `indirectCost.main.costCondition.${inputName}`,
                        res?.data?.ResultOnDb?.[0]?.SELLING_EXPENSE,
                        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                      )
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 1,
                          isAdjust: false,
                          isDisabledInput: true
                        },
                        {
                          shouldValidate: true
                        }
                      )
                    })
                    .catch(() => {
                      toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    })
                  break
                }
                case 'otherCostCondition.ga': {
                  await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
                    FISCAL_YEAR: getValues('header.fiscalYear').value,
                    PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                    ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                  })
                    .then(res => {
                      setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.GA, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      })
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 1,
                          isAdjust: false,
                          isDisabledInput: true
                        },
                        {
                          shouldValidate: true
                        }
                      )
                    })
                    .catch(() => {
                      toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    })
                  break
                }
                case 'otherCostCondition.margin': {
                  await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
                    FISCAL_YEAR: getValues('header.fiscalYear').value,
                    PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                    ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                  })
                    .then(res => {
                      setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.MARGIN, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      })
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 1,
                          isAdjust: false,
                          isDisabledInput: true
                        },
                        {
                          shouldValidate: true
                        }
                      )
                    })
                    .catch(() => {
                      toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    })
                  break
                }
                case 'otherCostCondition.cit': {
                  await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
                    FISCAL_YEAR: getValues('header.fiscalYear').value,
                    PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                    ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                  })
                    .then(res => {
                      setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.CIT, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      })
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 1,
                          isAdjust: false,
                          isDisabledInput: true
                        },
                        {
                          shouldValidate: true
                        }
                      )
                    })
                    .catch(() => {
                      toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    })
                  break
                }
                case 'otherCostCondition.vat': {
                  await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
                    FISCAL_YEAR: getValues('header.fiscalYear').value,
                    PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                    ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                  })
                    .then(res => {
                      setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.VAT, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true
                      })
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 1,
                          isAdjust: false,
                          isDisabledInput: true
                        },
                        {
                          shouldValidate: true
                        }
                      )
                    })
                    .catch(() => {
                      toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    })
                  break
                }
                // ? Special Cost
                case 'specialCostCondition.adjustPrice': {
                  await SpecialCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryId_MasterDataLatest({
                    FISCAL_YEAR: getValues('header.fiscalYear').value,
                    PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                    ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID')
                  })
                    .then(res => {
                      setValue(
                        `indirectCost.main.costCondition.${inputName}`,
                        res?.data?.ResultOnDb?.[0]?.ADJUST_PRICE,
                        { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                      )
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 1,
                          isAdjust: false,
                          isDisabledInput: true
                        },
                        {
                          shouldValidate: true
                        }
                      )
                    })
                    .catch(() => {
                      toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    })
                  break
                }

                default:
                  toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  break
              }
            }}
          >
            Master Data
          </Button>
        </Tooltip>
        <Tooltip title='Refresh to SCT Selection' arrow>
          <Button
            size='small'
            variant='tonal'
            color='info'
            startIcon={<i className='tabler-refresh' />}
            disabled={
              mode === 'view' ||
              watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') !== 2 ||
              4 === dataFromSctResourceOptionId ||
              sctCreateFromSettingId == 1
            }
            onClick={async () => {
              switch (inputName) {
                // ? Indirect Cost
                case 'indirectCostCondition.totalIndirectCost': {
                  const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 2 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO

                  if (!VERSION_NO) {
                    toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    return
                  } else {
                    await IndirectCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID'),
                      VERSION: VERSION_NO
                    })
                      .then(res => {
                        if (getValues(`adjust.indirectCostCondition.totalIndirectCost`))
                          setValue(
                            `indirectCost.main.costCondition.${inputName}`,
                            res?.data?.ResultOnDb?.[0]?.TOTAL_INDIRECT_COST,
                            { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                          )
                        setValue(
                          `adjust.${inputName}`,
                          {
                            dataFromSctResourceOptionId: 4,
                            isAdjust: false,
                            isDisabledInput: true
                          },
                          {
                            shouldValidate: true
                          }
                        )
                      })
                      .catch(() => {
                        toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                      })
                    break
                  }
                }

                // ? Other Cost
                case 'otherCostCondition.sellingExpense': {
                  const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO

                  if (!VERSION_NO) {
                    toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    return
                  } else {
                    await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID'),
                      VERSION: VERSION_NO
                    })
                      .then(res => {
                        setValue(
                          `indirectCost.main.costCondition.${inputName}`,
                          res?.data?.ResultOnDb?.[0]?.SELLING_EXPENSE,
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                        setValue(
                          `adjust.${inputName}`,
                          {
                            dataFromSctResourceOptionId: 4,
                            isAdjust: false,
                            isDisabledInput: true
                          },
                          {
                            shouldValidate: true
                          }
                        )
                      })
                      .catch(() => {
                        toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                      })
                    break
                  }
                }

                case 'otherCostCondition.ga': {
                  const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO

                  if (!VERSION_NO) {
                    toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    return
                  } else {
                    await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID'),
                      VERSION: VERSION_NO
                    })
                      .then(res => {
                        setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.GA, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true
                        })
                        setValue(
                          `adjust.${inputName}`,
                          {
                            dataFromSctResourceOptionId: 4,
                            isAdjust: false,
                            isDisabledInput: true
                          },
                          {
                            shouldValidate: true
                          }
                        )
                      })
                      .catch(() => {
                        toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                      })
                    break
                  }
                }
                case 'otherCostCondition.margin': {
                  const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO

                  if (!VERSION_NO) {
                    toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    return
                  } else {
                    await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID'),
                      VERSION: VERSION_NO
                    })
                      .then(res => {
                        setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.MARGIN, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true
                        })
                        setValue(
                          `adjust.${inputName}`,
                          {
                            dataFromSctResourceOptionId: 4,
                            isAdjust: false,
                            isDisabledInput: true
                          },
                          {
                            shouldValidate: true
                          }
                        )
                      })
                      .catch(() => {
                        toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                      })
                    break
                  }
                }
                case 'otherCostCondition.cit': {
                  const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO

                  if (!VERSION_NO) {
                    toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    return
                  } else {
                    await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID'),
                      VERSION: VERSION_NO
                    })
                      .then(res => {
                        setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.CIT, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true
                        })
                        setValue(
                          `adjust.${inputName}`,
                          {
                            dataFromSctResourceOptionId: 4,
                            isAdjust: false,
                            isDisabledInput: true
                          },
                          {
                            shouldValidate: true
                          }
                        )
                      })
                      .catch(() => {
                        toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                      })
                    break
                  }
                }
                case 'otherCostCondition.vat': {
                  const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 3 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO

                  if (!VERSION_NO) {
                    toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    return
                  } else {
                    await OtherCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID'),
                      VERSION: VERSION_NO
                    })
                      .then(res => {
                        setValue(`indirectCost.main.costCondition.${inputName}`, res?.data?.ResultOnDb?.[0]?.VAT, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true
                        })
                        setValue(
                          `adjust.${inputName}`,
                          {
                            dataFromSctResourceOptionId: 4,
                            isAdjust: false,
                            isDisabledInput: true
                          },
                          {
                            shouldValidate: true
                          }
                        )
                      })
                      .catch(() => {
                        toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                      })
                    break
                  }
                }
                // ? Special Cost
                case 'specialCostCondition.adjustPrice': {
                  const VERSION_NO = getValues('listSctMasterDataHistory')?.find(
                    item => item.SCT_MASTER_DATA_SETTING_ID == 4 && item.IS_FROM_SCT_COPY == 1
                  )?.VERSION_NO

                  if (!VERSION_NO) {
                    toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                    return
                  } else {
                    await SpecialCostConditionServices.getByProductMainIdAndFiscalYearAndItemCategoryIdAndRevisionNo({
                      FISCAL_YEAR: getValues('header.fiscalYear').value,
                      PRODUCT_MAIN_ID: getValues('product.productMain').PRODUCT_MAIN_ID,
                      ITEM_CATEGORY_ID: getValues('product.itemCategory.ITEM_CATEGORY_ID'),
                      VERSION: VERSION_NO
                    })
                      .then(res => {
                        setValue(
                          `indirectCost.main.costCondition.${inputName}`,
                          res?.data?.ResultOnDb?.[0]?.ADJUST_PRICE,
                          { shouldDirty: true, shouldTouch: true, shouldValidate: true }
                        )
                        setValue(
                          `adjust.${inputName}`,
                          {
                            dataFromSctResourceOptionId: 4,
                            isAdjust: false,
                            isDisabledInput: true
                          },
                          {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true
                          }
                        )
                      })
                      .catch(() => {
                        toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                      })
                    break
                  }
                }

                default:
                  toast.error(`Error: Can not find data. Please check your data.`, { autoClose: 10000 })
                  break
              }
            }}
          >
            SCT Selection
          </Button>
        </Tooltip>
        {!watch(`adjust.${inputName}.isDisabledInput`) && (
          <div className='flex flex-col'>
            <Controller
              name={`indirectCost.main.costCondition.${inputName}`}
              control={control}
              render={({ field: { onBlur, onChange, value, ...fieldProps } }) => (
                <CustomTextField
                  {...fieldProps}
                  label=''
                  size='small'
                  value={watch(`indirectCost.main.costCondition.${inputName}`)}
                  onChange={e => {
                    const inputValue = e.target.value

                    // กรณีผู้ใช้ลบค่าทั้งหมด
                    if (inputValue === '') {
                      setValue(`indirectCost.main.costCondition.${inputName}`, '', {
                        shouldValidate: true
                      })
                      setValue(
                        `adjust.${inputName}`,
                        {
                          dataFromSctResourceOptionId: 5,
                          isAdjust: true,
                          isDisabledInput: false
                        },
                        { shouldValidate: true }
                      )
                      return
                    }

                    // ตรวจสอบง่ายๆ ว่าสามารถแปลงเป็นตัวเลขได้หรือมีรูปแบบตัวเลข
                    // อนุญาต: ตัวเลข, จุด, เครื่องหมายลบ
                    const lastChar = inputValue.slice(-1)
                    const validChars = '0123456789.-'

                    // ตรวจสอบว่าอักขระสุดท้ายที่พิมพ์เข้ามาเป็นอักขระที่อนุญาตหรือไม่
                    if (!validChars.includes(lastChar) && inputValue.length > 1) {
                      return // ไม่อัปเดตถ้าไม่ใช่ตัวเลข, จุด, หรือเครื่องหมายลบ
                    }

                    // ตรวจสอบรูปแบบพื้นฐาน
                    // 1. เครื่องหมายลบต้องอยู่ตำแหน่งแรกสุดเท่านั้น
                    if (inputValue.includes('-') && inputValue.indexOf('-') !== 0) {
                      return
                    }

                    // 2. มีจุดได้เพียงจุดเดียว
                    if ((inputValue.match(/\./g) || []).length > 1) {
                      return
                    }

                    // อัปเดตค่า
                    setValue(`indirectCost.main.costCondition.${inputName}`, inputValue, {
                      shouldValidate: true
                    })

                    setValue(
                      `adjust.${inputName}`,
                      {
                        dataFromSctResourceOptionId: 5,
                        isAdjust: true,
                        isDisabledInput: false
                      },
                      { shouldValidate: true }
                    )
                  }}
                  onBlur={() => {
                    const currentValue = watch(`indirectCost.main.costCondition.${inputName}`)

                    // แปลงค่าเมื่อออกจากฟิลด์
                    if (currentValue && currentValue !== '-' && currentValue !== '.') {
                      // แปลงเป็นตัวเลขถ้าเป็นไปได้
                      const numValue = Number(currentValue)
                      if (!isNaN(numValue)) {
                        setValue(`indirectCost.main.costCondition.${inputName}`, numValue, {
                          shouldValidate: true
                        })
                      }
                    }

                    onBlur()
                    setValue(`adjust.${inputName}.isDisabledInput` as const, true, {
                      shouldValidate: true
                    })
                  }}
                  disabled={
                    watch('mode') === 'view' ||
                    watch('header.sctStatusProgress.SCT_STATUS_PROGRESS_ID') !== 2 ||
                    watch(`adjust.${inputName}.isDisabledInput`)
                  }
                  {...(get(errors, `indirectCost.main.costCondition.${inputName}`) && {
                    error: true,
                    helperText: get(errors, `indirectCost.main.costCondition.${inputName}`).message
                  })}
                  InputProps={{
                    sx: {
                      height: '30px',
                      '& input': {
                        padding: '8px 14px'
                      },
                      width: inputName === 'indirectCostCondition.totalIndirectCost' ? '300px' : '315px',
                      // 🔽 พื้นหลังตอน disabled
                      '&.Mui-disabled': {
                        backgroundColor: '#000' // เทาเข้ม
                      }
                    }
                  }}
                />
              )}
            />
            {isAdjust ? (
              <Typography
                variant='body2'
                sx={{
                  color: 'var(--mui-palette-warning-main)'
                }}
              >
                * Value was changed by PC.
              </Typography>
            ) : dataFromSctResourceOptionId != SCT_RESOURCE_OPTION_ID ? (
              <Typography
                variant='body2'
                sx={{
                  color: 'var(--mui-palette-warning-main)'
                }}
              >
                * Value was changed from Master Data Selection.
              </Typography>
            ) : null}
          </div>
        )}
        {watch(`adjust.${inputName}.isDisabledInput`) && (
          <div className='flex flex-col'>
            <CustomTextField
              label=''
              size='small'
              value={
                isNaN(Number(watch(`indirectCost.main.costCondition.${inputName}`)))
                  ? watch(`indirectCost.main.costCondition.${inputName}`)
                  : formatNumber(watch(`indirectCost.main.costCondition.${inputName}`))
              }
              disabled
              {...(get(errors, `indirectCost.main.costCondition.${inputName}`) && {
                error: true,
                helperText: get(errors, `indirectCost.main.costCondition.${inputName}`).message
              })}
              InputProps={{
                sx: {
                  height: '30px',
                  '& input': {
                    padding: '8px 14px'
                  },
                  width: inputName === 'indirectCostCondition.totalIndirectCost' ? '300px' : '315px'
                }
              }}
              disabledBg={
                inputName === 'otherCostCondition.vat' &&
                'color-mix(in srgb, var(--mui-palette-action-hover) 60%, black)'
              }
            />
            {isAdjust ? (
              <Typography
                variant='body2'
                sx={{
                  color: 'var(--mui-palette-warning-main)'
                }}
              >
                * Value was changed by PC.
              </Typography>
            ) : dataFromSctResourceOptionId != SCT_RESOURCE_OPTION_ID ? (
              <Typography
                variant='body2'
                sx={{
                  color: 'var(--mui-palette-warning-main)'
                }}
              >
                * Value was changed from Master Data Selection.
              </Typography>
            ) : null}
          </div>
        )}
        {unit}
      </div>
    </>
  )
}

export default SctDetailForAdjust

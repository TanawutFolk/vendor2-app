// React Imports
import { useEffect, useMemo, useState } from 'react'

// Material React Table Imports
import { useMaterialReactTable, MaterialReactTable } from 'material-react-table'
import type {
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  MRT_ColumnOrderState,
  MRT_SortingState,
  MRT_PaginationState,
  MRT_DensityState,
  MRT_ColumnPinningState,
  MRT_ColumnSizingState,
  MRT_ColumnDef,
  MRT_Row
} from 'material-react-table'

// MUI Imports
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// Icons Imports
import DeleteIcon from '@mui/icons-material/Delete'

// React Hook Form Imports
import { Controller, useFormContext, useFormState, useWatch } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

// React Select Imports
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import { fetchProductMainByLikeProductMainNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchBomByBomNameAndProductMainIdAndInuse,
  fetchBomByLikeBomNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchBom'
import {
  fetchFlowByLikeFlowNameAndInuse,
  fetchFlowByLikeFlowNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchFlowProcess'
import { fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'

// Components Imports
import CustomTextField from '@/components/mui/TextField'
import ProductTypeDndForSearch from './ProductTypeDndForSearch'
import { DialogContent, Grid } from '@mui/material'
import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

type User = {
  id: string
}

interface ParamApiSearchProductTypeI extends ParamApiSearchResultTableI {
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID?: number | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME?: string
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER?: string | ''
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION?: string | ''
  PRODUCT_PART_NUMBER?: string | ''
  // PRODUCT_MAIN_ID?: number | ''
  // PRODUCT_MAIN_NAME?: string
  // CUSTOMER_ORDER_FROM_ID?: number | ''
  // CUSTOMER_ORDER_FROM_NAME?: string
  // PRODUCT_SPECIFICATION_TYPE_ID?: number |''
  // PRODUCT_SPECIFICATION_TYPE_NAME?: string
  // PRODUCT_MODEL_NUMBER?: string
  // inuseForSearch?: string
}

const getUrlParamSearch = ({
  queryPageIndex,
  queryPageSize,
  querySortBy,
  queryColumnFilterFns,
  queryColumnFilters,
  // PRODUCT_SPECIFICATION_SETTING_ID = '',
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = '',
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = '',
  // PRODUCT_MAIN_ID = '',
  // PRODUCT_MAIN_NAME = '',
  // CUSTOMER_ORDER_FROM_ID = '',
  // CUSTOMER_ORDER_FROM_NAME = '',
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = '',
  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = '',
  // PRODUCT_SPECIFICATION_TYPE_NAME = '',
  // PRODUCT_MODEL_NUMBER = '',
  PRODUCT_PART_NUMBER = '',
  inuseForSearch = ''
  // INUSE = null
  // INUSE = ''
  // PRODUCT_CATEGORY_ID = ''
}: ParamApiSearchProductTypeI): any => {
  const params = {
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME.trim() || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER.trim() || '',
    PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION.trim() || '',
    // PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
    PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER || '',
    // PRODUCT_MAIN_NAME: PRODUCT_MAIN_NAME.trim(),
    // PRODUCT_SPECIFICATION_TYPE_NAME: PRODUCT_SPECIFICATION_TYPE_NAME.trim(),
    // CUSTOMER_ORDER_FROM_NAME: CUSTOMER_ORDER_FROM_NAME.trim(),
    // PRODUCT_MODEL_NUMBER: PRODUCT_MODEL_NUMBER.trim(),
    // CUSTOMER_ORDER_FROM_ID: CUSTOMER_ORDER_FROM_ID || '',
    INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
    Start: queryPageIndex,
    Limit: queryPageSize,
    Order: querySortBy.length > 0 ? JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE') : ''
  }

  return params
}

const ProductTypeDnd = ({ isEnableFetching, setIsEnableFetching, data, setData }: any) => {
  // State

  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()

  const [confirmModal, setConfirmModal] = useState(false)
  const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])

  const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
  const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getValues('searchResults.columnFilters'))
  const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))

  const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
    getValues('searchResults.columnFilterFns')
  )

  // Hooks
  // Hooks : react-hook-form

  const { isLoading, errors } = useFormState({ control })

  const onSubmit: SubmitHandler<FormData> = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('dataaaaaaaaaaaaaaa', data)
  }

  const handleCreate = () => {
    setConfirmModal(false)

    // console.log('DATA-PROFILE', data)
    // console.log('original', `productMain.${row.original.id}`)
  }

  useEffect(() => {
    for (let i = 0; i < data?.length; i++) console.log(data[i])
  }, [data])

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: getValues('searchResults.pageSize')
  })

  console.log(Object.keys(errors))

  const getProductType = (row: MRT_Row<FormData>): string => {
    const ItemCate = watch(`searchFilters.itemCategory.${row.original.id}`)?.ITEM_CATEGORY_ALPHABET ?? ''

    console.log('ItemCate', ItemCate)
    const Account = watch(`searchFilters.productMain.${row.original.id}`)?.ACCOUNT_DEPARTMENT_CODE ?? ''

    console.log('Account', Account)

    const selectedProduct =
      watch(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`) === '1'
        ? watch(`searchFilters.productMain.${row.original.id}`)?.PRODUCT_MAIN_ALPHABET
        : watch(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`) === '0'
          ? watch(`searchFilters.productSub.${row.original.id}`)?.PRODUCT_SUB_ALPHABET
          : ''

    console.log('selectedProductttttt', selectedProduct)

    const randomNumber = 'XXX'

    const MixedTypeCode =
      !ItemCate || !Account || !selectedProduct ? ' ' : ItemCate + Account + selectedProduct + randomNumber

    // console.log('ItemCate', ItemCate)
    // console.log('Account', Account)
    // console.log('selectedProduct', selectedProduct)
    return MixedTypeCode || ''
  }

  const openDeleteConfirmModal = (row: MRT_Row<FormData>) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setData((prevUsers: any) => prevUsers?.filter((user: User) => user.id !== row.original.id))

      // console.log('data', data)
    }
  }

  const columns = useMemo<MRT_ColumnDef<FormData>[]>(
    () => [
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
        header: 'Product Specification Document Setting Name',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {!!row.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME ? (
                row.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
              ) : (
                <Controller
                  // key={row.original.id}
                  name={`searchFilters.specificationSettingName.${row.original.id}`}
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { ...fieldProps } }) => (
                    <CustomTextField
                      // value={
                      //   watch('searchFilters.specificationSettingName')?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME ||
                      //   ''
                      // }
                      label='Product Specification Setting Name'
                      {...fieldProps}
                      fullWidth
                      autoComplete='off'
                      // onChange={value => {
                      //   onChange(value)
                      // }}
                      // {...(errors.specificationSetting?.row?.original?.id && {
                      //   error: true,
                      //   helperText: errors.specificationSetting?.row?.original?.id?.message
                      // })}
                      disabled

                      // {...(errors?.searchFilters?.specificationSetting?.[row.original.id] && {
                      //   error: true,
                      //   helperText: errors?.searchFilters?.specificationSetting?.[row.original.id].message
                      // })}
                    />
                  )}
                />
              )}
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
        header: 'Product Specification Document Setting Number',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {' '}
              {!!row.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER ? (
                row.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
              ) : (
                <Controller
                  // key={row.original.id}
                  name={`searchFilters.specificationSettingNumber.${row.original.id}`}
                  // name='searchFilters.specificationSettingNumber'
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { ...fieldProps } }) => (
                    <CustomTextField
                      label='Product Specification Setting Number'
                      {...fieldProps}
                      fullWidth
                      autoComplete='off'
                      // {...(errors.specificationSettingNumber && {
                      //   error: true,
                      //   helperText: errors.specificationSettingNumber.message
                      // })}
                      disabled

                      // {...(errors?.searchFilters?.specificationSettingNumber?.[row.original.id] && {
                      //   error: true,
                      //   helperText: errors?.searchFilters?.specificationSettingNumber?.[row.original.id]?.message
                      // })}
                    />
                  )}
                />
              )}
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
        header: 'Product Specification Document Setting Version Revision',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {!!row.original?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION ? (
                row.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
              ) : (
                <Controller
                  // key={row.original.id}
                  name={`searchFilters.specificationSettingVersionRevision.${row.original.id}`}
                  // name='searchFilters.specificationSettingVersionRevision'
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { ...fieldProps } }) => (
                    <CustomTextField
                      label='Product Specification Setting Version Revision'
                      {...fieldProps}
                      fullWidth
                      autoComplete='off'
                      disabled

                      // {...(errors.searchFilters.specificationSettingVersionRevision && {
                      //   error: true,
                      //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                      // })}
                      // {...(errors?.searchFilters?.specificationSettingVersionRevision?.[row.original.id] && {
                      //   error: true,
                      //   helperText: errors?.searchFilters?.specificationSettingVersionRevision?.[row.original.id].message
                      // })}
                    />
                  )}
                />
              )}
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_PART_NUMBER',
        header: 'Product Part Number',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {/* {JSON.stringify(watch('searchFilters.partNumber'))} */}
              {!!row.original?.PRODUCT_PART_NUMBER ? (
                row.original.PRODUCT_PART_NUMBER
              ) : (
                <Controller
                  key={row.original.id}
                  name='searchFilters.partNumber'
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <CustomTextField
                      label='Product Part Number'
                      {...fieldProps}
                      fullWidth
                      onChange={value => {
                        onChange(value)

                        // console.log('PartNum', value)
                      }}
                      // label='Customer Order From Alphabet'
                      // placeholder='Enter Customer Order From Alphabet'
                      autoComplete='off'
                      disabled

                      // {...(errors.searchFilters?.partNumber && {
                      //   error: true,
                      //   helperText: errors.searchFilters?.partNumber.message
                      // })}
                      // {...(errors?.searchFilters?.partNumber?.[row.original.id] && {
                      //   error: true,
                      //   helperText: errors?.searchFilters?.partNumber?.[row.original.id].message
                      // })}
                    />
                  )}
                />
              )}
            </>
          )
        }
      },
      {
        accessorKey: 'SUFFIX_FOR_PART_NUMBER',
        header: 'Suffix For Part Number',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          // const combinedValue = `${row.original.column1 || ''}${row.original.column2 || ''}`;
          return (
            <>
              {/* {getValues(`searchFilters.suffixForPartNumber.${row.original.id}`)}
              {JSON.stringify(watch(`searchFilters.suffixForPartNumber.${row.original.id}`))} */}
              {/* {row?.original.id} */}
              {/* {!!row.original?.SUFFIX_FOR_PART_NUMBER ? (
                row.original.SUFFIX_FOR_PART_NUMBER
              ) : ( */}
              <Controller
                key={row.original.id}
                name={`searchFilters.suffixForPartNumber.${row?.original.id}`}
                defaultValue={row.original?.SUFFIX_FOR_PART_NUMBER || ''}
                // value={combinedValue}
                control={control}
                // rules={{ required: true }}
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <CustomTextField
                    label='Suffix For Part Number'
                    value={value || ''}
                    {...fieldProps}
                    onChange={value => {
                      onChange(value)

                      // setValue(`searchFilters.suffixForPartNumber.${row.original.id}`, '')
                      // setValue(`searchFilters.productForRepair.${row.original.id}`, '')
                    }}
                    fullWidth
                    autoComplete='off'
                  />
                )}
              />
              {/* )} */}
            </>
          )
        }
      },
      {
        accessorKey: 'IS_PRODUCT_FOR_REPAIR',
        header: 'Product For Repair',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {/* {JSON.stringify(watch('searchFilters.productForRepair'))} */}
              <FormControl error={Boolean(errors.searchFilters?.productForRepair)}>
                <Controller
                  // key={row.original.id}
                  name={`searchFilters.productForRepair.${row.original.id}`}
                  defaultValue={row.original?.IS_PRODUCT_FOR_REPAIR}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value='1'
                            control={<Radio />}
                            label='Yes'

                            // disabled={
                            //   watch(`searchFilters.suffixForPartNumber.${row.original.id}`) === '' ||
                            //   watch(`searchFilters.suffixForPartNumber.${row.original.id}`) === null ||
                            //   watch(`searchFilters.suffixForPartNumber.${row.original.id}`) === undefined
                            // }
                          />
                          <FormControlLabel value='0' control={<Radio />} label='No' />
                          {/* <FormControlLabel name='empty' hidden value='null' control={<Radio />} label='' /> */}
                        </RadioGroup>
                      }
                      // disabled={
                      //   watch(`searchFilters.suffixForPartNumber.${row.original.id}`) === ' ' ||
                      //   watch(`searchFilters.suffixForPartNumber.${row.original.id}`) === null ||
                      //   watch(`searchFilters.suffixForPartNumber.${row.original.id}`) === undefined
                      // }
                      label=''

                      //value={value || ''}
                    />
                  )}
                />
                {errors.searchFilters?.productForRepair && (
                  <FormHelperText error>{errors.searchFilters?.productForRepair.message}</FormHelperText>
                )}
              </FormControl>
            </>
          )
        }
      },
      {
        accessorKey: 'FFT_PART_NUMBER',
        header: 'FFT Part Number',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          // const combinedValue = `${row.original.PRODUCT_PART_NUMBER || ''}(${row.original.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER || ''}/${row.original.IS_PRODUCT_FOR_REPAIR || ''} )`

          // const SuffixValue =
          //   `${watch(`searchFilters.suffixForPartNumber.${row.original.id}`)}` === 'undefined'
          //     ? ''
          //     : `${watch(`searchFilters.suffixForPartNumber.${row.original.id}`)}`
          const PartNumberValue = `${row.original.PRODUCT_PART_NUMBER}` ?? ''

          // `${row.original.PRODUCT_PART_NUMBER}` ?? ''
          // console.log('Mixed', PartNumberValue)
          const SuffixValue = `${watch(`searchFilters.suffixForPartNumber.${row.original.id}`)}`

          // // console.log('suffix', SuffixValue)
          // const tranProductForRepair =
          //   watch(`searchFilters.productForRepair.${row.original.id}`) === '1'
          //     ? PartNumberValue + '(' + SuffixValue + '/re' + ')'
          //     : watch(`searchFilters.productForRepair.${row.original.id}`) === '0'
          //       ? PartNumberValue
          //       : ''
          const tranProductForRepair = (() => {
            const productForRepairValue = watch(`searchFilters.productForRepair.${row.original.id}`)

            if (productForRepairValue === '1') {
              return SuffixValue ? `${PartNumberValue}(${SuffixValue}/re)` : `${PartNumberValue}(re)`
            } else if (productForRepairValue === '0') {
              return SuffixValue ? `${PartNumberValue}(${SuffixValue})` : PartNumberValue
            } else {
              return ''
            }
          })()
          // console.log('tranProductForRepair', tranProductForRepair)

          // console.log('SuffixValue', SuffixValue)

          return (
            <>
              {/* {JSON.stringify(tranProductForRepair)} */}
              <Controller
                key={row.original.id}
                name={`searchFilters.fftPartNumber.${row.original.id}`}
                control={control}
                // rules={{ required: true }}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    // key={watch('searchFilters.partNumber')?.PRODUCT_PART_NUMBER}
                    // defaultValue={combinedValue || ''}

                    {...fieldProps}
                    inputProps={{
                      className: 'text-center'
                    }}
                    value={tranProductForRepair || ''}
                    label='FFT Part Number'
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    disabled

                    // {...(errors?.searchFilters?.fftPartNumber?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters?.fftPartNumber?.[row.original.id].message
                    // })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        header: 'Product Category',
        accessorKey: 'PRODUCT_CATEGORY_NAME',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          useEffect(() => {
            const currentId = row.original.id
            const currentValue = watch(`searchFilters.productMain.${currentId}`)

            if (currentValue?.PRODUCT_MAIN_ID === undefined) {
              setValue(`searchFilters.productCategory.${currentId}`, '')
            } else {
              setValue(`searchFilters.productCategory.${currentId}`, currentValue.PRODUCT_CATEGORY_NAME)
            }
          }, [row.original.id, watch, setValue])

          return (
            <>
              {/* {!!row.original?.PRODUCT_CATEGORY_NAME ? (
                row.original.PRODUCT_CATEGORY_NAME
              ) : ( */}
              <Controller
                key={row.original.id}
                name={`searchFilters.productCategory.${row.original.id}`}
                // defaultValue={{
                //   PRODUCT_CATEGORY_ID: row.original.PRODUCT_CATEGORY_ID,
                //   PRODUCT_CATEGORY_NAME: row.original.PRODUCT_CATEGORY_NAME
                // }}
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    label='Product Category'
                    {...fieldProps}
                    inputProps={{
                      className: 'text-center'
                    }}
                    value={
                      watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID == undefined
                        ? ''
                        : watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_CATEGORY_NAME
                    }
                    fullWidth
                    disabled={true}
                    autoComplete='off'
                  />
                )}
              />
            </>
          )
        }
      },
      {
        header: 'Product Main',
        accessorKey: 'PRODUCT_MAIN_NAME',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {/* {!!row.original?.PRODUCT_MAIN_NAME ? (
                row.original.PRODUCT_MAIN_NAME
              ) : ( */}
              <Controller
                key={row.original.id}
                name={`searchFilters.productMain.${row.original.id}`}
                defaultValue={
                  row.original.PRODUCT_MAIN_ID
                    ? {
                        PRODUCT_MAIN_ID: row.original.PRODUCT_MAIN_ID,
                        PRODUCT_MAIN_NAME: row.original.PRODUCT_MAIN_NAME,
                        PRODUCT_MAIN_ALPHABET: row.original.PRODUCT_MAIN_ALPHABET,
                        ACCOUNT_DEPARTMENT_CODE: row.original.ACCOUNT_DEPARTMENT_CODE,
                        ACCOUNT_DEPARTMENT_CODE_ID: row.original.ACCOUNT_DEPARTMENT_CODE_ID,
                        PRODUCT_CATEGORY_NAME: row.original.PRODUCT_CATEGORY_NAME
                      }
                    : null
                }
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Product Main'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    classNamePrefix='select'
                    onChange={value => {
                      setValue(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`, '')
                      setValue(`searchFilters.accountDepartmentCode.${row.original.id}`, '')
                      setValue(`searchFilters.productCategory.${row.original.id}`, '')
                      setValue(`searchFilters.productItemCode.${row.original.id}.part1`, '')
                      setValue(`searchFilters.productItemCode.${row.original.id}.productType`, '')

                      onChange(value)
                      console.log('Main', watch(`searchFilters.productMain.${row.original.id}`)?.PRODUCT_CATEGORY_NAME)
                    }}
                    loadOptions={inputValue => {
                      return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                    }}
                    getOptionLabel={data => data.PRODUCT_MAIN_NAME}
                    getOptionValue={data => ({
                      PRODUCT_MAIN_ID: data.PRODUCT_MAIN_ID?.toString(),
                      ACCOUNT_DEPARTMENT_CODE_ID: data.ACCOUNT_DEPARTMENT_CODE_ID?.toString(),
                      PRODUCT_MAIN_NAME: data.PRODUCT_MAIN_NAME,
                      PRODUCT_MAIN_ALPHABET: data?.PRODUCT_MAIN_ALPHABET,
                      ACCOUNT_DEPARTMENT_CODE: data?.PRODUCT_MAIN_ALPHABET,
                      PRODUCT_CATEGORY_NAME: data?.PRODUCT_CATEGORY_NAME
                    })}
                    // {...(errors?.searchFilters?.productMain?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters.productMain?.[row.original.id].message
                    // })}
                    isDisabled={row.original.PRODUCT_MAIN_ID && row?.original.dataFromCopy}
                  />
                )}
              />
              {/* )} */}
            </>
          )
        }
      },
      {
        header: 'Product Sub',
        accessorKey: 'PRODUCT_SUB_NAME',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {/* {JSON.stringify(watch(`searchFilters.productSub.${row.original.id}`))} */}
              {/* {!!row.original?.PRODUCT_SUB_NAME ? (
                row.original.PRODUCT_SUB_NAME
              ) : ( */}
              <Controller
                key={row.original.id}
                name={`searchFilters.productSub.${row.original.id}`}
                // defaultValue={row.original.PRODUCT_SUB_ID}
                defaultValue={
                  row.original.PRODUCT_SUB_ID
                    ? {
                        PRODUCT_SUB_ID: row.original.PRODUCT_SUB_ID,
                        PRODUCT_SUB_NAME: row.original.PRODUCT_SUB_NAME,
                        PRODUCT_SUB_ALPHABET: row.original.PRODUCT_SUB_ALPHABET
                      }
                    : null
                }
                control={control}
                render={({ field: { ref, value, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Product Sub'
                    {...fieldProps}
                    value={value || null}
                    isClearable
                    cacheOptions
                    defaultOptions
                    classNamePrefix='select'
                    key={watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID}
                    onChange={value => {
                      onChange(value)
                      setValue(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`, '')
                    }}
                    loadOptions={inputValue => {
                      if (watch(`searchFilters.productMain.${row?.original?.id}`)) {
                        return fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                          inputValue,
                          1,
                          watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID
                        )
                      } else {
                        return fetchProductSubByLikeProductSubNameAndInuse(inputValue || '', 1)
                      }
                    }}
                    // loadOptions={inputValue => {
                    //   return fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(inputValue, 1 , watch('searchFilters.productMain')?.PRODUCT_MAIN_ID)
                    // }}
                    getOptionLabel={data => data.PRODUCT_SUB_NAME}
                    getOptionValue={data => ({
                      PRODUCT_SUB_ID: data.PRODUCT_SUB_ID?.toString(),
                      PRODUCT_SUB_NAME: data.PRODUCT_SUB_NAME,
                      PRODUCT_SUB_ALPHABET: data?.PRODUCT_SUB_ALPHABET
                    })}
                  />
                )}
              />
              {}
            </>
          )
        }
      },

      //  {/* {JSON.stringify(watch("boiGroupNo"))} */}

      {
        header: 'Product Item Category',
        accessorKey: 'ITEM_CATEGORY_SHORT_NAME',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {/* {!!row.original?.ITEM_CATEGORY_ALPHABET ? (
                row.original.ITEM_CATEGORY_ALPHABET
              ) : ( */}
              <Controller
                key={row.original.id}
                name={`searchFilters.itemCategory.${row.original.id}`}
                defaultValue={
                  row.original.ITEM_CATEGORY_ID
                    ? {
                        ITEM_CATEGORY_ID: row.original.ITEM_CATEGORY_ID,
                        ITEM_CATEGORY_NAME: row.original.ITEM_CATEGORY_NAME,
                        ITEM_CATEGORY_ALPHABET: row.original.ITEM_CATEGORY_ALPHABET,
                        ITEM_CATEGORY_SHORT_NAME: row.original.ITEM_CATEGORY_SHORT_NAME
                      }
                    : null
                }
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Product Item Category'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    classNamePrefix='select'
                    onChange={value => {
                      onChange(value)
                      setValue(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`, '')
                      console.log('itemCategoryyyyy', value)
                    }}
                    loadOptions={inputValue => {
                      return fetchItemCategoryCanBeSoldByLikeItemCategoryNameAndInuse({
                        itemCategoryName: inputValue,
                        inuse: 1
                      })

                      // return fetchItemCategoryByItemCategoryNameAndInuse(inputValue, 1)
                    }}
                    getOptionLabel={data => data.ITEM_CATEGORY_NAME}
                    getOptionValue={data => ({
                      ITEM_CATEGORY_ID: data.ITEM_CATEGORY_ID?.toString(),
                      ITEM_CATEGORY_ALPHABET: data?.ITEM_CATEGORY_ALPHABET,
                      ITEM_CATEGORY_NAME: data?.ITEM_CATEGORY_NAME,
                      ITEM_CATEGORY_SHORT_NAME: data?.ITEM_CATEGORY_SHORT_NAME
                    })}

                    // {...(errors?.searchFilters?.productMain?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters.productMain?.[row.original.id].message
                    // })}
                    // isDisabled={watch(`searchFilters.productMain.${row.original.id}`) !== ''}
                  />
                )}
              />
              {/* )} */}
            </>
          )
        }
      },

      // {
      //   header: 'Product Item Category',
      //   accessorKey: 'ITEM_CATEGORY_ALPHABET',
      //   size: 200,
      //   Cell: ({ renderedCellValue, row, cell }) => {
      //     return (
      //       <>
      //         {/* {JSON.stringify(watch(`searchFilters.itemCategory`))} */}
      //         {!!row.original?.ITEM_CATEGORY_ALPHABET ? (
      //           row.original.ITEM_CATEGORY_ALPHABET
      //         ) : (
      //           <Controller
      //             key={row.original.id}
      //             name={`searchFilters.itemCategory.${row.original.id}`}
      //             control={control}
      //             render={({ field: { ref, ...fieldProps } }) => (
      //               <AsyncSelectCustom
      //                 label='Department Code'
      //                 {...fieldProps}
      //                 isClearable
      //                 cacheOptions
      //                 defaultOptions
      //                 classNamePrefix='select'
      //                 loadOptions={inputValue => {
      //                   return fetchItemCategoryByItemCategoryNameAndInuse(inputValue, '1')
      //                 }}
      //                 getOptionLabel={data => data.ITEM_CATEGORY_ALPHABET}
      //                 getOptionValue={data => ({
      //                   ITEM_CATEGORY_ID: data.ITEM_CATEGORY_ID?.toString(),
      //                   ITEM_CATEGORY_ALPHABET: data?.ITEM_CATEGORY_ALPHABET,
      //                   ITEM_CATEGORY_NAME: data?.ITEM_CATEGORY_NAME
      //                 })}
      //                 // {...(errors?.searchFilters?.accountDepartment?.[row.original.id] && {
      //                 //   error: true,
      //                 //   helperText: errors?.searchFilters.accountDepartment?.[row.original.id].message
      //                 // })}
      //                 isDisabled={true}
      //               />
      //             )}
      //           />
      //         )}
      //       </>
      //     )
      //   }
      // },
      {
        header: 'Department Code (Account)',
        accessorKey: 'ACCOUNT_DEPARTMENT_CODE',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          // const Account = watch(`searchFilters.productMain.${row?.original?.id}`)?.ACCOUNT_DEPARTMENT_CODE
          // const departmentCode = row.original?.ACCOUNT_DEPARTMENT_CODE || Account || ''
          // const departmentCode = watch(`searchFilters.productMain.${row?.original?.id}`) === '' ? '' : Account || ''
          return (
            <>
              <Controller
                // defaultValue={row?.original?.ACCOUNT_DEPARTMENT_CODE}
                control={control}
                name={`searchFilters.accountDepartmentCode.${row.original.id}`}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    inputProps={{
                      className: 'text-center'
                    }}
                    label='Department Code'
                    value={
                      watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID == undefined
                        ? ''
                        : watch(`searchFilters.productMain.${row?.original?.id}`)?.ACCOUNT_DEPARTMENT_CODE
                    }
                    fullWidth
                    disabled={true}
                    autoComplete='off'
                  />
                )}
              />
              {/* <Controller
                //key={row.original.id}
                key={watch(`searchFilters.productMain.${row.original.id}`)?.PRODUCT_MAIN_ID}
                //key={`searchFilters.productMain.${row.original.id}`}
                defaultValue={row?.original?.ACCOUNT_DEPARTMENT_CODE}
                name={`searchFilters.accountDepartmentCode.${row.original.id}`}
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    label='Department Code'
                    //value={watch(`searchFilters.productMain.${row?.original?.id}`)?.ACCOUNT_DEPARTMENT_CODE}
                    value={
                      watch(`searchFilters.productMain.${row.original.id}`) == undefined
                        ? 'NO DATA'
                        : watch(`searchFilters.productMain.${row.original.id}`).ACCOUNT_DEPARTMENT_CODE
                    }
                    //value={watch(`searchFilters.productMain.${row?.original?.id}`)?.ACCOUNT_DEPARTMENT_CODE}
                    // onChange={value => {
                    //   onChange(value)
                    //   // console.log('ProductTTTT', value)
                    // }}
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    disabled
                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                  />
                )}
              /> */}
            </>
          )
        }
      },
      {
        accessorKey: 'IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
        header: 'Selected Product Level for Gen Product Type Code',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {/* {JSON.stringify(watch('searchFilters.selectedProductLevelForGenProductTypeCode'))}
              {getValues(`searchFilters.productTypeCode.${row.original.id}`)} */}
              <FormControl error={Boolean(errors.searchFilters?.selectedProductLevelForGenProductTypeCode)}>
                <Controller
                  name={`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`}
                  defaultValue={row.original?.IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE}
                  control={control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <FormControlLabel
                      onChange={value => {
                        onChange(value)
                        setValue(`searchFilters.productItemCode.${row.original.id}.part1`, '')
                        setValue(`searchFilters.productItemCode.${row.original.id}.productType`, '')
                        console.log('productItemCode', value)
                      }}
                      control={
                        <RadioGroup {...fieldProps} row>
                          <FormControlLabel value='1' control={<Radio />} label='Product Main' />
                          <FormControlLabel
                            value='0'
                            control={<Radio />}
                            label='Product Sub'
                            disabled={
                              watch(`searchFilters.productSub.${row.original.id}`) === ' ' ||
                              watch(`searchFilters.productSub.${row.original.id}`) === null ||
                              watch(`searchFilters.productSub.${row.original.id}`) === undefined
                            }
                          />
                        </RadioGroup>
                      }
                      label=''

                      //value={value || ''}
                    />
                  )}
                />
                {errors.searchFilters?.selectedProductLevelForGenProductTypeCode && (
                  <FormHelperText error>
                    {errors.searchFilters?.selectedProductLevelForGenProductTypeCode.message}
                  </FormHelperText>
                )}
              </FormControl>
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_TYPE_CODE',
        header: 'Product Type Code',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          const MixedTypeCode = getProductType(row)

          // const ItemCate = `${row.original.ITEM_CATEGORY_ALPHABET}` ?? ''
          // console.log('ItemCate', ItemCate)
          // const Account = `${row.original.ACCOUNT_DEPARTMENT_CODE}` ?? ''
          // console.log('Account', Account)
          // const selectedProduct =
          //   watch(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`) === '1'
          //     ? watch(`searchFilters.productMain.${row.original.id}`).PRODUCT_MAIN_ALPHABET
          //     : watch(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`) === '0'
          //       ? watch(`searchFilters.productSub.${row.original.id}`)?.PRODUCT_SUB_ALPHABET
          //       : ''
          // console.log('selectedProduct', selectedProduct)

          // const randomNumber = 'XXX'

          // const MixedTypeCode =
          //   ItemCate === ' ' || Account === '' || selectedProduct === ''
          //     ? ' '
          //     : ItemCate + Account + selectedProduct + randomNumber
          return (
            <>
              {/* {JSON.stringify(MixedTypeCode)} */}
              <Controller
                key={row.original.id}
                name={`searchFilters.productTypeCode.${row.original.id}`}
                control={control}
                // rules={{ required: true }}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    label='Product Type Code'
                    value={MixedTypeCode || ''}
                    // onChange={value => {
                    //   onChange(value)

                    //   console.log('ProductTTTT', value)
                    // }}
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    disabled
                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                    {...(errors?.searchFilters?.productTypeName?.[row.original.id] && {
                      error: true,
                      helperText: errors?.searchFilters?.productTypeName?.[row.original.id].message
                    })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PC_NAME',
        header: 'PC Name',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.pcName.${row.original.id}`}
                control={control}
                // rules={{ required: true }}
                defaultValue={row.original?.PC_NAME || ''}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    label='Pc Name'
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'

                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                    // {...(errors?.searchFilters?.pcName?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters?.pcName?.[row.original.id].message
                    // })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_TYPE_NAME',
        header: 'Product Type Name',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          const ItemCateForTypeName =
            watch(`searchFilters.itemCategory.${row.original.id}`)?.ITEM_CATEGORY_SHORT_NAME ?? null

          console.log('ItemCate', ItemCateForTypeName)
          const pcName = watch(`searchFilters.pcName.${row.original.id}`) ?? ''

          // console.log('ItemCate', pcName)
          const MixedTypeName = ItemCateForTypeName === null || pcName === '' ? '' : ItemCateForTypeName + '_' + pcName

          // const productTypeName = ItemCateForTypeName === ' ' || pcName === '' ? ' ' : MixedTypeName
          console.log('MixedTypeName', MixedTypeName)
          console.log('ItemCateForTypeName', ItemCateForTypeName)
          console.log('pcNameForTypeName', pcName)

          return (
            <>
              {/* {JSON.stringify(watch(`searchFilters.itemCategory.${row.original.id}`)?.ITEM_CATEGORY_ALPHABET)} */}
              <Controller
                key={row.original.id}
                // name='searchFilters.productType'
                name={`searchFilters.productType.${row.original.id}`}
                control={control}
                // rules={{ required: true }}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    label='Product Type Name'
                    value={MixedTypeName || ''}
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    disabled

                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                    // {...(errors?.searchFilters?.productTypeName?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters?.productTypeName?.[row.original.id].message
                    // })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        header: 'Flow Code',
        accessorKey: 'FLOW_CODE',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          // const defaultValue = row.original.FLOW_CODE
          //   ? {
          //       FLOW_ID: row.original.FLOW_ID,
          //       FLOW_NAME: row.original.FLOW_NAME,
          //       FLOW_CODE: row.original.FLOW_CODE
          //     }
          //   : null
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.flow.${row.original.id}`}
                // defaultValue={{
                //   FLOW_ID: row.original.FLOW_ID,
                //   FLOW_NAME: row.original.FLOW_NAME,
                //   FLOW_CODE: row.original.FLOW_CODE
                // }}
                defaultValue={
                  row.original.FLOW_ID
                    ? {
                        FLOW_ID: row.original.FLOW_ID,
                        FLOW_NAME: row.original.FLOW_NAME,
                        FLOW_CODE: row.original.FLOW_CODE
                      }
                    : null
                }
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Flow Code'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    classNamePrefix='select'
                    key={watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID}
                    onChange={value => {
                      onChange(value)
                      // console.log('Main', value)
                    }}
                    loadOptions={inputValue => {
                      if (watch(`searchFilters.productMain.${row?.original?.id}`)) {
                        return fetchFlowByLikeFlowNameAndProductMainIdAndInuse(
                          inputValue,
                          1,
                          watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID
                        )
                      } else {
                        return fetchFlowByLikeFlowNameAndInuse(inputValue || '', 1)
                      }
                    }}
                    getOptionLabel={data => data.FLOW_CODE}
                    getOptionValue={data => ({
                      FLOW_ID: data.FLOW_ID?.toString(),
                      FLOW_NAME: data?.FLOW_NAME,
                      FLOW_CODE: data?.FLOW_CODE
                    })}

                    // {...(errors?.searchFilters?.flowCode?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters.flowCode?.[row.original.id].message
                    // })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'FLOW_NAME',
        header: 'Flow Name',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                // key={row.original.id}
                name={`searchFilters.flowName.${row.original.id}`}
                control={control}
                // rules={{ required: true }}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    value={watch(`searchFilters.flow.${row?.original?.id}`)?.FLOW_NAME || ''}
                    label='Flow Name'
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    disabled

                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                    // {...(errors?.searchFilters?.flowName?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters?.flowName?.[row.original.id].message
                    // })}
                  />
                )}
                disabled
              />
            </>
          )
        }
      },
      {
        header: 'Bom Code',
        accessorKey: 'BOM_CODE',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                defaultValue={
                  row.original.BOM_ID
                    ? {
                        BOM_ID: row.original.BOM_ID,
                        FLOW_ID: row.original.FLOW_ID,
                        BOM_NAME: row.original.BOM_NAME,
                        BOM_CODE: row.original.BOM_CODE
                      }
                    : null
                }
                name={`searchFilters.bom.${row.original.id}`}
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Bom Code'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    key={watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID}
                    classNamePrefix='select'
                    onChange={value => {
                      onChange(value)
                      setValue(`searchFilters.flow.${row.original.id}`, value?.FLOW_ID)
                      // console.log('FLOW_IDFromBom', value?.FLOW_ID)
                    }}
                    loadOptions={inputValue => {
                      if (watch(`searchFilters.productMain.${row?.original?.id}`)) {
                        return fetchBomByBomNameAndProductMainIdAndInuse(
                          inputValue,
                          1,
                          watch(`searchFilters.productMain.${row?.original?.id}`)?.PRODUCT_MAIN_ID
                        )
                      } else {
                        return fetchBomByLikeBomNameAndInuse(inputValue || '', 1)
                      }
                    }}
                    getOptionLabel={data => data.BOM_CODE}
                    getOptionValue={data => ({
                      BOM_ID: data.BOM_ID?.toString(),
                      BOM_NAME: data?.BOM_NAME,
                      FLOW_ID: data.FLOW_ID?.toString(),
                      BOM_CODE: data?.BOM_CODE
                    })}

                    // {...(errors?.searchFilters?.bomCode?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters.bomCode?.[row.original.id].message
                    // })}
                  />
                )}
              />
            </>
          )
        }
      },
      {
        accessorKey: 'BOM_NAME',
        header: 'Bom Name',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                // key={row.original.id}
                name={`searchFilters.bomName.${row.original.id}`}
                control={control}
                // rules={{ required: true }}
                render={({ field: { value, ...fieldProps } }) => (
                  <CustomTextField
                    value={watch(`searchFilters.bom.${row?.original?.id}`)?.BOM_NAME || ''}
                    label='Bom Name'
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'
                    disabled

                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                    // {...(errors?.searchFilters?.bomName?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters?.bomName?.[row.original.id].message
                    // })}
                  />
                )}
                disabled
              />
            </>
          )
        }
      },

      {
        accessorKey: 'PRODUCT_ITEM_CODE',
        header: 'Product Item Code (16 digits)',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          const productTypeCode = getProductType(row)

          // const productItemCategoryValue = watch(`searchFilters.productItemCategoryCode.${row.original.id}`)
          const currentValuePart1 = useWatch({
            control,
            name: `searchFilters.productItemCode.${row.original.id}.part1`
          })

          const productItemCodeValue =
            productTypeCode !== '' && currentValuePart1 !== undefined ? productTypeCode + currentValuePart1 : ''

          return (
            <>
              {/* {JSON.stringify(watch(`searchFilters.productItemCode.${row.original.id}.part1`))} */}
              {/* {JSON.stringify(MixedTypeCode)} */}
              <label style={{ marginBottom: '8px', fontSize: '13px' }}>Product Item Code</label>

              {!!productTypeCode ? (
                <CustomTextField
                  // label='Product Type Code'
                  value={productItemCodeValue || ''}
                  fullWidth
                  autoComplete='off'
                  inputProps={{ maxLength: 8 }}
                  style={{ flexBasis: '80%', marginBottom: '10px' }}
                  disabled
                />
              ) : (
                <Controller
                  defaultValue={row.original?.PRODUCT_ITEM_CODE.part1}
                  key={`${row.original.id}-productType`}
                  name={`searchFilters.productItemCode.${row.original.id}.productType`}
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { onChange, ...fieldPropsType } }) => (
                    <CustomTextField
                      {...fieldPropsType}
                      // label='Product Type Code'
                      fullWidth
                      autoComplete='off'
                      inputProps={{ maxLength: 8 }}
                      style={{ flexBasis: '80%' }}
                    />
                  )}
                />
              )}
              <Controller
                key={`${row.original.id}-part1`}
                name={`searchFilters.productItemCode.${row.original.id}.part1`}
                control={control}
                // rules={{ required: true }}
                render={({ field: { ...fieldPropsPart1 } }) => (
                  <CustomTextField
                    {...fieldPropsPart1}
                    // label='Product Item Code'
                    placeholder='Enter 8 Digits...'
                    value={currentValuePart1 || ''}
                    fullWidth
                    autoComplete='off'
                    inputProps={{ maxLength: 8 }}
                    style={{ flexBasis: '20%' }}
                    disabled={
                      watch(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`) === ' ' ||
                      watch(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`) === null ||
                      watch(`searchFilters.selectedProductLevelForGenProductTypeCode.${row.original.id}`) === undefined
                    }
                  />
                )}
              />
              {/* </div> */}
            </>
          )
        }
      },
      {
        accessorKey: 'PRODUCT_ITEM_NAME',
        header: 'Product Item Name',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                name={`searchFilters.productItemName.${row.original.id}`}
                defaultValue={row.original?.PRODUCT_ITEM_NAME}
                control={control}
                // rules={{ required: true }}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    label='Product Item Name'
                    {...fieldProps}
                    fullWidth
                    autoComplete='off'

                    // {...(errors.searchFilters.specificationSettingVersionRevision && {
                    //   error: true,
                    //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
                    // })}
                    // {...(errors?.searchFilters?.pcName?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters?.pcName?.[row.original.id].message
                    // })}
                  />
                )}
              />
            </>
          )
        }
      },

      {
        header: 'Customer Invoice To',
        accessorKey: 'CUSTOMER_INVOICE_TO_NAME',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <Controller
                key={row.original.id}
                defaultValue={
                  row.original.CUSTOMER_INVOICE_TO_ID
                    ? {
                        CUSTOMER_INVOICE_TO_ID: row.original.CUSTOMER_INVOICE_TO_ID,
                        CUSTOMER_INVOICE_TO_NAME: row.original.CUSTOMER_INVOICE_TO_NAME,
                        CUSTOMER_INVOICE_TO_ALPHABET: row.original.CUSTOMER_INVOICE_TO_ALPHABET
                      }
                    : null
                }
                name={`searchFilters.customerInvoiceTo.${row.original.id}`}
                control={control}
                render={({ field: { ref, onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    label='Customer Invoice To'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    classNamePrefix='select'
                    onChange={value => {
                      onChange(value)

                      // console.log('Main', value)
                    }}
                    loadOptions={inputValue => {
                      return fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse(inputValue, 1)
                    }}
                    getOptionLabel={data => data.CUSTOMER_INVOICE_TO_NAME}
                    getOptionValue={(data: any) => ({
                      CUSTOMER_INVOICE_TO_ID: data.CUSTOMER_INVOICE_TO_ID?.toString(),
                      CUSTOMER_INVOICE_TO_NAME: data?.CUSTOMER_INVOICE_TO_NAME,
                      CUSTOMER_INVOICE_TO_ALPHABET: data?.CUSTOMER_INVOICE_TO_ALPHABET
                    })}

                    // {...(errors?.searchFilters?.bomCode?.[row.original.id] && {
                    //   error: true,
                    //   helperText: errors?.searchFilters.bomCode?.[row.original.id].message
                    // })}
                  />
                )}
              />
            </>
          )
        }
      },

      {
        accessorKey: 'IS_BOI',
        header: 'BOI',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              <FormControl error={Boolean(errors.searchFilters?.isBoi)}>
                <Controller
                  key={row.original.id}
                  name={`searchFilters.isBoi.${row.original.id}`}
                  // defaultValue={
                  //   watch(`searchFilters.boiProject.${row?.original?.id}`) === ''
                  //     ? '0'
                  //     : row.original?.IS_BOI !== undefined
                  //       ? row.original.IS_BOI
                  //       : '0'
                  // }
                  //       : '0'}
                  defaultValue={row.original?.IS_BOI}
                  // defaultValue={
                  //   row.original?.BOI_PROJECT_NAME === ' '
                  //     ? '0'
                  //     : row.original?.IS_BOI !== undefined
                  //       ? row.original.IS_BOI
                  //       : '0'
                  // }
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <RadioGroup {...field} row>
                          <FormControlLabel
                            value='1'
                            control={<Radio />}
                            label='BOI'
                            disabled={row.original.BOI_PROJECT_NAME === ' ' || row.original.BOI_PROJECT_NAME === null}
                          />
                          <FormControlLabel value='0' control={<Radio />} label='Non-BOI' />
                        </RadioGroup>
                      }
                      label=''
                    />
                  )}
                />
                {/* {errors.isBoi && <FormHelperText error>{errors.isBoi.message}</FormHelperText>} */}
              </FormControl>
            </>
          )
        }
      },
      {
        accessorKey: 'BOI_PROJECT_NAME',
        header: 'Boi Project',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {!!row.original?.BOI_PROJECT_NAME ? (
                row.original.BOI_PROJECT_NAME
              ) : (
                <Controller
                  key={row.original.id}
                  name={`searchFilters.boiProject.${row?.original.id}`}
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <CustomTextField
                      label='Boi Project'
                      {...fieldProps}
                      fullWidth
                      onChange={value => {
                        onChange(value)

                        // setValue('process', null)
                        // console.log('PartNum', value)
                      }}
                      // label='Customer Order From Alphabet'
                      // placeholder='Enter Customer Order From Alphabet'
                      autoComplete='off'
                      // {...(errors.searchFilters?.partNumber && {
                      //   error: true,
                      //   helperText: errors.searchFilters?.partNumber.message
                      // })}
                      disabled

                      // {...(errors?.searchFilters?.boiProject?.[row.original.id] && {
                      //   error: true,
                      //   helperText: errors?.searchFilters?.boiProject?.[row.original.id].message
                      // })}
                    />
                  )}
                />
              )}
            </>
          )
        }
      },
      {
        accessorKey: 'BOI_PROJECT_CODE',
        header: 'Boi Project Code',
        size: 200,
        Cell: ({ renderedCellValue, row, cell }) => {
          return (
            <>
              {!!row.original?.BOI_PROJECT_CODE ? (
                row.original.BOI_PROJECT_CODE
              ) : (
                <Controller
                  key={row.original.id}
                  name={`searchFilters.boiProjectCode.${row?.original.id}`}
                  control={control}
                  // rules={{ required: true }}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <CustomTextField
                      label='Boi Project Code'
                      {...fieldProps}
                      fullWidth
                      onChange={value => {
                        onChange(value)

                        // setValue('process', null)
                        // console.log('PartNum', value)
                      }}
                      // label='Customer Order From Alphabet'
                      // placeholder='Enter Customer Order From Alphabet'
                      autoComplete='off'
                      // {...(errors.searchFilters?.partNumber && {
                      //   error: true,
                      //   helperText: errors.searchFilters?.partNumber.message
                      // })}
                      disabled

                      // {...(errors?.searchFilters?.boiProjectCode?.[row.original.id] && {
                      //   error: true,
                      //   helperText: errors?.searchFilters?.boiProjectCode?.[row.original.id].message
                      // })}
                    />
                  )}
                />
              )}
            </>
          )
        }
      }

      // {
      //   accessorKey: 'CUSTOMER_ORDER_FROM_NAME',
      //   header: 'Customer Order From',
      //   size: 80,
      //   Cell: ({ renderedCellValue, row, cell }) => {
      //     return (
      //       <>
      //         <Controller
      //           key={row?.original.id}
      //           name={`searchFilters.customerOrderFrom.${row?.original.id}`}
      //           control={control}
      //           render={({ field: { onChange, ...fieldProps } }) => (
      //             <AsyncSelectCustom
      //               label='Customer Order From'
      //               {...fieldProps}
      //               onChange={value => {
      //                 onChange(value)
      //                 console.log('orderFrom', value)
      //               }}
      //               isClearable
      //               cacheOptions
      //               defaultOptions
      //               loadOptions={inputValue => {
      //                 return fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse(inputValue, '1')
      //               }}
      //               getOptionLabel={data => data?.CUSTOMER_ORDER_FROM_NAME}
      //               getOptionValue={data => data?.CUSTOMER_ORDER_FROM_ID?.toString()}
      //               classNamePrefix='select'
      //               placeholder='Select...'
      //               // {...(errors.searchFilters.customerOrderFrom && { error: true, helperText: errors.searchFilters.customerOrderFrom.message })}
      //               {...(errors?.searchFilters?.customerOrderFrom?.[row.original.id] && {
      //                 error: true,
      //                 helperText: errors?.searchFilters?.customerOrderFrom?.[row.original.id].message
      //               })}
      //             />
      //           )}
      //         />
      //       </>
      //     )
      //   }
      // }
    ],
    [errors]
  )

  const table = useMaterialReactTable({
    autoResetPageIndex: false,
    columns,
    data: data || [],
    rowCount: data?.data?.TotalCountOnDb ?? 0,
    enableRowActions: true,
    enableEditing: false,
    enableRowOrdering: false,
    enableSorting: false,
    enablePagination: false,
    enableRowNumbers: true,
    enableColumnOrdering: true,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnFilterFnsChange: setColumnFilterFns,
    onColumnOrderChange: setColumnOrder,
    enableStickyHeader: true,
    enableStickyFooter: true,
    onSortingChange: setSorting,
    state: {
      //   columnFilters,
      //   isLoading,
      pagination

      //   // showAlertBanner: isError,
      //   // showProgressBars: isRefetching,
      //   sorting,
      //   density,
      //   // columnVisibility,
      //   columnPinning,
      //   columnOrder,
      //   columnSizing,
      //   columnFilterFns
    },
    defaultColumn: {
      size: 300 //make columns wider by default
    },

    // muiRowDragHandleProps: ({ table }) => ({
    //   onDragEnd: () => {
    //     const { draggingRow, hoveredRow } = table.getState()
    //     if (hoveredRow && draggingRow) {
    //       data.splice((hoveredRow as MRT_Row<FormData>).index, 0, data.splice(draggingRow.index, 1)[0])
    //       setData([...data])
    //     }
    //   }
    // }),
    renderBottomToolbar: ({ table }) => (
      <>
        <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
          <Typography>Total {data?.length} entries</Typography>

          {/* <div className='flex justify-end gap-2'>
            <Button
              disabled={!!columnFilters?.length}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this profile data?')) {
                  setData([])
                  //unregister(`searchFilters.productMain`)
                  //unregister(`searchFilters.productMainOwner`)
                  //unregister(`searchFilters.machineSystemInProcess`)
                  //unregister(`checkboxGroupSelected`)
                }
              }}
              color='secondary'
              variant='tonal'
            >
              Clear all
            </Button>
          </div> */}
        </div>
      </>
    ),
    muiTableContainerProps: {
      sx: {
        minHeight: '600px',
        maxHeight: '600px'
      }
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        textTransform: 'uppercase',

        backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.25)'
      }
    },
    muiTableBodyProps: {
      sx: {
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.055)'
        }
      }
    },

    muiTableBodyCellProps: {
      sx: theme => ({
        backgroundColor: 'var(--mui-palette-background-default)',
        fontSize: 15
      })
    },

    muiTopToolbarProps: {
      sx: {
        backgroundColor: 'var(--mui-palette-background-default)'
      }
    },

    renderRowActions: ({ row, table, cell }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <>
          {row.original?.dataFromCopy && (
            <Tooltip title='Delete'>
              <IconButton color='error' onClick={() => openDeleteConfirmModal(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      </Box>
    )
  })

  return (
    <>
      {/* {JSON.stringify(watch(data))} */}

      {/* {data?.original?.dataFromCopy} */}

      <DialogContent>
        <Grid alignItems='center'>
          {/* <Grid item xs={12}> */}
          <ProductTypeDndForSearch
            // isEnableFetching={isEnableFetching}
            setIsEnableFetching={setIsEnableFetching}
            // copyRow={copyRow || []}
            // setCopyRow={setCopyRow}
            // data={dataRow || []}
            // setData={setData}
          />
        </Grid>
      </DialogContent>
      <MaterialReactTable table={table} />
      {/* <DevTool control={control} /> */}
    </>
  )
}

export default ProductTypeDnd

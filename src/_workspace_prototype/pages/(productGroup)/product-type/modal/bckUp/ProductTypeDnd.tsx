//
// import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

// import {
//   MaterialReactTable,

//   // createRow,
//   type MRT_ColumnDef,
//   MRT_ColumnFilterFnsState,
//   MRT_ColumnFiltersState,
//   type MRT_Row,
//   useMaterialReactTable,
//   MRT_ColumnOrderState,
//   MRT_SortingState,
//   MRT_PaginationState,
//   MRT_DensityState,
//   MRT_ColumnPinningState,
//   MRT_ColumnSizingState
// } from 'material-react-table'
// import {
//   Badge,
//   Box,
//   Button,
//   FormControl,
//   FormControlLabel,
//   FormHelperText,
//   Grid,
//   IconButton,
//   Radio,
//   RadioGroup,
//   Tooltip,
//   Typography
// } from '@mui/material'

// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'

// import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
// import { Controller, useForm, useFormContext, useFormState } from 'react-hook-form'

// //

// // import type { ProductMainInterface } from '@/types/ProductMain'
// // import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'

// import {
//   maxLengthFieldMessage,
//   minLengthFieldMessage,
//   requiredFieldMessage,
//   typeFieldMessage,
//   uppercaseFieldMessage
// } from '@/libs/valibot/error-message/errorMessage'

// import RefreshIcon from '@mui/icons-material/Refresh'
// import SwapVertIcon from '@mui/icons-material/SwapVert'
// import FilterListIcon from '@mui/icons-material/FilterList'
// import type { Input, value } from 'valibot'
// import {
//   object,
//   string,
//   nullable,
//   number,
//   unknown,
//   array,
//   boolean,
//   picklist,
//   optional,
//   record,
//   minLength,
//   maxLength,
//   nullish,
//   pipe,
//   nonEmpty,
//   regex
// } from 'valibot'

// import { valibotResolver } from '@hookform/resolvers/valibot'
// import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
// import AsyncCreatableSelectCustom from '@/components/react-select/AsyncCreatableSelectCustom'
// import { fetchWorkElement } from '@/_workspace/react-select/async-promise-load-options/fetchWorkElement'
// import { fetchJobType } from '@/_workspace/react-select/async-promise-load-options/fetchJobType'
// import { fetchProductMainByLikeProductMainNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
// import CustomTextField from '@/components/mui/TextField'
// import { fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
// import ConfirmModal from '@/components/ConfirmModal'
// import { FormData } from './ProductTypeAddModal'
// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
// import { fetchProductSubByLikeProductSubNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
// import { fetchBomByLikeBomNameAndInuse } from ''
// import { ParamApiSearchResultTableI, SearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
// import { fetchFlowProductTypeByFlowId } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProductType'
// import { fetchProcessByFlowProcessId } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProcess'
// import { is_Null_Undefined_Blank } from '@/utils/formatting-checking-value/checkingValueTypes'
// import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
// import { useSearchProductTypeForEdit } from '@/_workspace/react-query/hooks/useProductTypeData'
// import { log } from 'node:console'

// //export type FormData = Input<typeof schema>
// type User = {
//   id: string
// }

// interface Props {
//   isEnableFetching: boolean
//   setIsEnableFetching: Dispatch<SetStateAction<boolean>>
// }

// const initState: SearchResultTableI = {
//   queryPageIndex: 0,
//   queryPageSize: 10,
//   totalCount: 0,
//   querySortBy: [],
//   withRowBorders: true,
//   withTableBorder: false,
//   withColumnBorders: false,

//   striped: true
// }

// interface ParamApiSearchProductTypeI extends ParamApiSearchResultTableI {
//   PRODUCT_TYPE_ID?: number | ''
//   PRODUCT_TYPE_NAME?: string
//   PRODUCT_TYPE_CODE?: string
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME?: string
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER?: string
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION?: string
//   SUFFIX_FOR_PART_NUMBER?: string
//   IS_PRODUCT_FOR_REPAIR?: string
//   IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE?: string
//   PRODUCT_CATEGORY_ID?: number | ''
//   PRODUCT_CATEGORY_NAME?: string
//   PRODUCT_MAIN_ID?: number | ''
//   PRODUCT_MAIN_NAME?: string
//   PRODUCT_SUB_ID?: number | ''
//   PRODUCT_SUB_NAME?: string
//   ITEM_CATEGORY_ID?: number | ''
//   ITEM_CATEGORY_NAME?: string
//   FLOW_ID?: number | ''
//   FLOW_CODE?: string
//   FLOW_NAME?: string
//   BOM_ID?: number | ''
//   BOM_CODE?: string
//   BOM_NAME?: string
//   BOI_PROJECT_ID?: number | ''
//   BOI_PROJECT_NAME?: string
//   BOI_PROJECT_CODE?: string
//   ACCOUNT_DEPARTMENT_CODE_ID?: number | ''
//   ACCOUNT_DEPARTMENT_NAME?: string
//   PC_NAME?: string
//   PRODUCT_ITEM_NAME?: string
//   PRODUCT_ITEM_CODE?: string
//   FFT_PART_NUMBER?: string
//   PRODUCT_PART_NUMBER?: string
//   IS_BOI?: string
//   // LIMIT: number | ''
//   // inuseForSearch?: string
// }

// export interface ReturnApiSearchProductTypeI {
//   PRODUCT_TYPE_ID: number | string
//   PRODUCT_TYPE_NAME: string
//   PRODUCT_TYPE_CODE: string
//   SUFFIX_FOR_PART_NUMBER: string
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: string
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: string
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: string
//   IS_PRODUCT_FOR_REPAIR: string
//   IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE: string
//   PRODUCT_CATEGORY_ID: number | string
//   PRODUCT_CATEGORY_NAME: string
//   PRODUCT_MAIN_ID: number | string
//   PRODUCT_MAIN_NAME: string
//   PRODUCT_SUB_ID: number | string
//   PRODUCT_SUB_NAME: string
//   ITEM_CATEGORY_ID: number | string
//   ITEM_CATEGORY_NAME: string
//   // PRODUCT_MAIN_ID: number | string
//   FLOW_ID: string
//   FLOW_CODE: string
//   FLOW_NAME: string
//   BOM_ID: number | string
//   BOM_CODE: string
//   BOM_NAME: string
//   BOI_PROJECT_ID: number | string
//   BOI_PROJECT_NAME: string
//   BOI_PROJECT_CODE: string
//   ACCOUNT_DEPARTMENT_CODE_ID: number | string
//   ACCOUNT_DEPARTMENT_NAME: string
//   PC_NAME: string
//   PRODUCT_ITEM_NAME: string
//   PRODUCT_ITEM_CODE: string
//   FFT_PART_NUMBER: string
//   PRODUCT_PART_NUMBER: string
//   IS_BOI: string
//   INUSE: string | number
//   Start: number
//   Limit: number
//   Order: string
//   ColumnFilters: string
// }

// const getUrlParamSearch = ({
//   queryPageIndex,
//   queryPageSize,
//   querySortBy,
//   queryColumnFilterFns,
//   queryColumnFilters,
//   PRODUCT_TYPE_ID = '',
//   PRODUCT_TYPE_NAME = '',
//   PRODUCT_TYPE_CODE = '',
//   SUFFIX_FOR_PART_NUMBER = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = '',
//   PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = '',
//   IS_PRODUCT_FOR_REPAIR = '',
//   IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE = '',
//   PRODUCT_CATEGORY_ID = '',
//   PRODUCT_CATEGORY_NAME = '',
//   PRODUCT_MAIN_ID = '',
//   PRODUCT_MAIN_NAME = '',
//   PRODUCT_SUB_ID = '',
//   PRODUCT_SUB_NAME = '',
//   ITEM_CATEGORY_ID = '',
//   ITEM_CATEGORY_NAME = '',
//   FLOW_ID = '',
//   FLOW_CODE = '',
//   FLOW_NAME = '',
//   BOM_ID = '',
//   BOM_CODE = '',
//   BOM_NAME = '',
//   BOI_PROJECT_ID = '',
//   BOI_PROJECT_NAME = '',
//   BOI_PROJECT_CODE = '',
//   ACCOUNT_DEPARTMENT_CODE_ID = '',
//   ACCOUNT_DEPARTMENT_NAME = '',
//   PC_NAME = '',
//   PRODUCT_ITEM_NAME = '',
//   PRODUCT_ITEM_CODE = '',
//   FFT_PART_NUMBER = '',
//   PRODUCT_PART_NUMBER = '',
//   IS_BOI = '',
//   inuseForSearch = ''
// }: ParamApiSearchProductTypeI): any => {
//   const params = {
//     PRODUCT_TYPE_NAME: PRODUCT_TYPE_NAME.trim(),
//     PRODUCT_TYPE_CODE: PRODUCT_TYPE_CODE.trim(),
//     PRODUCT_TYPE_ID: PRODUCT_TYPE_ID || '',
//     PRODUCT_CATEGORY_ID: PRODUCT_CATEGORY_ID || '',
//     PRODUCT_CATEGORY_NAME: PRODUCT_CATEGORY_NAME.trim(),
//     PRODUCT_MAIN_ID: PRODUCT_MAIN_ID || '',
//     PRODUCT_MAIN_NAME: PRODUCT_MAIN_NAME.trim(),
//     PRODUCT_SUB_ID: PRODUCT_SUB_ID || '',
//     PRODUCT_SUB_NAME: PRODUCT_SUB_NAME.trim(),
//     PRODUCT_ITEM_NAME: PRODUCT_ITEM_NAME.trim(),
//     PRODUCT_ITEM_CODE: PRODUCT_ITEM_CODE.trim(),
//     PRODUCT_PART_NUMBER: PRODUCT_PART_NUMBER.trim(),
//     SUFFIX_FOR_PART_NUMBER: SUFFIX_FOR_PART_NUMBER.trim(),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME || '',
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER.trim(),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION:
//       PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION.trim(),
//     IS_PRODUCT_FOR_REPAIR: IS_PRODUCT_FOR_REPAIR.trim(),
//     IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE: IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE.trim(),
//     FLOW_ID: FLOW_ID || '',
//     FLOW_NAME: FLOW_NAME.trim(),
//     FLOW_CODE: FLOW_CODE.trim(),
//     BOM_ID: BOM_ID || '',
//     BOM_NAME: BOM_NAME.trim(),
//     BOM_CODE: BOM_CODE.trim(),
//     ACCOUNT_DEPARTMENT_CODE_ID: ACCOUNT_DEPARTMENT_CODE_ID || '',
//     ACCOUNT_DEPARTMENT_NAME: ACCOUNT_DEPARTMENT_NAME.trim(),
//     PC_NAME: PC_NAME.trim(),
//     ITEM_CATEGORY_ID: ITEM_CATEGORY_ID || '',
//     ITEM_CATEGORY_NAME: ITEM_CATEGORY_NAME.trim(),
//     FFT_PART_NUMBER: FFT_PART_NUMBER.trim(),
//     BOI_PROJECT_ID: BOI_PROJECT_ID || '',
//     BOI_PROJECT_NAME: BOI_PROJECT_NAME.trim(),
//     BOI_PROJECT_CODE: BOI_PROJECT_CODE.trim(),
//     IS_BOI: IS_BOI.trim(),
//     INUSE: is_Null_Undefined_Blank(inuseForSearch) ? '' : inuseForSearch,
//     Start: queryPageIndex,
//     Limit: initState.queryPageSize,
//     Order: querySortBy?.length > 0 ? JSON.stringify(querySortBy).replace('MODIFIED_DATE', 'UPDATE_DATE') : ''
//   }
//   console.log('paramsForEditType', params)

//   return params
// }

// const ProductTypeDnd = ({
//   isEnableFetching,
//   setIsEnableFetching
//   // // data,
//   // setData,
//   // isMessageError,
//   // setIsMessageError,
//   // open,
//   // setOpen
// }: Props) => {
//   // State
//   const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()
//   // const [rowSelected, setRowSelected] = useState<MRT_Row<ProductTypeI> | null>(null)
//   const [confirmModal, setConfirmModal] = useState(false)
//   const [columnOrder, setColumnOrder] = useState<MRT_ColumnOrderState>(getValues('searchResults.columnOrder') || [])
//   const [columnSizing, setColumnSizing] = useState<MRT_ColumnSizingState>(getValues('searchResults.columnSizing') || {})
//   const [columnPinning, setColumnPinning] = useState<MRT_ColumnPinningState>(getValues('searchResults.columnPinning'))
//   const [density, setDensity] = useState<MRT_DensityState>(getValues('searchResults.density'))
//   const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(getValues('searchResults.columnFilters'))
//   const [sorting, setSorting] = useState<MRT_SortingState>(getValues('searchResults.sorting'))

//   const [columnFilterFns, setColumnFilterFns] = useState<MRT_ColumnFilterFnsState>(
//     getValues('searchResults.columnFilterFns')
//   )

//   // Hooks
//   // Hooks : react-hook-form

//   const { isLoading, errors } = useFormState({ control })

//   const onSubmit: SubmitHandler<FormData> = () => {
//     setConfirmModal(true)
//   }
//   const onError: SubmitErrorHandler<FormData> = data => {
//     console.log(data)
//   }

//   const handleCreate = () => {
//     setConfirmModal(false)

//     // console.log('DATA-PROFILE', data)
//     // console.log('original', `productMain.${row.original.id}`)
//   }

//   // const openDeleteConfirmModal = (row: MRT_Row<FormData>) => {
//   //   if (window.confirm('Are you sure you want to delete this user?')) {
//   //     setData((prevUsers: any) => prevUsers?.filter((user: User) => user.id !== row.original.id))
//   //     unregister(`searchFilters.specification.${row.original.id}`)
//   //     // unregister(`searchFilters.productMain.${row.original.id}`)
//   //     // unregister(`searchFilters.customerOrderFrom.${row.original.id}`)
//   //     unregister(`searchFilters.specificationSettingNumber.${row.original.id}`)
//   //     unregister(`searchFilters.specificationSettingVersionRevision.${row.original.id}`)
//   //     unregister(`searchFilters.partNumber.${row.original.id}`)
//   //   }
//   //   console.log('original', row.original)
//   // }
//   const [pagination, setPagination] = useState<MRT_PaginationState>({
//     pageIndex: 0,
//     pageSize: getValues('searchResults.pageSize')
//   })

//   console.log(Object.keys(errors))

//   const paramForSearch: ParamApiSearchProductTypeI = {
//     queryPageIndex: pagination.pageIndex,
//     queryPageSize: pagination.pageSize,
//     querySortBy: sorting,
//     queryColumnFilterFns: columnFilterFns,
//     queryColumnFilters: columnFilters,
//     INUSE: null,
//     CREATE_BY: '',
//     CREATE_DATE: '',
//     DESCRIPTION: '',
//     UPDATE_BY: '',
//     UPDATE_DATE: '',
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('searchFilters.specificationSettingName'),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('searchFilters.specificationSettingNumber'),
//     PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: getValues(
//       'searchFilters.specificationSettingVersionRevision'
//     ),
//     BOI_PROJECT_ID: getValues('searchFilters.boiProject')?.BOI_PROJECT_ID,
//     BOI_PROJECT_NAME: getValues('searchFilters.boiProject')?.BOI_PROJECT_NAME,
//     BOI_PROJECT_CODE: getValues('searchFilters.boiProjectCode'),
//     PRODUCT_TYPE_ID: getValues('searchFilters.productType')?.PRODUCT_TYPE_ID,
//     PRODUCT_TYPE_NAME: getValues('searchFilters.productType')?.PRODUCT_TYPE_NAME,
//     PRODUCT_TYPE_CODE: getValues('searchFilters.productTypeCode'),
//     PRODUCT_PART_NUMBER: getValues('searchFilters.partNumber'),
//     SUFFIX_FOR_PART_NUMBER: getValues('searchFilters.suffixForPartNumber'),
//     IS_PRODUCT_FOR_REPAIR: getValues('searchFilters.productForRepair'),
//     IS_BOI: getValues('searchFilters.isBoi'),
//     FFT_PART_NUMBER: getValues('searchFilters.fftPartNumber'),
//     PRODUCT_CATEGORY_NAME: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_NAME,
//     PRODUCT_CATEGORY_ID: getValues('searchFilters.productCategory')?.PRODUCT_CATEGORY_ID,
//     PRODUCT_MAIN_NAME: getValues('searchFilters.productMain')?.PRODUCT_MAIN_NAME,
//     PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.PRODUCT_MAIN_ID,
//     PRODUCT_SUB_ID: getValues('searchFilters.productSub')?.PRODUCT_SUB_ID,
//     PRODUCT_SUB_NAME: getValues('searchFilters.productSub')?.PRODUCT_SUB_NAME,
//     ITEM_CATEGORY_NAME: getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_NAME,
//     ITEM_CATEGORY_ID: getValues('searchFilters.itemCategory')?.ITEM_CATEGORY_ID,
//     ACCOUNT_DEPARTMENT_CODE_ID: getValues('searchFilters.accountDepartment')?.ACCOUNT_DEPARTMENT_CODE_ID,
//     ACCOUNT_DEPARTMENT_NAME: getValues('searchFilters.accountDepartment')?.ACCOUNT_DEPARTMENT_NAME,
//     IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE: getValues('searchFilters.selectedProductLevelForGenProductTypeCode'),
//     PC_NAME: getValues('searchFilters.pcName'),
//     FLOW_ID: getValues('searchFilters.flow')?.FLOW_ID,
//     FLOW_CODE: getValues('searchFilters.flow')?.FLOW_CODE,
//     FLOW_NAME: getValues('searchFilters.flowName'),
//     BOM_ID: getValues('searchFilters.bom')?.BOM_ID,
//     BOM_CODE: getValues('searchFilters.bom')?.BOM_CODE,
//     BOM_NAME: getValues('searchFilters.bomName'),

//     inuseForSearch: getValues('searchFilters.status')?.value
//   }

//   const { isRefetching, data, isError, refetch, isFetching } = useSearchProductTypeForEdit(
//     getUrlParamSearch(paramForSearch),
//     isEnableFetching
//   )
//   console.log('paramSearch', data?.data.ResultOnDb)
//   // useEffect(() => {
//   //   if (isFetching === false) {
//   //     setIsEnableFetching(false)
//   //   }
//   // }, [isFetching])

//   const columns = useMemo<MRT_ColumnDef<FormData>[]>(
//     () => [
//       {
//         accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME',
//         header: 'Product Specification Document Setting Name',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 // name={`searchFilters.specificationSettingName.${row.original.id}`}
//                 key={row.original.id}
//                 name={`searchFilters.specificationSettingName.${row.original.id}`}
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { ...fieldProps } }) => (
//                   <CustomTextField
//                     // value={
//                     //   watch('searchFilters.specificationSettingName')?.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME || ''
//                     // }
//                     label='Product Specification Setting Name'
//                     {...fieldProps}
//                     fullWidth
//                     autoComplete='off'
//                     // {...(errors.specificationSetting?.row?.original?.id && {
//                     //   error: true,
//                     //   helperText: errors.specificationSetting?.row?.original?.id?.message
//                     // })}
//                     disabled
//                     // {...(errors?.searchFilters?.specificationSetting?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.specificationSetting?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER',
//         header: 'Product Specification Document Setting Number',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 // name={`searchFilters.specificationSettingNumber.${row.original.id}`}
//                 name='searchFilters.specificationSettingNumber'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Product Specification Setting Number'
//                     {...fieldProps}
//                     fullWidth
//                     autoComplete='off'
//                     // {...(errors.specificationSettingNumber && {
//                     //   error: true,
//                     //   helperText: errors.specificationSettingNumber.message
//                     // })}
//                     disabled
//                     // {...(errors?.searchFilters?.specificationSettingNumber?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.specificationSettingNumber?.[row.original.id]?.message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION',
//         header: 'Product Specification Document Setting Version Revision',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 // name={`searchFilters.specificationSettingVersionRevision.${row.original.id}`}
//                 name='searchFilters.specificationSettingVersionRevision'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Product Specification Setting Version Revision'
//                     {...fieldProps}
//                     fullWidth
//                     autoComplete='off'
//                     disabled
//                     // {...(errors.searchFilters.specificationSettingVersionRevision && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
//                     // })}
//                     // {...(errors?.searchFilters?.specificationSettingVersionRevision?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.specificationSettingVersionRevision?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'PRODUCT_PART_NUMBER',
//         header: 'Product Part Number',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.partNumber'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { onChange, ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Product Part Number'
//                     {...fieldProps}
//                     fullWidth
//                     onChange={value => {
//                       onChange(value)
//                       // setValue('process', null)
//                       // console.log('PartNum', value)
//                     }}
//                     // label='Customer Order From Alphabet'
//                     // placeholder='Enter Customer Order From Alphabet'
//                     autoComplete='off'
//                     disabled
//                     // {...(errors.searchFilters?.partNumber && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters?.partNumber.message
//                     // })}
//                     // {...(errors?.searchFilters?.partNumber?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.partNumber?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'SUFFIX_FOR_PART_NUMBER',
//         header: 'Suffix For Part Number',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.suffixForPartNumber'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { onChange, ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Suffix For Part Number'
//                     {...fieldProps}
//                     fullWidth
//                     onChange={value => {
//                       onChange(value)
//                       // setValue('process', null)
//                       // console.log('PartNum', value)
//                     }}
//                     // label='Customer Order From Alphabet'
//                     // placeholder='Enter Customer Order From Alphabet'
//                     autoComplete='off'
//                     // {...(errors.searchFilters?.partNumber && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters?.partNumber.message
//                     // })}
//                     // {...(errors?.searchFilters?.suffixForPartNumber?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.suffixForPartNumber?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'IS_PRODUCT_FOR_REPAIR',
//         header: 'Product For Repair',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <FormControl error={Boolean(errors.searchFilters?.productForRepair)}>
//                 <Controller
//                   name='searchFilters.productForRepair'
//                   control={control}
//                   render={({ field }) => (
//                     <FormControlLabel
//                       control={
//                         <RadioGroup {...field} row>
//                           <FormControlLabel value='1' control={<Radio />} label='Yes' />
//                           <FormControlLabel value='0' control={<Radio />} label='No' />
//                         </RadioGroup>
//                       }
//                       label=''
//                     />
//                   )}
//                 />
//                 {errors.searchFilters?.productForRepair && (
//                   <FormHelperText error>{errors.searchFilters?.productForRepair.message}</FormHelperText>
//                 )}
//               </FormControl>
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'FFT_PART_NUMBER',
//         header: 'FFT Part Number',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.fftPartNumber'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { onChange, ...fieldProps } }) => (
//                   <CustomTextField
//                     label='FFT Part Number'
//                     {...fieldProps}
//                     fullWidth
//                     onChange={value => {
//                       onChange(value)
//                       // setValue('process', null)
//                       // console.log('PartNum', value)
//                     }}
//                     // label='Customer Order From Alphabet'
//                     // placeholder='Enter Customer Order From Alphabet'
//                     autoComplete='off'
//                     // {...(errors.searchFilters?.partNumber && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters?.partNumber.message
//                     // })}
//                     disabled
//                     // {...(errors?.searchFilters?.fftPartNumber?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.fftPartNumber?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         header: 'Product Category',
//         accessorKey: 'PRODUCT_CATEGORY_NAME',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.productCategory'
//                 control={control}
//                 render={({ field: { ref, onChange, ...fieldProps } }) => (
//                   <AsyncSelectCustom
//                     label='Product Category'
//                     {...fieldProps}
//                     isClearable
//                     cacheOptions
//                     defaultOptions
//                     classNamePrefix='select'
//                     onChange={value => {
//                       onChange(value)
//                       console.log('Main', value)

//                       // setData(prev =>
//                       //   prev?.map(prevUser =>
//                       //     prevUser.PRODUCT_SPECIFICATION_SETTING_ID === row.original.PRODUCT_SPECIFICATION_SETTING_ID
//                       //       ? { ...row.original, workElement: value }
//                       //       : prevUser
//                       //   )
//                       // )
//                     }}
//                     loadOptions={inputValue => {
//                       return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
//                     }}
//                     getOptionLabel={data => data.PRODUCT_CATEGORY_NAME}
//                     getOptionValue={data => data.PRODUCT_CATEGORY_ID?.toString()}
//                     // {...(errors?.searchFilters?.productCategory?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters.productCategory?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         header: 'Product Main',
//         accessorKey: 'PRODUCT_MAIN_NAME',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.productMain'
//                 control={control}
//                 render={({ field: { ref, onChange, ...fieldProps } }) => (
//                   <AsyncSelectCustom
//                     label='Product Main'
//                     {...fieldProps}
//                     isClearable
//                     cacheOptions
//                     defaultOptions
//                     classNamePrefix='select'
//                     onChange={value => {
//                       onChange(value)
//                       console.log('Main', value)

//                       // setData(prev =>
//                       //   prev?.map(prevUser =>
//                       //     prevUser.PRODUCT_SPECIFICATION_SETTING_ID === row.original.PRODUCT_SPECIFICATION_SETTING_ID
//                       //       ? { ...row.original, workElement: value }
//                       //       : prevUser
//                       //   )
//                       // )
//                     }}
//                     loadOptions={inputValue => {
//                       return fetchProductMainByLikeProductMainNameAndInuse(inputValue, '1')
//                     }}
//                     getOptionLabel={data => data.PRODUCT_MAIN_NAME}
//                     getOptionValue={data => data.PRODUCT_MAIN_ID?.toString()}
//                     // {...(errors?.searchFilters?.productMain?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters.productMain?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         header: 'Product Sub',
//         accessorKey: 'PRODUCT_SUB_NAME',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.productSub'
//                 control={control}
//                 render={({ field: { ref, onChange, ...fieldProps } }) => (
//                   <AsyncSelectCustom
//                     label='Product Sub'
//                     {...fieldProps}
//                     isClearable
//                     cacheOptions
//                     defaultOptions
//                     classNamePrefix='select'
//                     onChange={value => {
//                       onChange(value)
//                       console.log('Main', value)
//                     }}
//                     loadOptions={inputValue => {
//                       return fetchProductSubByLikeProductSubNameAndInuse(inputValue, '1')
//                     }}
//                     getOptionLabel={data => data.PRODUCT_SUB_NAME}
//                     getOptionValue={data => data.PRODUCT_SUB_ID?.toString()}
//                     // {...(errors?.searchFilters?.productSub?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters.productSub?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },

//       {
//         header: 'Product Item Category',
//         accessorKey: 'ITEM_CATEGORY_NAME',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 key={row.original.id}
//                 name={`searchFilters.itemCategory.${row.original.id}`}
//                 control={control}
//                 render={({ field: { ref, onChange, ...fieldProps } }) => (
//                   <AsyncSelectCustom
//                     label='Item Category'
//                     {...fieldProps}
//                     isClearable
//                     cacheOptions
//                     defaultOptions
//                     classNamePrefix='select'
//                     onChange={value => {
//                       onChange(value)
//                       console.log('Main', value)
//                     }}
//                     loadOptions={inputValue => {
//                       return fetchProductMainByLikeProductMainNameAndInuse(inputValue, '1')
//                     }}
//                     getOptionLabel={data => data.PRODUCT_MAIN_NAME}
//                     getOptionValue={data => data.PRODUCT_MAIN_ID?.toString()}
//                     // {...(errors?.searchFilters?.itemCategory?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters.itemCategory?.[row.original.id].message
//                     // })}
//                     isDisabled={true}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         header: 'Department Code (Account)',
//         accessorKey: 'ACCOUNT_DEPARTMENT_NAME',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.accountDepartment'
//                 control={control}
//                 render={({ field: { ref, onChange, ...fieldProps } }) => (
//                   <AsyncSelectCustom
//                     label='Department Code'
//                     {...fieldProps}
//                     isClearable
//                     cacheOptions
//                     defaultOptions
//                     classNamePrefix='select'
//                     onChange={value => {
//                       onChange(value)
//                       console.log('Main', value)
//                     }}
//                     loadOptions={inputValue => {
//                       return fetchProductMainByLikeProductMainNameAndInuse(inputValue, '1')
//                     }}
//                     getOptionLabel={data => data.PRODUCT_MAIN_NAME}
//                     getOptionValue={data => data.PRODUCT_MAIN_ID?.toString()}
//                     // {...(errors?.searchFilters?.accountDepartment?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters.accountDepartment?.[row.original.id].message
//                     // })}
//                     isDisabled={true}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'IS_PRODUCT_LEVEL_FOR_GEN_PRODUCT_TYPE_CODE',
//         header: 'Selected Product Level for Gen Product Type Code',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <FormControl error={Boolean(errors.searchFilters?.selectedProductLevelForGenProductTypeCode)}>
//                 <Controller
//                   name='searchFilters.selectedProductLevelForGenProductTypeCode'
//                   control={control}
//                   render={({ field }) => (
//                     <FormControlLabel
//                       control={
//                         <RadioGroup {...field} row>
//                           <FormControlLabel value='1' control={<Radio />} label='Product Main' />
//                           <FormControlLabel value='0' control={<Radio />} label='Product Sub' />
//                         </RadioGroup>
//                       }
//                       label=''
//                     />
//                   )}
//                 />
//                 {errors.searchFilters?.selectedProductLevelForGenProductTypeCode && (
//                   <FormHelperText error>
//                     {errors.searchFilters?.selectedProductLevelForGenProductTypeCode.message}
//                   </FormHelperText>
//                 )}
//               </FormControl>
//             </>
//           )
//         }
//       },
//       // {
//       //   accessorKey: 'PRODUCT_TYPE_CODE',
//       //   header: 'Product Type Code',
//       //   size: 200,
//       //   Cell: ({ renderedCellValue, row, cell }) => {
//       //     return (
//       //       <>
//       //         <Controller
//       //           // key={row.original.id}
//       //           name='searchFilters.productTypeCode'
//       //           control={control}
//       //           rules={{ required: true }}
//       //           render={({ field: { ...fieldProps } }) => (
//       //             <CustomTextField
//       //               label='Product Type Code'
//       //               {...fieldProps}
//       //               fullWidth
//       //               autoComplete='off'
//       //               disabled
//       //               // {...(errors.searchFilters.specificationSettingVersionRevision && {
//       //               //   error: true,
//       //               //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
//       //               // })}
//       //               // {...(errors?.searchFilters?.productTypeCode?.[row.original.id] && {
//       //               //   error: true,
//       //               //   helperText: errors?.searchFilters?.productTypeCode?.[row.original.id].message
//       //               // })}
//       //             />
//       //           )}
//       //           disabled
//       //         />
//       //       </>
//       //     )
//       //   }
//       // },
//       {
//         accessorKey: 'PC_NAME',
//         header: 'PC Name',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.pcName'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Pc Name'
//                     {...fieldProps}
//                     fullWidth
//                     autoComplete='off'
//                     disabled
//                     // {...(errors.searchFilters.specificationSettingVersionRevision && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
//                     // })}
//                     // {...(errors?.searchFilters?.pcName?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.pcName?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'PRODUCT_TYPE_NAME',
//         header: 'Product Type Name',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.productType'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Product Type Name'
//                     {...fieldProps}
//                     fullWidth
//                     autoComplete='off'
//                     disabled
//                     // {...(errors.searchFilters.specificationSettingVersionRevision && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
//                     // })}
//                     // {...(errors?.searchFilters?.productTypeName?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.productTypeName?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         header: 'Flow Code',
//         accessorKey: 'FLOW_CODE',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.flow'
//                 control={control}
//                 render={({ field: { ref, onChange, ...fieldProps } }) => (
//                   <AsyncSelectCustom
//                     label='Flow Code'
//                     {...fieldProps}
//                     isClearable
//                     cacheOptions
//                     defaultOptions
//                     classNamePrefix='select'
//                     onChange={value => {
//                       onChange(value)
//                       console.log('Main', value)
//                     }}
//                     loadOptions={inputValue => {
//                       return fetchProcessByFlowProcessId(inputValue, '1')
//                     }}
//                     getOptionLabel={data => data.FLOW_NAME}
//                     getOptionValue={data => data.FLOW_ID?.toString()}
//                     // {...(errors?.searchFilters?.flowCode?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters.flowCode?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'FLOW_NAME',
//         header: 'Flow Name',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.flowName'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Flow Name'
//                     {...fieldProps}
//                     fullWidth
//                     autoComplete='off'
//                     disabled
//                     // {...(errors.searchFilters.specificationSettingVersionRevision && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
//                     // })}
//                     // {...(errors?.searchFilters?.flowName?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.flowName?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//                 disabled
//               />
//             </>
//           )
//         }
//       },

//       {
//         header: 'Bom Code',
//         accessorKey: 'BOM_CODE',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.bom'
//                 control={control}
//                 render={({ field: { ref, onChange, ...fieldProps } }) => (
//                   <AsyncSelectCustom
//                     label='Bom Code'
//                     {...fieldProps}
//                     isClearable
//                     cacheOptions
//                     defaultOptions
//                     classNamePrefix='select'
//                     onChange={value => {
//                       onChange(value)
//                       console.log('Main', value)
//                     }}
//                     // loadOptions={inputValue => {
//                     //   return fetchBomByLikeBomNameAndInuse(inputValue, '1')
//                     // }}
//                     getOptionLabel={data => data.BOM_CODE}
//                     getOptionValue={data => data.BOM_ID?.toString()}
//                     // {...(errors?.searchFilters?.bomCode?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters.bomCode?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'BOM_NAME',
//         header: 'Bom Name',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 // key={row.original.id}
//                 name='searchFilters.bomName'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Bom Name'
//                     {...fieldProps}
//                     fullWidth
//                     autoComplete='off'
//                     disabled
//                     // {...(errors.searchFilters.specificationSettingVersionRevision && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters.specificationSettingVersionRevision.message
//                     // })}
//                     // {...(errors?.searchFilters?.bomName?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.bomName?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//                 disabled
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'IS_BOI',
//         header: 'BOI',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <FormControl error={Boolean(errors.searchFilters?.isBoi)}>
//                 <Controller
//                   name='searchFilters.isBoi'
//                   control={control}
//                   render={({ field }) => (
//                     <FormControlLabel
//                       control={
//                         <RadioGroup {...field} row>
//                           <FormControlLabel value='1' control={<Radio />} label='BOI' />
//                           <FormControlLabel value='0' control={<Radio />} label='Non-BOI' />
//                         </RadioGroup>
//                       }
//                       label=''
//                     />
//                   )}
//                 />
//                 {/* {errors.isBoi && <FormHelperText error>{errors.isBoi.message}</FormHelperText>} */}
//               </FormControl>
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'BOI_PROJECT_NAME',
//         header: 'Boi Project',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 key={row.original.id}
//                 name={`searchFilters.boiProject.${row?.original.id}`}
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { onChange, ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Boi Project'
//                     {...fieldProps}
//                     fullWidth
//                     onChange={value => {
//                       onChange(value)
//                       // setValue('process', null)
//                       // console.log('PartNum', value)
//                     }}
//                     // label='Customer Order From Alphabet'
//                     // placeholder='Enter Customer Order From Alphabet'
//                     autoComplete='off'
//                     // {...(errors.searchFilters?.partNumber && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters?.partNumber.message
//                     // })}
//                     disabled
//                     // {...(errors?.searchFilters?.boiProject?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.boiProject?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       },
//       {
//         accessorKey: 'BOI_PROJECT_CODE',
//         header: 'Boi Project Code',
//         size: 200,
//         Cell: ({ renderedCellValue, row, cell }) => {
//           return (
//             <>
//               <Controller
//                 key={row.original.id}
//                 name='searchFilters.boiProjectCode'
//                 control={control}
//                 rules={{ required: true }}
//                 render={({ field: { onChange, ...fieldProps } }) => (
//                   <CustomTextField
//                     label='Boi Project Code'
//                     {...fieldProps}
//                     fullWidth
//                     onChange={value => {
//                       onChange(value)
//                       // setValue('process', null)
//                       // console.log('PartNum', value)
//                     }}
//                     // label='Customer Order From Alphabet'
//                     // placeholder='Enter Customer Order From Alphabet'
//                     autoComplete='off'
//                     // {...(errors.searchFilters?.partNumber && {
//                     //   error: true,
//                     //   helperText: errors.searchFilters?.partNumber.message
//                     // })}
//                     disabled
//                     // {...(errors?.searchFilters?.boiProjectCode?.[row.original.id] && {
//                     //   error: true,
//                     //   helperText: errors?.searchFilters?.boiProjectCode?.[row.original.id].message
//                     // })}
//                   />
//                 )}
//               />
//             </>
//           )
//         }
//       }

//       // {
//       //   accessorKey: 'CUSTOMER_ORDER_FROM_NAME',
//       //   header: 'Customer Order From',
//       //   size: 80,
//       //   Cell: ({ renderedCellValue, row, cell }) => {
//       //     return (
//       //       <>
//       //         <Controller
//       //           key={row?.original.id}
//       //           name={`searchFilters.customerOrderFrom.${row?.original.id}`}
//       //           control={control}
//       //           render={({ field: { onChange, ...fieldProps } }) => (
//       //             <AsyncSelectCustom
//       //               label='Customer Order From'
//       //               {...fieldProps}
//       //               onChange={value => {
//       //                 onChange(value)
//       //                 console.log('orderFrom', value)
//       //               }}
//       //               isClearable
//       //               cacheOptions
//       //               defaultOptions
//       //               loadOptions={inputValue => {
//       //                 return fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse(inputValue, '1')
//       //               }}
//       //               getOptionLabel={data => data?.CUSTOMER_ORDER_FROM_NAME}
//       //               getOptionValue={data => data?.CUSTOMER_ORDER_FROM_ID?.toString()}
//       //               classNamePrefix='select'
//       //               placeholder='Select...'
//       //               // {...(errors.searchFilters.customerOrderFrom && { error: true, helperText: errors.searchFilters.customerOrderFrom.message })}
//       //               {...(errors?.searchFilters?.customerOrderFrom?.[row.original.id] && {
//       //                 error: true,
//       //                 helperText: errors?.searchFilters?.customerOrderFrom?.[row.original.id].message
//       //               })}
//       //             />
//       //           )}
//       //         />
//       //       </>
//       //     )
//       //   }
//       // }
//     ],
//     [errors]
//   )

//   const table = useMaterialReactTable({
//     autoResetPageIndex: false,
//     columns,
//     data: data?.data.ResultOnDb || [],
//     rowCount: data?.data.TotalCountOnDb ?? 0,
//     enableEditing: true,
//     enableRowOrdering: true,
//     enableSorting: false,
//     enablePagination: false,
//     enableRowNumbers: true,
//     enableColumnOrdering: true,
//     onPaginationChange: setPagination,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnFilterFnsChange: setColumnFilterFns,
//     onColumnOrderChange: setColumnOrder,
//     onSortingChange: setSorting,
//     state: {
//       //   columnFilters,
//       //   isLoading,
//       pagination
//       //   // showAlertBanner: isError,
//       //   // showProgressBars: isRefetching,
//       //   sorting,
//       //   density,
//       //   // columnVisibility,
//       //   columnPinning,
//       //   columnOrder,
//       //   columnSizing,
//       //   columnFilterFns
//     },
//     // muiRowDragHandleProps: ({ table }) => ({
//     //   onDragEnd: () => {
//     //     const { draggingRow, hoveredRow } = table.getState()
//     //     if (hoveredRow && draggingRow) {
//     //       data.splice((hoveredRow as MRT_Row<FormData>).index, 0, data.splice(draggingRow.index, 1)[0])
//     //       setData([...data])
//     //     }
//     //   }
//     // }),
//     muiTableContainerProps: {
//       sx: {
//         minHeight: '1000px'
//       }
//     },
//     renderRowActions: ({ row, table, cell }) => (
//       <Box sx={{ display: 'flex', gap: '1rem' }}>
//         <>
//           <Tooltip title='Delete'>
//             <IconButton color='error' onClick={() => openDeleteConfirmModal(row)}>
//               <DeleteIcon />
//             </IconButton>
//           </Tooltip>
//         </>
//       </Box>
//     )
//   })

//   return (
//     <>
//       {/* {JSON.stringify(watch(`searchFilters.specificationSettingName.${row.original.id}`))} */}
//       {/* {JSON.stringify(watch('productCategory'))} */}
//       {/* {dataRow?.map(p => (
//         <>
//           <li>{p.PRODUCT_CATEGORY_NAME}</li>
//         </>
//       ))} */}
//       <MaterialReactTable table={table} />
//       {/* <DevTool control={control} /> */}
//     </>
//   )
// }

// export default ProductTypeDnd

PC_NAME: dataRow[i]?.ITEM_CATEGORY_ID !== '' ||
getValues('searchFilters.itemCategory')?.[i]?.['ITEM_CATEGORY_ID'] !== ''
  ? ''
  : getValues('searchFilters.pcName')?.[i]

// import type { Ref, ReactElement, Dispatch, SetStateAction } from 'react'
// import { forwardRef, useEffect, useState } from 'react'

// // MUI Imports
// import Button from '@mui/material/Button'
// import Dialog from '@mui/material/Dialog'
// import Typography from '@mui/material/Typography'
// import DialogTitle from '@mui/material/DialogTitle'
// import DialogContent from '@mui/material/DialogContent'
// import DialogActions from '@mui/material/DialogActions'

// import type { SlideProps } from '@mui/material'
// import { Box, Divider, Grid, Slide } from '@mui/material'
// import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
// import { Controller, FormProvider, useForm, useFormContext, useFormState } from 'react-hook-form'
// import type { FadeProps } from '@mui/material/Fade'
// import Fade from '@mui/material/Fade'
// import AsyncSelect from 'react-select/async'

// // Components Imports
// import { useQueryClient } from '@tanstack/react-query'

// import AddIcon from '@mui/icons-material/Add'

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
//   toTrimmed,
//   nullish,
//   pipe,
//   nonEmpty,
//   minValue,
//   union,
//   literal,
//   variant
// } from 'valibot'

// import type { InferInput } from 'valibot'

// import { valibotResolver } from '@hookform/resolvers/valibot'

// import DialogCloseButton from '@components/dialogs/DialogCloseButton'

// // import type { ProductCategoryOption } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'
// // import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/'
// import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useProductTypeData'
// import CustomTextField from '@/@core/components/mui/TextField'
// import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
// import {
//   maxLengthFieldMessage,
//   minLengthFieldMessage,
//   requiredFieldMessage,
//   typeFieldMessage
// } from '@/libs/valibot/error-message/errorMessage'

// import { getUserData } from '@/utils/user-profile/userLoginProfile'
// import AsyncCreatableSelect from 'react-select/async-creatable'

// import { ParamApiSearchResultTableI, SearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

// import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
// import ConfirmModal from '@components/ConfirmModal'
// import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'
// // import { fetchProductMainByLikeProductMainNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProductMain'
// import { fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
// import {
//   fetchProcessByLikeProcessAndInuse,
//   fetchProcessByLikeProcessNameAndProductMainIdAndInuse
// } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
// import { fetchSubProcessByLikeProcessAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSubProcess'
// import { useCreateProductType, useSearchProductType } from '@/_workspace/react-query/hooks/useProductTypeData'
// import ProductTypeDnd from './ProductTypeDnd'
// import { transform } from 'next/dist/build/swc'
// import { MaterialReactTable } from 'material-react-table'

// const Transition = forwardRef(function Transition(
//   props: SlideProps & { children?: ReactElement<any, any> },
//   ref: Ref<unknown>
// ) {
//   return <Slide direction='up' ref={ref} {...props} />
// })

// export type FormData = InferInput<typeof schema>

// const schema = object({
//   searchFilters: object({
//     // productMain: record(
//     //   string(),
//     //   object(
//     //     {
//     //       PRODUCT_MAIN_ID: number('Please select ...'),
//     //       PRODUCT_MAIN_NAME: string()
//     //     },
//     //     'Product Main is required'
//     //   ),
//     //   'Product Main is required'
//     // ),

//     // customerOrderFrom: record(
//     //   string(),
//     //   object(
//     //     {
//     //       CUSTOMER_ORDER_FROM_ID: number('Please select ...'),
//     //       CUSTOMER_ORDER_FROM_NAME: string()
//     //     },
//     //     'Customer Order From is required'
//     //   ),
//     //   'Customer Order From is required'
//     // ),

//     specificationSettingName: string(),
//     specificationSettingNumber: string(),
//     specificationSettingVersionRevision: string(),
//     partNumber: string(),
//     suffixForPartNumber: string(),
//     productForRepair: string(),

//     fftPartNumber: string(),
//     productCategory: nullable(
//       object({
//         PRODUCT_CATEGORY_ID: number(),
//         PRODUCT_CATEGORY_NAME: string()
//       })
//     ),
//     productMain: nullable(
//       object({
//         PRODUCT_MAIN_ID: number(),
//         PRODUCT_MAIN_NAME: string()
//       })
//     ),
//     productSub: nullable(
//       object({
//         PRODUCT_SUB_ID: number(),
//         PRODUCT_SUB_NAME: string()
//       })
//     ),
//     itemCategory: nullable(
//       object({
//         ITEM_CATEGORY_ID: number(),
//         ITEM_CATEGORY_NAME: string()
//       })
//     ),
//     accountDepartment: nullable(
//       object({
//         ACCOUNT_DEPARTMENT_CODE_ID: number(),
//         ACCOUNT_DEPARTMENT_NAME: string()
//       })
//     ),
//     flow: nullable(
//       object({
//         FLOW_ID: number(),
//         FLOW_CODE: string()
//       })
//     ),
//     bom: nullable(
//       object({
//         BOM_ID: number(),
//         BOM_CODE: string()
//       })
//     ),
//     productType: nullable(
//       object({
//         PRODUCT_TYPE_ID: number(),
//         PRODUCT_TYPE_NAME: string()
//       })
//     ),
//     boiProject: nullable(
//       object({
//         BOI_PROJECT_ID: number(),
//         BOI_PROJECT_NAME: string()
//       })
//     ),
//     boiProjectCode: string(),
//     productTypeCode: string(),
//     isBoi: string(),
//     selectedProductLevelForGenProductTypeCode: string(),
//     pcName: string(),
//     flowName: string(),
//     bomName: string()

//     // fftPartNumber: record(
//     //   string(),
//     //   pipe(
//     //     string('FFT Part Number is required'),
//     //     maxLength(8, maxLengthFieldMessage({ fieldName: 'FFT Part Number', maxLength: 8 })),
//     //     nonEmpty('FFT Part Number is required')
//     //   ),
//     //   'Product Part Number is required'
//     // ),

//     //   minLength(8, minLengthFieldMessage({ fieldName: 'Product Part Number', minLength: 8 })),
//     //   nonEmpty('Product Part Number is required')
//     // ),
//     // 'Product Part Number is required'

//     // specificationSettingNumber: record(
//     //   string(),
//     //   pipe(
//     //     string('Product Specification Setting Number is required'),
//     //     nonEmpty('Product Specification Setting Number is required')
//     //   ),
//     //   'Product Specification Setting Number is required'
//     // ),
//     // specificationSettingVersionRevision: record(
//     //   string(),
//     //   pipe(
//     //     string('Product Specification Setting Version Reversion is required'),
//     //     nonEmpty('Product Specification Setting Version Reversion is required')
//     //   ),
//     //   'Product Specification Setting Version Reversion is required'
//     // )
//   })
//   // searchResults: object({
//   //   pageSize: number(),
//   //   columnFilters: array(
//   //     object({
//   //       id: string(),
//   //       value: unknown()
//   //     })
//   //   ),
//   //   sorting: array(
//   //     object({
//   //       desc: boolean(),
//   //       id: string()
//   //     })
//   //   ),
//   //   density: picklist(['comfortable', 'compact', 'spacious']),
//   //   columnVisibility: record(string(), boolean()),
//   //   columnPinning: object({
//   //     left: optional(array(string())),
//   //     right: optional(array(string()))
//   //   }),
//   //   columnOrder: array(string()),
//   //   columnSizing: record(string(), number())
//   // })
// })

// interface ProductTypeModalProps {
//   openAddModal: boolean
//   setOpenModalAdd: Dispatch<SetStateAction<boolean>>
// }

// // interface Props {
// //   isEnableFetching: boolean
// //   setIsEnableFetching: Dispatch<SetStateAction<boolean>>
// // }

// const ProductTypeAddModal = ({
//   openAddModal,
//   setOpenModalAdd
//   // isEnableFetching,
//   // setIsEnableFetching
// }: ProductTypeModalProps) => {
//   // States : Modal
//   const [activeList, setActiveList] = useState('1')
//   const toggleList = (list: any) => {
//     if (activeList !== list) {
//       setActiveList(list)
//     }
//   }

//   const [dataRow, setData] = useState([])

//   const [confirmModal, setConfirmModal] = useState(false)

//   const [isMessageError, setIsMessageError] = useState(false)
//   const [open, setOpen] = useState(false)
//   // useEffect(() => {
//   //   lastIdSpecificationSetting = undefined
//   // }, [])

//   const handleClickOpen = () => setOpenModalAdd(true)
//   const handleClose = () => {
//     setOpenModalAdd(false)
//   }
//   //*-------------- Global value ------------------

//   // Hooks : react-hook-form
//   const reactHookFormMethods = useForm<FormData>({
//     // ###VALIBOT####
//     // resolver: valibotResolver(schema)
//     // defaultValues: {
//     //   // @ts-ignore
//     //   productMain: null,
//     //   process: null,
//     // }
//     resolver: valibotResolver(schema),
//     defaultValues: {
//       // specificationSettingVersionRevision: '',
//       // specificationSettingNumber: '',
//       // partNumber: '',
//       // specificationSetting: ''
//       // productMain: null,
//       // customerOrderFrom: null
//     }
//   })
//   const { control, handleSubmit, getValues, watch, setValue, reset, unregister, register, trigger } =
//     reactHookFormMethods

//   // const { errors } = useFormState({
//   //   control
//   // })

//   const onSubmit: SubmitHandler<FormData> = () => {
//     setConfirmModal(true)
//   }

//   // Functions
//   const handleAdd = () => {
//     setConfirmModal(false)
//     let listData: any = []
//     for (let i = 0; i < dataRow?.length; i++) {
//       const ele = dataRow[i]?.id
//       console.log('CHECK-ie', ele)
//       console.log('dataRow', dataRow[i])
//       let dataItem = {
//         // PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.[ele]?.['PRODUCT_MAIN_ID'],
//         PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('searchFilters.specificationSetting')?.[ele],
//         PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('searchFilters.specificationSettingNumber')?.[ele],
//         PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: getValues(
//           'searchFilters.specificationSettingVersionRevision'
//         )?.[ele],
//         CUSTOMER_ORDER_FROM_ID: getValues('searchFilters.customerOrderFrom')?.[ele]?.['CUSTOMER_ORDER_FROM_ID'],
//         PRODUCT_PART_NUMBER: getValues('searchFilters.partNumber')?.[ele],
//         CREATE_BY: getUserData()?.EMPLOYEE_CODE,
//         UPDATE_BY: getUserData()?.EMPLOYEE_CODE
//       }
//       listData.push(dataItem)
//     }
//     // ** Data Insert
//     const dataItem = {
//       LIST_DATA: listData
//     }
//     console.log('insertData', dataItem)
//     mutation.mutate(dataItem)
//     queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
//   }

//   const onMutateSuccess = data => {
//     if (data.data && data.data.Status == true) {
//       const message = {
//         message: data.data.Message,
//         title: 'Add Product Main'
//       }
//       // setIsEnableFetching(true)
//       queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
//       ToastMessageSuccess(message)
//       handleClose()
//       // ToastMessageError(message)
//     }
//   }

//   const onMutateError = e => {
//     const message = {
//       title: 'Add Product Main',
//       message: e.message
//     }

//     ToastMessageError(message)
//   }

//   const mutation = useCreateProductType(onMutateSuccess, onMutateError)

//   const onError: SubmitErrorHandler<FormData> = data => {
//     console.log(data)
//   }

//   // Hooks : react-query
//   const queryClient = useQueryClient()

//   const initState: SearchResultTableI = {
//     queryPageIndex: 0,
//     queryPageSize: 10,
//     totalCount: 0,
//     querySortBy: [],
//     withRowBorders: true,
//     withTableBorder: false,
//     withColumnBorders: false,
//     striped: true
//   }

//   return (
//     <>
//       <FormProvider {...reactHookFormMethods}>
//         <Dialog
//           maxWidth='xl'
//           fullWidth={true}
//           onClose={(event, reason) => {
//             if (reason !== 'backdropClick') {
//               handleClose()
//             }
//           }}
//           TransitionComponent={Transition}
//           open={openAddModal}
//           keepMounted
//           sx={{ '&.MuiDialog-paper': { overflow: 'visible' } }}
//         >
//           <DialogTitle id='max-width-dialog-title'>
//             <Typography variant='h5' component='span'>
//               Edit Product Type
//             </Typography>
//             <DialogCloseButton className='mt-4 mr-4 ' onClick={handleClose} disableRipple>
//               <i className='tabler-x' />
//             </DialogCloseButton>
//           </DialogTitle>

//           <DialogContent>
//             <Grid item xs={12}>
//               1{/* <MaterialReactTable table={table} /> */}
//               {/* <ProductTypeDnd
//                 data={dataRow}
//                 setData={setData}
//                 isMessageError={isMessageError}
//                 setIsMessageError={setIsMessageError}
//                 open={open}
//                 setOpen={setOpen}
//               /> */}
//             </Grid>
//             <Grid item xs={12}>
//               2{/* <MaterialReactTable table={table} /> */}
//               {/* <ProductTypeDnd
//                 data={dataRow}
//                 setData={setData}
//                 isMessageError={isMessageError}
//                 setIsMessageError={setIsMessageError}
//                 open={open}
//                 setOpen={setOpen}
//               /> */}
//             </Grid>
//             <Grid item xs={12}>
//               3{/* <MaterialReactTable table={table} /> */}
//               <ProductTypeDnd
//               // data={dataRow}
//               // setData={setData}
//               // isMessageError={isMessageError}
//               // setIsMessageError={setIsMessageError}
//               // open={open}
//               // setOpen={setOpen}
//               />
//             </Grid>
//           </DialogContent>
//           <DialogActions className='mt-4'>
//             <Button
//               onClick={() => {
//                 handleSubmit(onSubmit, onError)()

//                 // setValue('buttonValue', 'save')
//               }}
//               variant='contained'
//             >
//               Save
//             </Button>
//             <Button disabled={dataRow?.length <= 0} onClick={handleClose} variant='tonal' color='secondary'>
//               Close
//             </Button>
//           </DialogActions>
//           <ConfirmModal
//             show={confirmModal}
//             onConfirmClick={handleAdd}
//             onCloseClick={() => setConfirmModal(false)}
//             isDelete={false}
//           />
//         </Dialog>
//       </FormProvider>
//     </>
//   )
// }
// export default ProductTypeAddModal

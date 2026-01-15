//

// // ** Third Party Components
// import { Controller, set, useForm } from 'react-hook-form'
// import AsyncSelect from 'react-select/async'

// import {
//   Badge,
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   CardText,
//   CardTitle,
//   Col,
//   FormFeedback,
//   Input,
//   InputGroup,
//   InputGroupText,
//   Label,
//   ListGroupItem,
//   Row,
//   Spinner
// } from 'reactstrap'

// // import UILoader from '@components/ui-loader'

// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
// // import {
// //   fetchProductMainByLikeProductMainNameAndInuse,
// //   fetchProductMainByLikeProductMainNameAndProductCategoryArrayAndInuse,
// //   fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
// // } from ''
// // import {
// //   fetchProductSubByLikeProductSubNameAndInuse,
// //   fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
// //   fetchProductSubByLikeProductSubNameAndProductMainArrayAndInuse,
// //   fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
// // } from '../../../../components/react-select/fetchProductSub'
// // import {
// //   fetchProductTypeByLikeProductTypeNameAndInuse,
// //   fetchProductTypeByLikeProductTypeNameAndProductSubArrayAndInuse,
// //   fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse,
// //   fetchProductTypeByLikeProductTypeNameAndInuseAndFinishedGoods,
// //   fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods,
// //   fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse,
// //   fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse,
// //   fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods,
// //   fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods
// // } from '../../../../components/react-select/fetchProductType'

// // import { useSearchProductType } from '../../../../utility/hooks/react-query/useProductTypeData'
// import { useSearch, useSearchProductTypeByProductGroup } from '@/_workspace/react-query/hooks/useProductTypeData'
// import { Search, Trash2 } from 'react-feather'
// import { ReactSortable } from 'react-sortablejs'
// import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
// import { useQueryClient } from '@tanstack/react-query'
// // import { useEffect, useRef } from 'react'
// // import { useRef } from 'react'

// const getUrlParamSearch = ({ product }) => {
//   let params = ``

//   params += `  "PRODUCT_CATEGORY_ID":"${product?.productCategory?.PRODUCT_CATEGORY_ID || ''}"`
//   params += `, "PRODUCT_MAIN_ID":"${product?.productMain?.PRODUCT_MAIN_ID || ''}"`
//   params += `, "PRODUCT_SUB_ID":"${product?.productSub?.PRODUCT_SUB_ID || ''}"`
//   params += `, "PRODUCT_TYPE_ID":"${product?.productType?.PRODUCT_TYPE_ID || ''}"`
//   params += `, "PRODUCT_TYPE_NAME":"${product?.searchProductTypeName || ''}"`

//   params = `{${params}}`
//   return params
// }

// const ProductForm = () => {
//   const [productTypeList, setProductTypeList] = useState([])
//   const [productTypeSelectedList, setProductTypeSelectedList] = useState([])
//   const [group, setGroup] = useState([])
//   const [isFetchData, setIsFetchData] = useState(false)
//   const [selectAllActive, setSelectAllActive] = useState(false)
//   const [targetItem, setTargetItem] = useState()

//   const { control, watch, getValues, setValue } = useForm({})

//   const onSuccessSearchData = data => {
//     setIsFetchData(false)

//     if (data?.data && data.data.Status == true) {
//       setProductTypeList(data.data.ResultOnDb)
//     }
//   }

//   const onErrorSearchData = error => {
//     setIsFetchData(false)
//   }

//   const { isLoading, isFetching } = useSearchProductTypeByProductGroup(
//     // onSuccessSearchData,
//     // onErrorSearchData,
//     getUrlParamSearch(getValues()),
//     isFetchData
//   )

//   const queryClient = useQueryClient()

//   const onClickSearch = () => {
//     setIsFetchData(true)
//     queryClient.invalidateQueries('PRODUCT_TYPE_LIST')

//     setSelectAllActive(false)
//     setGroup([])
//   }

//   const onClickClear = () => {
//     setValue('product.productCategory', '')
//     setValue('product.productMain', '')
//     setValue('product.productSub', '')
//     setValue('product.productType', '')
//   }

//   const handleSelectAll = () => {
//     setSelectAllActive(!selectAllActive)

//     if (selectAllActive) {
//       setGroup([])
//     } else {
//       const productTypeUnSelectList = productTypeList.filter(
//         e => !productTypeSelectedList.some(ele => ele.PRODUCT_TYPE_ID == e.PRODUCT_TYPE_ID)
//       )

//       setGroup(productTypeUnSelectList)
//     }
//   }

//   const handleDoubleClick = e => {
//     if (e.detail === 2) {
//       const id = Number(e.target.id)

//       const productType = productTypeList.find(ele => ele.PRODUCT_TYPE_ID === id)

//       if (group.some(e => e.PRODUCT_TYPE_ID === id)) {
//         setProductTypeSelectedList([...group, ...productTypeSelectedList])

//         setGroup([])

//         return
//       }

//       setProductTypeSelectedList([productType, ...productTypeSelectedList])
//     }
//   }

//   useEffect(() => {
//     let dataItem = productTypeSelectedList.map(item => {
//       return item.PRODUCT_TYPE_ID
//     })

//     setValue('product.selectedProductType', dataItem)
//   }, [productTypeSelectedList])

//   const onClickClearSelectedProductType = () => {
//     setProductTypeSelectedList([])
//     setValue('product.selectedProductType', [])
//   }

//   const Loader = () => {
//     return (
//       <>
//         <Spinner />
//         <CardText>Loading ...</CardText>
//       </>
//     )
//   }

//   const dataEndRef = useRef(null)

//   // const scrollToBottom = () => {
//   //   dataEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   // };

//   useEffect(() => {
//     setGroup(prev => {
//       const filtered = prev.filter(
//         element => !productTypeSelectedList.some(ele => ele.PRODUCT_TYPE_ID == element.PRODUCT_TYPE_ID)
//       )

//       return filtered
//     })

//     // scrollToBottom();
//   }, [productTypeSelectedList])

//   return (
//     <>
//       <div className='divider divider-start divider-color-primary-custom' style={{ marginTop: 0 }}>
//         <div className='divider-text text-primary'>Product</div>
//       </div>
//       <Row>
//         <Col md='3' sm='12'>
//           <Label htmlFor='productCategory'>Product Category</Label>
//           <Controller
//             id='productCategory'
//             control={control}
//             name='product.productCategory'
//             render={({ field: { onChange, ...fieldProps } }) => (
//               <AsyncSelect
//                 id='productCategory'
//                 {...fieldProps}
//                 onChange={value => {
//                   onChange(value)
//                   setValue('product.productMain', '')
//                   setValue('product.productSub', '')
//                   setValue('product.productType', '')
//                 }}
//                 // value={field.value}
//                 isClearable
//                 cacheOptions
//                 defaultOptions
//                 loadOptions={data => fetchProductCategoryByLikeProductCategoryNameAndInuse(data)}
//                 getOptionLabel={e => e.PRODUCT_CATEGORY_NAME}
//                 getOptionValue={e => e.PRODUCT_CATEGORY_ID}
//                 className='react-select'
//                 classNamePrefix='select'
//                 // theme={selectThemeColors}
//                 placeholder='Select Product Category ...'
//               />
//             )}
//           />
//         </Col>
//         <Col md='3' sm='12'>
//           <Label htmlFor='productMain'>Product Main</Label>
//           <Controller
//             id='productMain'
//             control={control}
//             name='product.productMain'
//             render={({ field: { onChange, ...fieldProps } }) => (
//               <AsyncSelect
//                 id='productMain'
//                 {...fieldProps}
//                 key={watch('product.productCategory')?.PRODUCT_CATEGORY_ID}
//                 onChange={value => {
//                   onChange(value)
//                   setValue('product.productSub', '')
//                   setValue('product.productType', '')
//                 }}
//                 // value={field.value}
//                 isClearable
//                 cacheOptions
//                 defaultOptions
//                 loadOptions={(value, callback) => {
//                   return getValues('product.productCategory')
//                     ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
//                         value || '',
//                         getValues('product.productCategory').PRODUCT_CATEGORY_ID
//                       )
//                     : fetchProductMainByLikeProductMainNameAndInuse(value || '')
//                 }}
//                 getOptionLabel={e => e.PRODUCT_MAIN_NAME}
//                 getOptionValue={e => e.PRODUCT_MAIN_ID}
//                 className='react-select'
//                 classNamePrefix='select'
//                 // theme={selectThemeColors}
//                 placeholder='Select Product Main ...'
//               />
//             )}
//           />
//         </Col>
//         <Col md='3' sm='12'>
//           <Label htmlFor='productSub'>Product Sub</Label>
//           <Controller
//             id='productSub'
//             control={control}
//             name='product.productSub'
//             render={({ field: { onChange, ...fieldProps } }) => (
//               <AsyncSelect
//                 id='productSub'
//                 {...fieldProps}
//                 key={
//                   watch('product.productCategory')?.PRODUCT_CATEGORY_ID +
//                   '_' +
//                   watch('product.productMain')?.PRODUCT_MAIN_ID
//                 }
//                 onChange={value => {
//                   onChange(value)
//                   setValue('product.productType', '')
//                 }}
//                 // value={field.value}
//                 isClearable
//                 cacheOptions
//                 defaultOptions
//                 loadOptions={(value, callback) => {
//                   if (getValues('product.productMain')?.PRODUCT_MAIN_ID) {
//                     return fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
//                       value || '',
//                       getValues('product.productMain').PRODUCT_MAIN_ID,
//                       '1'
//                     )
//                   } else if (getValues('product.productCategory')?.PRODUCT_CATEGORY_ID) {
//                     return fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
//                       value || '',
//                       getValues('product.productCategory').PRODUCT_CATEGORY_ID,
//                       '1'
//                     )
//                   } else {
//                     return fetchProductSubByLikeProductSubNameAndInuse(value || '', '1')
//                   }
//                 }}
//                 getOptionLabel={e => e.PRODUCT_SUB_NAME}
//                 getOptionValue={e => e.PRODUCT_SUB_ID}
//                 className='react-select'
//                 classNamePrefix='select'
//                 // theme={selectThemeColors}
//                 placeholder='Select Product Sub ...'
//               />
//             )}
//           />
//         </Col>
//         <Col md='3' sm='12'>
//           <Label htmlFor='productType'>Product Type</Label>
//           <Controller
//             id='productType'
//             control={control}
//             name='product.productType'
//             render={({ field: { ...fieldProps } }) => (
//               <>
//                 <AsyncSelect
//                   id='productType'
//                   {...fieldProps}
//                   key={
//                     watch('product.productCategory')?.PRODUCT_CATEGORY_ID +
//                     '_' +
//                     watch('product.productMain')?.PRODUCT_MAIN_ID +
//                     '_' +
//                     watch('product.productSub')?.PRODUCT_SUB_ID
//                   }
//                   // value={field.value}

//                   isClearable
//                   cacheOptions
//                   defaultOptions
//                   loadOptions={(value, callback) => {
//                     if (watch('product.productSub')?.PRODUCT_SUB_ID) {
//                       return fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(
//                         value || '',
//                         watch('product.productSub').PRODUCT_SUB_ID,
//                         '1'
//                       )
//                     } else if (watch('product.productMain')?.PRODUCT_MAIN_ID) {
//                       return fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(
//                         value || '',
//                         watch('product.productMain').PRODUCT_MAIN_ID,
//                         '1'
//                       )
//                     } else if (watch('product.productCategory')?.PRODUCT_CATEGORY_ID) {
//                       return fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(
//                         value || '',
//                         watch('product.productCategory').PRODUCT_CATEGORY_ID,
//                         '1'
//                       )
//                     } else {
//                       return fetchProductTypeByLikeProductTypeNameAndInuseAndFinishedGoods(value || '', '1')
//                     }
//                   }}
//                   getOptionLabel={e => e.PRODUCT_TYPE_NAME}
//                   getOptionValue={e => e.PRODUCT_TYPE_ID}
//                   classNamePrefix='select'
//                   // theme={selectThemeColors}
//                   placeholder='Select Product Type ...'
//                 />
//               </>
//             )}
//           />
//         </Col>
//       </Row>
//       <Row className='mt-1'>
//         <div className='d-flex'>
//           <Button className='me-1' color='primary' onClick={onClickSearch} disabled={isLoading} outline={isLoading}>
//             {isLoading ? (
//               <>
//                 <Spinner size='sm' />
//                 <span className='ms-50'>Searching...</span>
//               </>
//             ) : (
//               <>Search</>
//             )}
//           </Button>
//           <Button outline color='secondary' onClick={onClickClear} disabled={isLoading}>
//             Clear
//           </Button>
//         </div>
//       </Row>

//       <Row className='mt-1'>
//         {/* <UILoader loader={<Loader />}> */}
//         <Row id='dd-with-handle'>
//           <Col md='6' sm='12' className='mb-1'>
//             <div className='border border-input rounded'>
//               <Card style={{ marginBottom: '0' }} className='shadow-none'>
//                 <CardHeader
//                   className='border-bottom border-input mb-1'
//                   style={{ justifyContent: 'center', padding: 12 }}
//                 >
//                   <CardTitle tag='h4'>Product Type List</CardTitle>
//                 </CardHeader>

//                 <CardBody>
//                   <div
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '10px'
//                     }}
//                     className='mb-1'
//                   >
//                     <Input type='checkbox' checked={selectAllActive} onClick={handleSelectAll} />
//                     <InputGroup className='input-group-merge'>
//                       <Controller
//                         defaultValue=''
//                         control={control}
//                         name='product.searchProductTypeName'
//                         render={({ field: { ref, onChange, ...fieldProps } }) => (
//                           <>
//                             <Input
//                               innerRef={ref}
//                               onChange={e => {
//                                 onChange(e)
//                                 setIsFetchData(true)
//                                 queryClient.invalidateQueries('PRODUCT_TYPE_LIST')
//                               }}
//                               placeholder='Search here'
//                               {...fieldProps}
//                               autoComplete='off'
//                             />
//                           </>
//                         )}
//                       />

//                       <InputGroupText>
//                         <Search className='text-muted' size={14} />
//                       </InputGroupText>
//                     </InputGroup>
//                   </div>
//                   {/* <UILoader blocking={isLoading || isFetching} loader={<Loader />}> */}
//                   <ReactSortable
//                     id='searchProcess'
//                     tag='ul'
//                     className='list-group sortable'
//                     group='shared-handle-group'
//                     style={{
//                       height: '435px',
//                       overflowY: 'auto',
//                       overflowX: 'hidden'
//                     }}
//                     list={productTypeList}
//                     setList={data => {
//                       const uniqueProductTypeId = Array.from(new Set(data.map(a => a.PRODUCT_TYPE_ID))).map(
//                         PRODUCT_TYPE_ID => {
//                           return data.find(a => a.PRODUCT_TYPE_ID === PRODUCT_TYPE_ID)
//                         }
//                       )
//                       // console.log(uniqueProductTypeId);
//                       // setProductTypeList(uniqueProductTypeId);
//                     }}
//                     sort={false}
//                   >
//                     {productTypeList.map((item, index) => {
//                       return (
//                         <>
//                           <ListGroupItem
//                             style={{
//                               display: 'flex',
//                               alignItems: 'center'
//                             }}
//                             className='draggable'
//                             key={`${item.PRODUCT_TYPE_ID}`}
//                             disabled={productTypeSelectedList.some(e => e.PRODUCT_TYPE_ID == item.PRODUCT_TYPE_ID)}
//                             id={item.PRODUCT_TYPE_ID}
//                             onDrag={data => {
//                               if (data.target.id != targetItem) {
//                                 setTargetItem(Number(data.target.id))
//                               }
//                             }}
//                             onClick={e => {
//                               handleDoubleClick(e)
//                             }}
//                           >
//                             <Input
//                               id={item.PRODUCT_TYPE_ID}
//                               type='checkbox'
//                               className='me-1'
//                               disabled={productTypeSelectedList.some(e => e.PRODUCT_TYPE_ID == item.PRODUCT_TYPE_ID)}
//                               checked={group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)}
//                               onClick={() => {
//                                 if (group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)) {
//                                   setGroup(group.filter(e => e.PRODUCT_TYPE_ID != item.PRODUCT_TYPE_ID))

//                                   return
//                                 }

//                                 setGroup([item, ...group])
//                                 return
//                               }}
//                             />

//                             <span id={item.PRODUCT_TYPE_ID}>{`${item.PRODUCT_TYPE_NAME}`}</span>
//                           </ListGroupItem>
//                         </>
//                       )
//                     })}
//                   </ReactSortable>
//                   {/* </UILoader> */}
//                 </CardBody>
//               </Card>
//             </div>
//           </Col>
//           {/* Selected Product Type */}
//           <Col md='6' sm='12'>
//             <div className='border border-input rounded'>
//               <Card
//                 style={{
//                   marginBottom: '0'
//                 }}
//                 className='shadow-none'
//               >
//                 <CardHeader
//                   className='border-bottom border-input mb-1'
//                   style={{ justifyContent: 'center', padding: 12 }}
//                 >
//                   <CardTitle tag='h4'>
//                     Selected Product Type <small className='text-secondary'>Drag & Drop</small>
//                   </CardTitle>
//                   <Button className='ms-1' color='danger' size='sm' onClick={onClickClearSelectedProductType}>
//                     Clear All
//                   </Button>
//                 </CardHeader>
//                 <CardBody>
//                   <Controller
//                     control={control}
//                     name='product.selectedProductType'
//                     // rules={{
//                     //   validate: {
//                     //     checkLengthField: (data) => {
//                     //       if (!data || data?.length === 0) {
//                     //         return 'Product Type is required';
//                     //       } else {
//                     //         return true;
//                     //       }
//                     //     },
//                     //   },
//                     // }}
//                     render={({ field: { onChange, value, ...fieldProps } }) => (
//                       <ReactSortable
//                         tag='ul'
//                         className='list-group sortable'
//                         group='shared-handle-group'
//                         id='selectedProductType'
//                         {...fieldProps}
//                         style={{
//                           border:
//                             !productTypeSelectedList || productTypeSelectedList.length === 0
//                               ? '1px dashed ' + (errors?.product?.selectedProductType ? '#E74C3C' : '#7367f0')
//                               : '',
//                           borderRadius: '0.357rem',
//                           display: 'block',
//                           width: '100%',
//                           height: '485px',
//                           overflowY: 'auto'
//                         }}
//                         animation={250}
//                         swapThreshold={0.7}
//                         delayOnTouchStart={true}
//                         delay={2}
//                         swapClass='highlight'
//                         ghostClass='ghost'
//                         list={productTypeSelectedList || []}
//                         setList={data => {
//                           onChange(data)

//                           if (group.some(e => e.PRODUCT_TYPE_ID === targetItem)) {
//                             setProductTypeSelectedList([...productTypeSelectedList, ...group])

//                             setGroup([])

//                             return
//                           }

//                           setProductTypeSelectedList(data)
//                         }}
//                       >
//                         {productTypeSelectedList.map((item, index) => {
//                           return (
//                             <>
//                               <ListGroupItem
//                                 className='draggable'
//                                 key={`${item.PRODUCT_TYPE_ID}`}
//                                 style={{
//                                   display: 'flex',
//                                   alignItems: 'center',
//                                   gap: '16px'
//                                 }}
//                               >
//                                 <Trash2
//                                   color='red'
//                                   onClick={() => {
//                                     queryClient.invalidateQueries('PRODUCT_TYPE_LIST')

//                                     setProductTypeSelectedList(data =>
//                                       data.filter(dataItem => dataItem.PRODUCT_TYPE_ID !== item.PRODUCT_TYPE_ID)
//                                     )
//                                   }}
//                                 />
//                                 <Badge color='primary'>{index + 1} </Badge>
//                                 <div>
//                                   <div>{`${item.PRODUCT_TYPE_NAME}`}</div>
//                                 </div>
//                               </ListGroupItem>

//                               {productTypeSelectedList.length - 1 === index && <div ref={dataEndRef} />}
//                             </>
//                           )
//                         })}
//                       </ReactSortable>
//                     )}
//                   />
//                   {errors?.product?.selectedProductType && (
//                     <FormText color='danger' style={{ margin: 0 }}>
//                       {errors?.product?.selectedProductType.message}
//                     </FormText>
//                   )}
//                 </CardBody>
//               </Card>
//             </div>
//           </Col>
//         </Row>
//         {/* </UILoader> */}
//       </Row>

//       {/* <div
//         className='divider divider-start divider-color-primary-custom'
//         style={{ marginTop: 0 }}
//       >
//         <div className='divider-text text-primary'>Product</div>
//       </div>
//       <Col
//         md='3'
//         sm='12'
//       >
//         <Label htmlFor='productCategory'>Product Category</Label>
//         <Controller
//           id='productCategory'
//           control={control}
//           name='product.productCategory'
//           render={({ field: { onChange, ...fieldProps } }) => (
//             <AsyncSelect
//               id='productCategory'
//               {...fieldProps}
//               onChange={(value) => {
//                 if (value.length === 0) {
//                   setValue('product.productMain', []);
//                   setValue('product.productSub', []);
//                   setValue('product.productType', []);
//                 }

//                 setValue('product.productCategory', value);
//               }}
//               // value={field.value}
//               isMulti
//               isClearable
//               cacheOptions
//               defaultOptions
//               loadOptions={(data) => fetchProductCategoryByLikeProductCategoryNameAndInuse(data)}
//               getOptionLabel={(e) => e.PRODUCT_CATEGORY_NAME}
//               getOptionValue={(e) => e.PRODUCT_CATEGORY_ID}
//               className='react-select'
//               classNamePrefix='select'
//               theme={selectThemeColors}
//               placeholder='Select Product Category ...'
//             />
//           )}
//         />
//       </Col>
//       <Col
//         md='3'
//         sm='12'
//       >
//         <Label htmlFor='productMain'>Product Main</Label>
//         <Controller
//           id='productMain'
//           control={control}
//           name='product.productMain'
//           render={({ field: { onChange, ...fieldProps } }) => (
//             <AsyncSelect
//               id='productMain'
//               {...fieldProps}
//               key={watch('product.productCategory')}
//               onChange={(value) => {
//                 if (value.length === 0) {
//                   setValue('product.productSub', []);
//                   setValue('product.productType', []);
//                 }

//                 setValue('product.productMain', value);
//               }}
//               // value={field.value}
//               isMulti
//               isClearable
//               cacheOptions
//               defaultOptions
//               loadOptions={(value) => {
//                 if (getValues('product.productCategory')?.length > 0) {
//                   return fetchProductMainByLikeProductMainNameAndProductCategoryArrayAndInuse(
//                     value || '',
//                     getValues('product.productCategory')
//                   ).then((data) => {
//                     setValue('product.productMain', data);
//                     return data;
//                   });
//                 } else {
//                   return fetchProductMainByLikeProductMainNameAndProductCategoryArrayAndInuse(
//                     value || '',
//                     getValues('product.productCategory')
//                   );
//                 }
//               }}
//               getOptionLabel={(e) => e.PRODUCT_MAIN_NAME}
//               getOptionValue={(e) => e.PRODUCT_MAIN_ID}
//               className='react-select'
//               classNamePrefix='select'
//               theme={selectThemeColors}
//               placeholder='Select Product Main ...'
//             />
//           )}
//         />
//       </Col>
//       <Col
//         md='3'
//         sm='12'
//       >
//         <Label htmlFor='productSub'>Product Sub</Label>
//         <Controller
//           id='productSub'
//           control={control}
//           name='product.productSub'
//           render={({ field: { onChange, ...fieldProps } }) => (
//             <AsyncSelect
//               id='productSub'
//               {...fieldProps}
//               key={watch('product.productMain')}
//               onChange={(value) => {
//                 if (value.length === 0) {
//                   setValue('product.productType', []);
//                 }

//                 setValue('product.productSub', value);
//               }}
//               // value={field.value}
//               isMulti
//               isClearable
//               cacheOptions
//               defaultOptions
//               loadOptions={(value) => {
//                 if (getValues('product.productMain')?.length > 0) {
//                   return fetchProductSubByLikeProductSubNameAndProductMainArrayAndInuse(
//                     value || '',
//                     getValues('product.productMain')
//                   ).then((data) => {
//                     setValue('product.productSub', data);
//                     return data;
//                   });
//                 } else {
//                   return fetchProductSubByLikeProductSubNameAndProductMainArrayAndInuse(
//                     value || '',
//                     getValues('product.productMain')
//                   );
//                 }
//               }}
//               getOptionLabel={(e) => e.PRODUCT_SUB_NAME}
//               getOptionValue={(e) => e.PRODUCT_SUB_ID}
//               className='react-select'
//               classNamePrefix='select'
//               theme={selectThemeColors}
//               placeholder='Select Product Sub ...'
//             />
//           )}
//         />
//       </Col>
//       <Col
//         md='3'
//         sm='12'
//       >
//         <Label htmlFor='productType'>Product Type</Label>
//         <Controller
//           id='productType'
//           control={control}
//           name='product.productType'
//           rules={{ required: 'Product Type is required' }}
//           render={({ field: { onChange, ...fieldProps } }) => (
//             <>
//               <AsyncSelect
//                 id='productType'
//                 {...fieldProps}
//                 key={watch('product.productSub')}
//                 onChange={(value) => {
//                   setValue('product.productType', value, {
//                     shouldValidate: true,
//                     shouldDirty: true,
//                   });
//                 }}
//                 // value={field.value}
//                 isMulti
//                 isClearable
//                 cacheOptions
//                 defaultOptions
//                 loadOptions={(value) => {
//                   if (getValues('product.productSub')?.length > 0) {
//                     return fetchProductTypeByLikeProductTypeNameAndProductSubArrayAndInuse(
//                       value || '',
//                       getValues('product.productSub')
//                     ).then((data) => {
//                       setValue('product.productType', data);
//                       return data;
//                     });
//                   } else {
//                     return fetchProductTypeByLikeProductTypeNameAndProductSubArrayAndInuse(
//                       value || '',
//                       getValues('product.productSub')
//                     );
//                   }
//                 }}
//                 getOptionLabel={(e) => e.PRODUCT_TYPE_NAME}
//                 getOptionValue={(e) => e.PRODUCT_TYPE_ID}
//                 classNamePrefix='select'
//                 theme={selectThemeColors}
//                 placeholder='Select Product Type ...'
//                 className={classnames('react-select', {
//                   'is-invalid': errors?.product?.productType,
//                 })}
//               />
//               {errors?.product?.productType && (
//                 <FormFeedback type='invalid'>{errors.product.productType.message}</FormFeedback>
//               )}
//             </>
//           )}
//         />
//       </Col> */}

// <Grid container spacing={2} mt={5} ml={70}>
//           {/* Available Product Types */}
//           <Box width={400}>
//             <Card variant='outlined'>
//               <Checkbox
//                 checked={selectAllActive}
//                 onChange={handleSelectAll}
//                 inputProps={{ 'aria-label': 'Select all' }}
//                 sx={{
//                   top: 46,
//                   left: 103
//                 }}
//               />
//               <CardHeader
//                 title={
//                   <Typography variant='h6' align='center'>
//                     Product Type List
//                   </Typography>
//                 }
//               />
//               <CardContent>
//                 <List
//                   sx={{
//                     maxHeight: 500,
//                     overflowY: 'auto',
//                     // border: '2px dashed #ccc',
//                     padding: 2,
//                     borderRadius: '4px'
//                   }}
//                   onDrop={e => handleDrop(e, 'available')}
//                   onDragOver={allowDrop}
//                 >
//                   {productTypeList.map(item => (
//                     <ListItem
//                       id={item.PRODUCT_TYPE_ID}
//                       key={item.PRODUCT_TYPE_ID}
//                       draggable
//                       // onDragStart={e => handleDragStart(e, item)}
//                       onDragStart={e => {
//                         if (!productTypeSelectedList.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)) {
//                           handleDragStart(e, item) //ถ้า
//                         } else {
//                           e.preventDefault() // productTypeSelectedList
//                         }
//                       }}
//                       sx={{
//                         cursor: 'grab',
//                         '&:active': { cursor: 'grabbing' },
//                         // backgroundColor: '#f5f5f5',
//                         marginBottom: 1,
//                         borderBottom: '1px solid #ccc'
//                       }}
//                       disabled={productTypeSelectedList.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)}
//                       onClick={e => {
//                         e.target.id = Number(item?.PRODUCT_TYPE_ID)
//                         handleDoubleClick(e)
//                       }}
//                     >
//                       <Checkbox
//                         checked={group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)}
//                         disabled={productTypeSelectedList.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)}
//                         onClick={() => {
//                           if (group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)) {
//                             setGroup(group.filter(e => e.PRODUCT_TYPE_ID != item.PRODUCT_TYPE_ID))

//                             return
//                           }

//                           setGroup([item, ...group])
//                           return
//                         }}
//                       />
//                       <ListItemText primary={item.PRODUCT_TYPE_NAME} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Box>

//           {/* Selected Product Types */}
//           <Box ml={4} width={400}>
//             <Card>
//               <CardHeader
//                 title={
//                   <Box display='flex' justifyContent='space-between' alignItems='center'>
//                     <Typography variant='h6'>Selected Product Types</Typography>
//                     <Button
//                       variant='contained'
//                       color='error'
//                       size='small'
//                       onClick={() => {
//                         setProductTypeSelectedList([])
//                       }}
//                     >
//                       Clear All
//                     </Button>
//                   </Box>
//                 }
//               />
//               <Divider />
//               <CardContent>
//                 <List
//                   sx={{
//                     minHeight: '300px',
//                     overflowY: 'auto',
//                     border: '2px dashed #ccc',
//                     padding: 2,
//                     borderRadius: '4px'
//                   }}
//                   onDrop={e => handleDrop(e, 'selected')}
//                   onDragOver={allowDrop}
//                 >
//                   {productTypeSelectedList.map((item, index) => (
//                     <ListItem
//                       key={item.PRODUCT_TYPE_ID}
//                       // draggable
//                       // onDragStart={e => handleDragStart(e, item)}
//                       sx={{
//                         // cursor: 'grab',
//                         // '&:active': { cursor: 'grabbing' },
//                         backgroundColor: '#e0f7fa',
//                         marginBottom: 1,
//                         borderRadius: '4px'
//                       }}
//                     >
//                       <ListItemIcon>
//                         <Trash2
//                           // sx={{ marginRight: 2 }}
//                           color='red'
//                           onClick={() => {
//                             queryClient.invalidateQueries('PRODUCT_TYPE_LIST')

//                             setProductTypeSelectedList(data =>
//                               data.filter(dataItem => dataItem.PRODUCT_TYPE_ID !== item.PRODUCT_TYPE_ID)
//                             )
//                           }}
//                         />
//                         <Badge badgeContent={index + 1} color='secondary' sx={{ marginRight: 2, marginLeft: 2 }} />
//                       </ListItemIcon>
//                       <ListItemText primary={item.PRODUCT_TYPE_NAME} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </CardContent>
//             </Card>
//           </Box>
//         </Grid>
//       </Grid>

//     </>
//   )
// }

// export default ProductForm

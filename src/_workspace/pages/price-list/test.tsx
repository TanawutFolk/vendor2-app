import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

import SearchIcon from '@mui/icons-material/Search'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  TablePagination,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  darken,
  lighten,
  useTheme
} from '@mui/material'

import {
  Control,
  Controller,
  SubmitHandler,
  useFormContext,
  UseFormGetFieldState,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import { fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import { useSearch, useSearchProductTypeByProductGroup } from '@/_workspace/react-query/hooks/useProductTypeData'

//or use your library of choice here

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

type ProductType = {
  PRODUCT_TYPE_ID: number
  PRODUCT_TYPE_NAME: string
}

const getUrlParamSearch = ({ product }) => {
  return {
    PRODUCT_CATEGORY_ID: product?.productCategory?.PRODUCT_CATEGORY_ID || '',
    PRODUCT_MAIN_ID: product?.productMain?.PRODUCT_MAIN_ID || '',
    PRODUCT_SUB_ID: product?.productSub?.PRODUCT_SUB_ID || '',
    PRODUCT_TYPE_ID: product?.productType?.PRODUCT_TYPE_ID || '',
    PRODUCT_TYPE_CODE: '',
    PRODUCT_TYPE_NAME: product?.searchProductTypeName || ''
  }
}

function ProductForm({ getValues, control, setValue, watch, errors, handleSubmit }: any) {
  // react-hook-form

  // States
  const [productTypeList, setProductTypeList] = useState([])
  const [productTypeSelectedList, setProductTypeSelectedList] = useState([])
  const [group, setGroup] = useState<ProductType[]>([])
  const [isFetchData, setIsFetchData] = useState(false)
  const [selectAllActive, setSelectAllActive] = useState(false)
  const [targetItem, setTargetItem] = useState()

  // const handleDragEnd = result => {
  //   const { source, destination, draggableId } = result
  //   console.log('result:', result)
  //   console.log('Source:', source)
  //   console.log('Destination:', destination)
  //   console.log('Product Type List:', productTypeList)
  //   console.log('Selected Product Type List:', productTypeSelectedList)
  //   // หากไม่มีปลายทาง ให้หยุดทำงาน
  //   if (!destination) return

  //   // แปลง `draggableId` เป็นตัวเลข
  //   const id = Number(draggableId)

  //   // ลากจาก `productTypeList` ไป `productTypeSelectedList`
  //   if (source.droppableId === 'productTypeList' && destination.droppableId === 'productTypeSelectedList') {
  //     const productType = productTypeList.find(item => item.PRODUCT_TYPE_ID === id)

  //     if (!productType) return

  //     // ลบ item จาก `productTypeList`
  //     const updatedProductTypeList = productTypeList.filter(item => item.PRODUCT_TYPE_ID !== id)

  //     // เพิ่ม item ไปยัง `productTypeSelectedList`
  //     setProductTypeList(updatedProductTypeList)
  //     setProductTypeSelectedList([productType, ...productTypeSelectedList])
  //   }

  //   // ลากจาก `productTypeSelectedList` ไป `productTypeList`
  //   if (source.droppableId === 'productTypeSelectedList' && destination.droppableId === 'productTypeList') {
  //     const productType = productTypeSelectedList.find(item => item.PRODUCT_TYPE_ID === id)

  //     if (!productType) return

  //     // ลบ item จาก `productTypeSelectedList`
  //     const updatedSelectedList = productTypeSelectedList.filter(item => item.PRODUCT_TYPE_ID !== id)

  //     // เพิ่ม item ไปยัง `productTypeList`
  //     setProductTypeSelectedList(updatedSelectedList)
  //     setProductTypeList([productType, ...productTypeList])
  //   }
  // }

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result
    if (!destination) return // No drop destination, return early

    const id = Number(draggableId) // Get the ID of the dragged item

    if (source.droppableId === 'productTypeList' && destination.droppableId === 'productTypeSelectedList') {
      const productType = productTypeList.find(item => item.PRODUCT_TYPE_ID === id)
      if (!productType) return

      setProductTypeList(productTypeList.filter(item => item.PRODUCT_TYPE_ID !== id))
      setProductTypeSelectedList([productType, ...productTypeSelectedList])
    }

    if (source.droppableId === 'productTypeSelectedList' && destination.droppableId === 'productTypeList') {
      const productType = productTypeSelectedList.find(item => item.PRODUCT_TYPE_ID === id)
      if (!productType) return

      setProductTypeSelectedList(productTypeSelectedList.filter(item => item.PRODUCT_TYPE_ID !== id))
      setProductTypeList([productType, ...productTypeList])
    }
  }

  const onSuccessSearchData = (data: any) => {
    setIsFetchData(false)

    if (data?.data && data.data.Status == true) {
      setProductTypeList(data.data.ResultOnDb)
    }
    // console.log(data.data.ResultOnDb)
  }

  const onErrorSearchData = (error: any) => {
    setIsFetchData(false)
  }

  const { data, isLoading, isFetching } = useSearchProductTypeByProductGroup(
    getUrlParamSearch(getValues()),
    isFetchData
  )

  const queryClient = useQueryClient()

  const onResetFormSearch = () => {
    setValue('product.productCategory', '')
    setValue('product.productMain', '')
    setValue('product.productSub', '')
    setValue('product.productType', '')
  }

  const onClickSearch = () => {
    setIsFetchData(true)
    queryClient.invalidateQueries({ queryKey: ['PRODUCT_TYPE_LIST'] })

    setSelectAllActive(false)
    setGroup([])
  }

  useEffect(() => {
    setIsFetchData(false)
    if (data?.data && data.data.Status == true) {
      setProductTypeList(data?.data?.ResultOnDb)
    }
    console.log('productTypeList', productTypeList)
  }, [isFetching])

  const handleSelectAll = () => {
    setSelectAllActive(!selectAllActive)

    if (selectAllActive) {
      setGroup([])
    } else {
      // const productTypeUnSelectList = productTypeList.filter(
      const productTypeUnSelectList = data?.data?.ResultOnDb.filter(
        e => !productTypeSelectedList.some(ele => ele.PRODUCT_TYPE_ID == e.PRODUCT_TYPE_ID)
      )

      setGroup(productTypeUnSelectList)
    }
  }

  const handleDoubleClick = (e: any) => {
    console.log(e.detail)

    if (e.detail == 2) {
      const id = Number(e.target.id)
      console.log('id', id)
      // const productType = data?.data?.ResultOnDb.find(ele => ele?.PRODUCT_TYPE_ID === id)
      const productType = data?.data?.ResultOnDb.find(ele => ele.PRODUCT_TYPE_ID == id)

      if (!productType) {
        return
      }

      if (group.some(e => e?.PRODUCT_TYPE_ID === id)) {
        setProductTypeSelectedList([...group, ...productTypeSelectedList])

        setGroup([])

        return
      }

      setProductTypeSelectedList([productType, ...productTypeSelectedList])
    }
  }

  useEffect(() => {
    let dataItem = productTypeSelectedList.map(item => {
      return item.PRODUCT_TYPE_ID
    })

    setValue('product.selectedProductType', dataItem)
  }, [productTypeSelectedList])

  useEffect(() => {
    if (isFetchData) {
      setProductTypeList([...productTypeList]) // Update productTypeList with fetched data
    }
  }, [isFetchData])

  const onClickClearSelectedProductType = () => {
    setProductTypeSelectedList([])
    setValue('product.selectedProductType', [])
  }

  const dataEndRef = useRef(null)

  // const scrollToBottom = () => {
  //   dataEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  useEffect(() => {
    setGroup(prev => {
      const filtered = prev.filter(
        element => !productTypeSelectedList.some(ele => ele.PRODUCT_TYPE_ID == element.PRODUCT_TYPE_ID)
      )

      return filtered
    })

    // scrollToBottom();
  }, [productTypeSelectedList])

  return (
    <>
      {/* {JSON.stringify(data)} */}
      {/* <div className='divider divider-start divider-color-primary-custom' style={{ marginTop: 0 }}>
        <div className='divider-text text-primary'>Product</div>
      </div> */}

      <Grid item xs={12}>
        <Divider textAlign='left'>
          <Typography variant='h6' color='primary'>
            Product
          </Typography>
        </Divider>
      </Grid>

      {/* <Grid item xs={20}>
        {' '}
        <br />
      </Grid> */}
      {/* <Card style={{ overflow: 'visible' }}> */}
      {/* <CardContent> */}
      <Grid container className='mbs-0' spacing={6}>
        <Grid item xs={12} sm={4} lg={3}>
          <Controller
            // id='productCategory'
            control={control}
            name='product.productCategory'
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom
                label='Product Category'
                id='productCategory'
                {...fieldProps}
                onChange={value => {
                  onChange(value)
                  setValue('product.productMain', '')
                  setValue('product.productSub', '')
                  setValue('product.productType', '')
                }}
                // value={field.value}
                isClearable
                cacheOptions
                defaultOptions
                loadOptions={data => fetchProductCategoryByLikeProductCategoryNameAndInuse(data)}
                getOptionLabel={e => e.PRODUCT_CATEGORY_NAME}
                getOptionValue={e => e.PRODUCT_CATEGORY_ID}
                className='react-select'
                classNamePrefix='select'
                // theme={selectThemeColors}
                placeholder='Select Product Category ...'
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} lg={3}>
          <Controller
            // id='productMain'
            control={control}
            name='product.productMain'
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom
                label='Product Main'
                id='productMain'
                {...fieldProps}
                key={watch('product.productCategory')?.PRODUCT_CATEGORY_ID}
                onChange={value => {
                  onChange(value)
                  setValue('product.productSub', '')
                  setValue('product.productType', '')
                }}
                // value={field.value}
                isClearable
                cacheOptions
                defaultOptions
                loadOptions={(value, callback) => {
                  return getValues('product.productCategory')
                    ? fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse(
                        value || '',
                        1,
                        getValues('product.productCategory').PRODUCT_CATEGORY_ID
                      )
                    : fetchProductMainByLikeProductMainNameAndInuse(value || '', 1)
                }}
                getOptionLabel={e => e.PRODUCT_MAIN_NAME}
                getOptionValue={e => e.PRODUCT_MAIN_ID}
                className='react-select'
                classNamePrefix='select'
                // theme={selectThemeColors}
                placeholder='Select Product Main ...'
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} lg={3}>
          <Controller
            // id='productSub'
            control={control}
            name='product.productSub'
            render={({ field: { onChange, ...fieldProps } }) => (
              <AsyncSelectCustom
                label='Product Sub'
                id='productSub'
                {...fieldProps}
                key={
                  watch('product.productCategory')?.PRODUCT_CATEGORY_ID +
                  '_' +
                  watch('product.productMain')?.PRODUCT_MAIN_ID
                }
                onChange={value => {
                  onChange(value)
                  setValue('product.productType', '')
                }}
                // value={field.value}
                isClearable
                cacheOptions
                defaultOptions
                loadOptions={(value, callback) => {
                  if (getValues('product.productMain')?.PRODUCT_MAIN_ID) {
                    return fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse(
                      value || '',
                      getValues('product.productMain').PRODUCT_MAIN_ID,
                      1
                    )
                  } else if (getValues('product.productCategory')?.PRODUCT_CATEGORY_ID) {
                    return fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse(
                      value || '',
                      getValues('product.productCategory').PRODUCT_CATEGORY_ID,
                      1
                    )
                  } else {
                    return fetchProductSubByLikeProductSubNameAndInuse(value || '', 1)
                  }
                }}
                getOptionLabel={(e: any) => e.PRODUCT_SUB_NAME}
                getOptionValue={(e: any) => e.PRODUCT_SUB_ID}
                className='react-select'
                classNamePrefix='select'
                // theme={selectThemeColors}
                placeholder='Select Product Sub ...'
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4} lg={3}>
          <Controller
            id='productType'
            control={control}
            name='product.productType'
            render={({ field: { ...fieldProps } }) => (
              <>
                <AsyncSelectCustom
                  label='Product Type'
                  id='productType'
                  {...fieldProps}
                  key={
                    watch('product.productCategory')?.PRODUCT_CATEGORY_ID +
                    '_' +
                    watch('product.productMain')?.PRODUCT_MAIN_ID +
                    '_' +
                    watch('product.productSub')?.PRODUCT_SUB_ID
                  }
                  // value={field.value}
                  isClearable
                  cacheOptions
                  defaultOptions
                  loadOptions={(value, callback) => {
                    if (watch('product.productSub')?.PRODUCT_SUB_ID) {
                      return fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse(
                        value || '',
                        watch('product.productSub').PRODUCT_SUB_ID,
                        1
                      )
                    } else if (watch('product.productMain')?.PRODUCT_MAIN_ID) {
                      return fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                        value || '',
                        watch('product.productMain').PRODUCT_MAIN_ID,
                        1
                      )
                    } else if (watch('product.productCategory')?.PRODUCT_CATEGORY_ID) {
                      return fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse(
                        value || '',
                        watch('product.productCategory').PRODUCT_CATEGORY_ID,
                        1
                      )
                    } else {
                      return fetchProductTypeByLikeProductTypeNameAndInuse(value || '', 1)
                    }
                  }}
                  getOptionLabel={e => e.PRODUCT_TYPE_NAME}
                  getOptionValue={e => e.PRODUCT_TYPE_ID}
                  classNamePrefix='select'
                  // theme={selectThemeColors}
                  placeholder='Select Product Type ...'
                />
              </>
            )}
          />
        </Grid>

        <Grid item xs={12} className='flex gap-4'>
          <Button
            // onClick={() => handleSubmit(onSubmit, onError)()}
            onClick={onClickSearch}
            variant='contained'
            type='button'
          >
            Search
          </Button>
          <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
            Clear
          </Button>
        </Grid>

        {/*--------------------------------------------------- table -------------------------------------------*/}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid container spacing={2} mt={5} ml={70}>
            <Box width={400}>
              <Card variant='outlined'>
                <CardHeader
                  title={
                    <Typography variant='h6' align='center'>
                      Product Type List
                    </Typography>
                  }
                />
                <CardContent>
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Checkbox
                      checked={selectAllActive}
                      onChange={handleSelectAll}
                      inputProps={{ 'aria-label': 'Select all' }}
                    />
                    <Controller
                      name='product.searchProductTypeName'
                      control={control}
                      defaultValue=''
                      render={({ field: { ref, onChange, ...fieldProps } }) => (
                        <TextField
                          inputRef={ref}
                          onChange={e => {
                            onChange(e)
                            setIsFetchData(true)
                            queryClient.invalidateQueries({ queryKey: ['PRODUCT_TYPE_LIST'] })
                          }}
                          // onChange={e => handleSearchChange(e, onChange)}
                          placeholder='Search here'
                          variant='outlined'
                          size='small'
                          fullWidth
                          {...fieldProps}
                          InputProps={{
                            endAdornment: (
                              <IconButton>
                                <SearchIcon />
                              </IconButton>
                            )
                          }}
                        />
                      )}
                    />
                  </Box>

                  {isLoading || isFetching ? (
                    <Box display='flex' justifyContent='center' mt={2}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Droppable droppableId='productTypeList' key='productTypeList'>
                      {provided => {
                        console.log('Rendering Droppable: productTypeList')
                        return (
                          <List
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            sx={{ maxHeight: 500, overflow: 'auto' }}
                          >
                            {productTypeList.map((item, index) => (
                              <Draggable
                                key={item.PRODUCT_TYPE_ID}
                                draggableId={item.PRODUCT_TYPE_ID.toString()}
                                index={index}
                              >
                                {provided => (
                                  <ListItem
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      cursor: 'grab',
                                      '&:active': {
                                        cursor: 'grabbing'
                                      }
                                    }}
                                    // key={item?.PRODUCT_TYPE_ID}
                                    // id={item?.PRODUCT_TYPE_ID}
                                    divider
                                    disabled={productTypeSelectedList.some(
                                      e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID
                                    )}
                                    onClick={e => {
                                      e.target.id = Number(item?.PRODUCT_TYPE_ID)
                                      handleDoubleClick(e)
                                    }}
                                  >
                                    <Checkbox
                                      checked={group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)}
                                      disabled={productTypeSelectedList.some(
                                        e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID
                                      )}
                                      onClick={() => {
                                        if (group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)) {
                                          setGroup(group.filter(e => e.PRODUCT_TYPE_ID != item.PRODUCT_TYPE_ID))

                                          return
                                        }

                                        setGroup([item, ...group])
                                        return
                                      }}
                                    />
                                    <ListItemText primary={item.PRODUCT_TYPE_NAME} />
                                  </ListItem>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </List>
                        )
                      }}
                    </Droppable>
                  )}
                </CardContent>
              </Card>
            </Box>
            {/* Selected Product Type */}
            <Box ml={4} width={450}>
              <Card>
                <CardHeader
                  title={
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      Selected Product Type
                      <Button
                        variant='contained'
                        color='error'
                        size='small'
                        onClick={() => setProductTypeSelectedList([])}
                      >
                        Clear All
                      </Button>
                    </Box>
                  }
                />
                <Divider />
                <CardContent>
                  <Droppable droppableId='productTypeSelectedList' key='productTypeSelectedList'>
                    {(provided: any) => {
                      console.log('Rendering Droppable: productTypeSelectedList')
                      return (
                        <List
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          sx={{
                            minHeight: '300px',
                            overflowY: 'auto',
                            width: '100%',
                            height: '400px',
                            padding: '18px',
                            border: '2px dashed #ccc',
                            borderRadius: '4px'
                          }}
                        >
                          {productTypeSelectedList.map((item, index) => (
                            <Draggable
                              key={item.PRODUCT_TYPE_ID}
                              draggableId={item.PRODUCT_TYPE_ID.toString()}
                              index={index}
                            >
                              {(provided: any) => (
                                <ListItem
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  // divider
                                >
                                  <ListItemIcon sx={{ marginRight: 2 }}>
                                    <Badge badgeContent={index + 1} color='primary' />
                                  </ListItemIcon>
                                  <ListItemText primary={item.PRODUCT_TYPE_NAME} />
                                </ListItem>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </List>
                      )
                    }}
                  </Droppable>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </DragDropContext>
      </Grid>
    </>
  )
}

export default ProductForm

import {
  // Badge,
  // Button,
  // Card,
  CardBody,
  // CardHeader,
  CardText,
  CardTitle,
  Col,
  FormFeedback,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  ListGroupItem,
  Row,
  Spinner
} from 'reactstrap'
import { ReactSortable } from 'react-sortablejs'
// import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Search, Trash2 } from 'react-feather'
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
  fetchProductTypeByLikeProductTypeNameAndInuseForPriceList,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import {
  useSearch,
  useSearchProductTypeByProductGroup,
  useSearchProductTypeList
} from '@/_workspace/react-query/hooks/useProductTypeData'

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

function ProductForm({
  getValues,
  control,
  setValue,
  watch,
  errors,
  handleSubmit,
  setProductTypeList,
  productTypeList,
  setProductTypeSelectedList,
  productTypeSelectedList,
  setGroup,
  group
}: any) {
  // react-hook-form

  // States
  // const [productTypeList, setProductTypeList] = useState([])
  // const [productTypeSelectedList, setProductTypeSelectedList] = useState([])
  // const [group, setGroup] = useState<ProductType[]>([])
  const [isFetchData, setIsFetchData] = useState(false)
  const [selectAllActive, setSelectAllActive] = useState(false)
  const [targetItem, setTargetItem] = useState()

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

  const { data, isLoading, isFetching } = useSearchProductTypeList(getUrlParamSearch(getValues()), isFetchData)

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
        setSelectAllActive(false)

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

  const dataEndRef = useRef(null)

  useEffect(() => {
    setGroup(prev => {
      const filtered = prev.filter(
        element => !productTypeSelectedList.some(ele => ele.PRODUCT_TYPE_ID == element.PRODUCT_TYPE_ID)
      )

      return filtered
    })
  }, [productTypeSelectedList])

  return (
    <>
      <Grid item xs={12}>
        <Divider textAlign='left'>
          <Typography variant='h6' color='primary'>
            Product
          </Typography>
        </Divider>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={4} lg={4}>
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
                isClearable
                cacheOptions
                defaultOptions
                loadOptions={data => fetchProductCategoryByLikeProductCategoryNameAndInuse(data)}
                getOptionLabel={e => e.PRODUCT_CATEGORY_NAME}
                getOptionValue={e => e.PRODUCT_CATEGORY_ID}
                className='react-select'
                classNamePrefix='select'
                placeholder='Select Product Category ...'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4} lg={4}>
          <Controller
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
        <Grid item xs={12} sm={4} lg={4}>
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
        {/* <Grid container item xs={12} spacing={4} mt={4}> */}
        <Grid item xs={12} sm={6} lg={4}>
          <Controller
            id='productType'
            control={control}
            name='product.productType'
            render={({ field: { ...fieldProps } }) => (
              <>
                <AsyncSelectCustom
                  label='Product Type Code'
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
                      // return fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse
                      return fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(
                        value || '',
                        watch('product.productSub').PRODUCT_SUB_ID,
                        1
                      )
                    } else if (watch('product.productMain')?.PRODUCT_MAIN_ID) {
                      return fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(
                        value || '',
                        watch('product.productMain').PRODUCT_MAIN_ID,
                        1
                      )
                    } else if (watch('product.productCategory')?.PRODUCT_CATEGORY_ID) {
                      // return fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse
                      return fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(
                        value || '',
                        watch('product.productCategory').PRODUCT_CATEGORY_ID,
                        1
                      )
                    } else {
                      return fetchProductTypeByLikeProductTypeNameAndInuseForPriceList(value || '', 1)
                    }
                  }}
                  getOptionLabel={e => e.PRODUCT_TYPE_CODE_FOR_SCT}
                  getOptionValue={e => e.PRODUCT_TYPE_ID}
                  classNamePrefix='select'
                  // theme={selectThemeColors}
                  placeholder='Select Product Type ...'
                />
              </>
            )}
          />
        </Grid>
        <Grid item xs={20} sm={8}>
          <Controller
            id='productType'
            control={control}
            name='product.productType'
            render={({ field: { ...fieldProps } }) => (
              <>
                <AsyncSelectCustom
                  label='Product Type Name'
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
                      // return fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse
                      return fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuseAndFinishedGoods(
                        value || '',
                        watch('product.productSub').PRODUCT_SUB_ID,
                        1
                      )
                    } else if (watch('product.productMain')?.PRODUCT_MAIN_ID) {
                      return fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuseAndFinishedGoods(
                        value || '',
                        watch('product.productMain').PRODUCT_MAIN_ID,
                        1
                      )
                    } else if (watch('product.productCategory')?.PRODUCT_CATEGORY_ID) {
                      // return fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse
                      return fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuseAndFinishedGoods(
                        value || '',
                        watch('product.productCategory').PRODUCT_CATEGORY_ID,
                        1
                      )
                    } else {
                      return fetchProductTypeByLikeProductTypeNameAndInuseForPriceList(value || '', 1)
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
        </Grid>{' '}
      </Grid>
      {/* </Grid> */}
      {/*--------------------------------------------------- table2 -------------------------------------------*/}

      <Grid container spacing={3} mt={5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              sx={{ border: '1px solid #ccc', borderBottom: 'none' }}
              title={
                <Typography variant='h6' align='center'>
                  Product Type List
                </Typography>
              }
            />
            <Divider />
            <CardContent sx={{ border: '1px solid #ccc' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
                className='mb-1'
              >
                <Checkbox checked={selectAllActive} onClick={handleSelectAll} />
                <InputGroup className='input-group-merge'>
                  <Controller
                    defaultValue=''
                    control={control}
                    name='product.searchProductTypeName'
                    render={({ field: { ref, onChange, ...fieldProps } }) => (
                      <>
                        <TextField
                          style={{ width: 470 }}
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
                      </>
                    )}
                  />
                </InputGroup>
              </div>

              <ReactSortable
                id='searchProcess'
                tag='ul'
                className='list-group sortable'
                group='shared-handle-group'
                style={{
                  height: '435px',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}
                list={productTypeList}
                setList={data => {
                  const uniqueProductTypeId = Array.from(new Set(data.map(a => a.PRODUCT_TYPE_ID))).map(
                    PRODUCT_TYPE_ID => {
                      return data.find(a => a.PRODUCT_TYPE_ID === PRODUCT_TYPE_ID)
                    }
                  )
                }}
                sort={false}
              >
                {productTypeList.map((item, index) => {
                  return (
                    <>
                      <ListItem
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          cursor: 'grab',
                          '&:active': { cursor: 'grabbing' },
                          borderBottom: '1px solid #ccc',
                          alignItems: 'center'
                        }}
                        className='draggable'
                        key={`${item.PRODUCT_TYPE_ID}`}
                        disabled={productTypeSelectedList.some(e => e.PRODUCT_TYPE_ID == item.PRODUCT_TYPE_ID)}
                        id={item.PRODUCT_TYPE_ID}
                        onDrag={data => {
                          const isDisabled = productTypeSelectedList.some(
                            e => e.PRODUCT_TYPE_ID == item.PRODUCT_TYPE_ID
                          )

                          if (isDisabled) {
                            return
                          } else {
                            setTargetItem(Number(data.target.id))
                          }
                        }}
                        onClick={e => {
                          handleDoubleClick(e)
                        }}
                      >
                        <Checkbox
                          id={item.PRODUCT_TYPE_ID}
                          // type='checkbox'
                          className='me-1'
                          disabled={productTypeSelectedList.some(e => e.PRODUCT_TYPE_ID == item.PRODUCT_TYPE_ID)}
                          checked={group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)}
                          onClick={() => {
                            if (group.some(e => e.PRODUCT_TYPE_ID === item.PRODUCT_TYPE_ID)) {
                              setGroup(group.filter(e => e.PRODUCT_TYPE_ID != item.PRODUCT_TYPE_ID))

                              return
                            }

                            setGroup([item, ...group])
                            console.log(group.length)

                            return
                          }}
                        />

                        <span id={item.PRODUCT_TYPE_ID}>{`${item.PRODUCT_TYPE_NAME}`}</span>
                      </ListItem>
                    </>
                  )
                })}
              </ReactSortable>
              <Typography variant='body2' align='left' sx={{ padding: '10px' }}>
                Total {productTypeList.length} entries | Selected {group.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              sx={{ border: '1px solid #ccc', borderBottom: 'none' }}
              title={
                <Box position='relative' display='flex' alignItems='center'>
                  <Typography
                    variant='h6'
                    style={{
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    Selected Product Types
                  </Typography>
                  <Box ml='auto'>
                    <Button
                      variant='contained'
                      color='error'
                      size='small'
                      onClick={() => {
                        setProductTypeSelectedList([])
                      }}
                    >
                      Clear All
                    </Button>
                  </Box>
                </Box>
              }
            />
            <Divider />
            <CardContent sx={{ border: '1px solid #ccc' }}>
              <Controller
                control={control}
                name='product.selectedProductType'
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <ReactSortable
                    tag='ul'
                    className='list-group sortable'
                    group='shared-handle-group'
                    id='selectedProductType'
                    {...fieldProps}
                    style={{
                      border:
                        !productTypeSelectedList || productTypeSelectedList.length === 0
                          ? '1px dashed ' + (errors?.product?.selectedProductType ? '#E74C3C' : '#7367f0')
                          : '',
                      borderRadius: '0.357rem',
                      display: 'block',
                      width: '100',
                      height: '470px',

                      overflowY: 'auto'
                    }}
                    animation={250}
                    swapThreshold={0.7}
                    delayOnTouchStart={true}
                    delay={2}
                    swapClass='highlight'
                    ghostClass='ghost'
                    list={productTypeSelectedList || []}
                    setList={data => {
                      onChange(data)

                      if (group.some(e => e.PRODUCT_TYPE_ID === targetItem)) {
                        setProductTypeSelectedList([...productTypeSelectedList, ...group])

                        setGroup([])

                        return
                      }

                      setProductTypeSelectedList(data)
                    }}
                  >
                    {productTypeSelectedList.map((item, index) => {
                      return (
                        <>
                          <ListGroupItem
                            className='draggable'
                            key={`${item.PRODUCT_TYPE_ID}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '10px',
                              border: '1px dashed #ccc',
                              borderRadius: '4px'
                            }}
                          >
                            <Trash2
                              color='red'
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                queryClient.invalidateQueries('PRODUCT_TYPE_LIST')

                                setProductTypeSelectedList(data =>
                                  data.filter(dataItem => dataItem.PRODUCT_TYPE_ID !== item.PRODUCT_TYPE_ID)
                                )
                              }}
                            />

                            <ListItem>
                              <ListItemIcon sx={{ marginRight: 2 }}>
                                <Badge badgeContent={index + 1} color='primary' />
                              </ListItemIcon>
                              <ListItemText primary={item.PRODUCT_TYPE_NAME} />
                            </ListItem>
                          </ListGroupItem>

                          {productTypeSelectedList.length - 1 === index && <div ref={dataEndRef} />}
                        </>
                      )
                    })}
                  </ReactSortable>
                )}
              />
              {errors?.product?.selectedProductType && (
                <FormText color='danger' style={{ margin: 0 }}>
                  {errors?.product?.selectedProductType.message}
                </FormText>
              )}
              <Typography variant='body2' align='left' sx={{ padding: '10px' }}>
                Total {productTypeSelectedList.length} selected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default ProductForm

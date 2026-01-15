import { PREFIX_QUERY_KEY, useUpdateBomProductType } from '@/_workspace/react-query/hooks/useBomData'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Slide,
  SlideProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useRef, useState } from 'react'
import { Controller, FormProvider, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'
import {
  array,
  maxLength,
  minLength,
  nonEmpty,
  nonNullable,
  nullable,
  number,
  object,
  pipe,
  record,
  string,
  transform,
  //@ts-ignore
  type Input
} from 'valibot'
import { SortableItem } from '../../flow/flow-process/components/SortableItem'
import { ProcessOption } from '@/_workspace/types/process/Process'
import { fetchProcessByLikeProcessNameAndProductMainIdAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import ConfirmModal from '@/components/ConfirmModal'
import FlowProcessSelectModal from './FlowProcessSelectModal/FlowProcessSelectModal'
import BomAddDndTableData from '../components/BomAddDndTableData'
import { ItemCategoryOption } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { ItemOption } from '@/_workspace/react-select/async-promise-load-options/fetchItem'
import BomSelectModal from './BomSelectModal/BomSelectModal'
import { MRT_Row } from 'material-react-table'
import { BomI } from '@/_workspace/types/bom/Bom'
import { fetchBomDetailsByBomId } from '@/_workspace/react-select/async-promise-load-options/fetchBom'
import { truncate } from 'fs'
import { ProductTypeInterface } from '../../flow/flow-process/modal/FlowProcessAddModal'
import { ProductTypeOptionI } from '@/_workspace/types/flow/FlowProcess'
import ConfirmChangeProductTypeModal from '@/components/ConfirmChangeProductTypeModal'
import {
  fetchProductTypeByLikeProductTypeCodeAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import { components } from 'react-select'

import UILoader from '@/components/ui-loader/UILoader'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Schema with Valibot
const schema = object({
  PRODUCT_MAIN: nonNullable(
    nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string(),
        PRODUCT_MAIN_ALPHABET: string()
      })
    ),
    'Product Main is required'
  ),
  BOM_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Bom Name', typeName: 'String' })),
    nonEmpty('Bom Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Bom Name', minLength: 3 })),
    maxLength(200, maxLengthFieldMessage({ fieldName: 'Bom Name', maxLength: 200 }))
  ),

  FLOW_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Flow Name', typeName: 'String' })),
    nonEmpty('Flow Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Flow Name', minLength: 3 })),
    maxLength(200, maxLengthFieldMessage({ fieldName: 'Flow Name', maxLength: 200 }))
  ),
  PROCESS: array(
    object(
      {
        NO: number(),
        PROCESS_ID: nullable(number()),
        PROCESS_NAME: nullable(string())
      },
      'Process is required'
    )
  ),
  ITEM: record(
    string(),
    object(
      {
        PROCESS: object(
          {
            label: string(),
            value: number()
          },
          'Process is required'
        ),
        ITEM_CATEGORY: object(
          {
            ITEM_CATEGORY_ID: nullable(number()),
            ITEM_CATEGORY_NAME: nullable(string())
          },
          'Item Category is required'
        ),
        ITEM: object(
          {
            ITEM_ID: nullable(number()),
            ITEM_CODE_FOR_SUPPORT_MES: nullable(string())
          },
          'Item is required'
        ),
        USAGE_QUANTITY: pipe(
          string(requiredFieldMessage({ fieldName: 'Usage Quantity' })),
          // nonEmpty('Usage Quantity is required'),
          transform((value: string) => {
            return parseFloat(value)
          })
        )
      },
      'Usage Quantity is required'
    )
  )
})

const draftSchema = object({
  PRODUCT_MAIN: nonNullable(
    nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string(),
        PRODUCT_MAIN_ALPHABET: string()
      })
    ),
    'Product Main is required'
  ),
  BOM_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Bom Name', typeName: 'String' })),
    nonEmpty('Bom Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Bom Name', minLength: 3 })),
    maxLength(200, maxLengthFieldMessage({ fieldName: 'Bom Name', maxLength: 200 }))
  )
})

export type FormData = Input<typeof schema>

// Props
interface BomProductTypeModalProps {
  openModalBomProductType: boolean
  setOpenModalBomProductType: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<BomI> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<BomI> | null>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

export interface ProcessInterface {
  NO: number
  PROCESS_ID: number | null
  PROCESS_NAME: string | null
}

export interface ItemInterface {
  id: string
  // PROCESS: ProcessInterface
  // ITEM_CATEGORY: ItemCategoryOption
  // ITEM: ItemOption
  // USAGE_QUANTITY: number | ''
}

export interface BomInterface {
  process: ProcessInterface[]
  item: ItemInterface[]
}

const defaultResolver = valibotResolver(schema)
const draftResolver = valibotResolver(draftSchema)

const BomProductTypeModal = ({
  openModalBomProductType,
  setOpenModalBomProductType,
  rowSelected,
  setRowSelected,
  setIsEnableFetching
}: BomProductTypeModalProps) => {
  // const [process, setProcess] = useState<ProcessInterface[]>([])
  const [item, setItem] = useState<ItemInterface[]>([])
  const [block, setBlock] = useState(false)
  const [noSelected, setNoSelected] = useState<number>()
  const [isMessageError, setIsMessageError] = useState(false)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [productTypeSelected, setProductTypeSelected] = useState<ProductTypeInterface[]>([])
  const [productTypeValue, setProductTypeValue] = useState<ProductTypeInterface>()
  const [productTypeIndex, setProductTypeIndex] = useState<number>()

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)
  const [confirmChangeProductTypeModal, setConfirmChangeProductTypeModal] = useState(false)

  const queryClient = useQueryClient()

  const isDraft = useRef(false)

  // Hooks : react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    resolver: (...args) => {
      if (isDraft.current) {
        return draftResolver(...args)
      }

      return defaultResolver(...args)
    },
    // defaultValues: {
    //   PRODUCT_MAIN: null,
    //   BOM_NAME: '',
    //   FLOW_NAME: '',
    //   PROCESS: [],
    //   ITEM: {}
    // }
    defaultValues: async (): Promise<FormData> => {
      const result = await fetchBomDetailsByBomId(rowSelected?.original.BOM_ID)

      if (Object.keys(result.ITEM).length > 0) {
        setItem(
          Object.keys(result.ITEM).map(key => {
            return {
              id: key
            }
          })
        )
      }

      setProductTypeSelected(result.productType)

      setIsLoading(false)

      return {
        PRODUCT_MAIN: result.productMain,
        BOM_NAME: result.bomName,
        FLOW_NAME: result.flowName,
        PROCESS: result.PROCESS,
        ITEM: result.ITEM,
        BOM_CODE: result.bomCode,
        FLOW_CODE: result.flowCode
      }
    }
  })

  const { errors } = useFormState({
    control: reactHookFormMethods.control
  })

  const onSubmit = () => {
    setConfirmModal(true)
  }

  // Functions
  const handleClose = () => {
    setOpenModalBomProductType(false)
    setRowSelected(null)
    // reset()
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const handleSetProductType = (value: ProductTypeInterface, index: number) => {
    setProductTypeSelected(prevState => {
      const newItems = [...prevState]
      newItems[index] = {
        PRODUCT_TYPE_ID: value?.PRODUCT_TYPE_ID ?? null,
        PRODUCT_TYPE_CODE: value?.PRODUCT_TYPE_CODE ?? null,
        PRODUCT_TYPE_NAME: value?.PRODUCT_TYPE_NAME ?? null
      }
      return newItems
    })

    setProductTypeValue(undefined)
    setProductTypeIndex(undefined)
    setConfirmChangeProductTypeModal(false)
  }

  const handleUpdateBomProductType = () => {
    setConfirmModal(false)

    const dataItem = {
      BOM_ID: rowSelected?.original.BOM_ID,
      FLOW_ID: rowSelected?.original.FLOW_ID,
      PRODUCT_TYPE: productTypeSelected,
      CREATE_BY: getUserData().EMPLOYEE_CODE
    }

    // console.log(dataItem)

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Bom - Product Type'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Bom - Product Type',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Bom - Product Type' : data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log(err)
    console.log('onMutateError')
  }

  const mutation = useUpdateBomProductType(onMutateSuccess, onMutateError)

  const LoaderFetching = () => {
    return <p className='text-xl'>Loading Data...</p>
  }

  return (
    <>
      <Dialog
        maxWidth={false}
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openModalBomProductType}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        {/* <Button
          variant='contained'
          startIcon={<i className='tabler-plus' />}
          onClick={() => {
            console.log(reactHookFormMethods.getValues())
          }}
        >
          Get Values
        </Button> */}
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Bom Matching with Product Type
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <UILoader blocking={isLoading} loader={<LoaderFetching />}>
            <Divider>
              <Typography color='primary'>Header</Typography>
            </Divider>
            <Grid
              container
              spacing={6}
              sx={{
                paddingTop: '8px',
                paddingBottom: '12px'
              }}
            >
              <Grid item xs={12} sm={3} lg={3}>
                <Controller
                  defaultValue={null}
                  name='PRODUCT_MAIN'
                  control={reactHookFormMethods.control}
                  render={({ field: { onChange, ...fieldProps } }) => (
                    <AsyncSelectCustom<ProductMainOption>
                      label='Product Main'
                      inputId='PRODUCT_MAIN'
                      {...fieldProps}
                      isClearable
                      cacheOptions
                      defaultOptions
                      value={reactHookFormMethods.getValues('PRODUCT_MAIN')}
                      onChange={value => {
                        setBlock(value ? false : true)
                        onChange(value)
                      }}
                      loadOptions={inputValue => {
                        return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                      }}
                      getOptionLabel={data => data.PRODUCT_MAIN_NAME?.toString() ?? ''}
                      getOptionValue={data => data.PRODUCT_MAIN_ID?.toString() ?? ''}
                      classNamePrefix='select'
                      placeholder='Select Product Main ...'
                      isDisabled={true}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={6}>
              <Grid item>
                <CustomTextField
                  label='Bom Code (Auto)'
                  autoComplete='off'
                  // sx={{
                  //   '& .MuiInputLabel-root': {
                  //     lineHeight: '1.4 !important'
                  //   }
                  // }}
                  disabled={true}
                  value={reactHookFormMethods.watch('BOM_CODE')}
                />
              </Grid>
              <Grid item>
                <Controller
                  defaultValue=''
                  name='BOM_NAME'
                  control={reactHookFormMethods.control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      disabled={true}
                      fullWidth
                      label='Bom Name'
                      placeholder='Enter Bom Name'
                      autoComplete='off'
                      // sx={{
                      //   '& .MuiInputLabel-root': {
                      //     lineHeight: '1.4 !important'
                      //   }
                      // }}
                      {...(errors.BOM_NAME && {
                        error: true,
                        helperText: errors.BOM_NAME.message
                      })}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider className='mt-5'>
              <Typography color='primary'>Detail</Typography>
            </Divider>
            <Grid
              container
              spacing={6}
              sx={{
                paddingTop: '8px',
                paddingBottom: '12px'
              }}
            >
              <Grid item xs={12} sm={4} lg={4}>
                <Card
                  sx={{
                    minHeight: '61vh',
                    maxHeight: '61vh',
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                    border: '1px solid var(--mui-palette-customColors-inputBorder)'
                  }}
                >
                  <CardHeader
                    sx={{
                      backgroundColor: 'var(--mui-palette-background-default)'
                    }}
                    title='Flow Process'
                    action={<></>}
                  />
                  <CardHeader
                    sx={{
                      // backgroundColor: 'var(--mui-palette-secondary-darkOpacity)',
                      marginY: '0.75rem'
                    }}
                    title={
                      <>
                        <Grid container spacing={6}>
                          <Grid item xs={12} sm={6} lg={6}>
                            <CustomTextField
                              label='Flow Code (Auto)'
                              autoComplete='off'
                              // sx={{
                              //   '& .MuiInputLabel-root': {
                              //     lineHeight: '1.4 !important'
                              //   }
                              // }}
                              disabled={true}
                              value={reactHookFormMethods.watch('FLOW_CODE')}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} lg={6}>
                            <Controller
                              defaultValue=''
                              name='FLOW_NAME'
                              control={reactHookFormMethods.control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  label='Flow Name'
                                  placeholder='Enter Flow Name'
                                  autoComplete='off'
                                  // sx={{
                                  //   '& .MuiInputLabel-root': {
                                  //     lineHeight: '1.4 !important'
                                  //   }
                                  // }}
                                  {...(errors.FLOW_NAME && {
                                    error: true,
                                    helperText: errors.FLOW_NAME.message
                                  })}
                                  disabled={true}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </>
                    }
                  />

                  <CardContent>
                    <TableContainer sx={{ overflowY: 'hidden' }}>
                      <Table>
                        <TableBody>
                          {(reactHookFormMethods.watch('PROCESS') ?? []).length === 0 ? (
                            <TableRow sx={{ backgroundColor: 'var(--mui-palette-success-lighterOpacity)' }}>
                              <TableCell colSpan={4} align='center'>
                                <Button onClick={() => {}}>
                                  <i className='tabler-plus' />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              <DndContext>
                                <SortableContext
                                  items={reactHookFormMethods.watch('PROCESS').map(item => item.NO)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {reactHookFormMethods.watch('PROCESS').map((ps, index) => (
                                    <SortableItem id={index}>
                                      <TableRow
                                        key={index}
                                        sx={{
                                          width: '100%',
                                          backgroundColor:
                                            noSelected === ps.NO ? 'var(--mui-palette-success-lighterOpacity)' : ''
                                        }}
                                      >
                                        <TableCell>
                                          <Checkbox disabled={true} checked={noSelected === ps.NO} onClick={() => {}} />
                                        </TableCell>
                                        <TableCell>{ps.NO}</TableCell>
                                        <TableCell sx={{ width: '100%', position: 'relative', overflow: 'visible' }}>
                                          {noSelected === ps.NO ? (
                                            <>
                                              <Button
                                                size='small'
                                                color='success'
                                                sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                                className='absolute -right-5 -top-3 min-w-0 z-50'
                                                onClick={() => {}}
                                              >
                                                <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                              </Button>
                                              <Button
                                                size='small'
                                                color='success'
                                                sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                                className='absolute -right-5 -bottom-3 min-w-0 z-50'
                                                onClick={() => {}}
                                              >
                                                <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                              </Button>
                                            </>
                                          ) : null}

                                          <Badge
                                            color='info'
                                            badgeContent={Object.values(reactHookFormMethods.watch('ITEM')).reduce(
                                              (acc: number, item: any) => {
                                                if (item?.PROCESS?.value && ps.PROCESS_ID === item.PROCESS.value) {
                                                  return acc + 1
                                                }

                                                return acc
                                              },
                                              0
                                            )}
                                            sx={{
                                              width: '100%'
                                            }}
                                          >
                                            <AsyncSelectCustom<ProcessOption>
                                              value={
                                                // process[index].PROCESS_ID && process[index].PROCESS_NAME
                                                //   ? process[index]
                                                //   : null
                                                reactHookFormMethods.watch('PROCESS')[index].PROCESS_ID &&
                                                reactHookFormMethods.watch('PROCESS')[index].PROCESS_NAME
                                                  ? reactHookFormMethods.watch('PROCESS')[index]
                                                  : null
                                              }
                                              onChange={value => {
                                                // setProcess(prevState => {
                                                //   const newItems = [...prevState]
                                                //   newItems[index] = {
                                                //     NO: prevState[index].NO,
                                                //     PROCESS_ID: value?.PROCESS_ID ?? null,
                                                //     PROCESS_NAME: value?.PROCESS_NAME ?? null
                                                //   }
                                                //   return newItems
                                                // })

                                                reactHookFormMethods.setValue(
                                                  'PROCESS',
                                                  reactHookFormMethods.getValues('PROCESS').map((item, idx) => {
                                                    return {
                                                      ...item,
                                                      PROCESS_ID:
                                                        idx === index ? (value?.PROCESS_ID ?? null) : item.PROCESS_ID,
                                                      PROCESS_NAME:
                                                        idx === index
                                                          ? (value?.PROCESS_NAME ?? null)
                                                          : item.PROCESS_NAME
                                                    }
                                                  })
                                                )
                                              }}
                                              label=''
                                              inputId='PROCESS'
                                              isSearchable
                                              cacheOptions
                                              defaultOptions
                                              key={reactHookFormMethods.watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}
                                              loadOptions={inputValue => {
                                                return fetchProcessByLikeProcessNameAndProductMainIdAndInuse(
                                                  inputValue,
                                                  reactHookFormMethods.getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID,
                                                  1
                                                )
                                              }}
                                              getOptionLabel={data => data.PROCESS_NAME.toString()}
                                              getOptionValue={data => data.PROCESS_ID.toString()}
                                              classNamePrefix='select'
                                              placeholder='Select Process ...'
                                              isDisabled={true}
                                            />
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <Button>
                                            {noSelected === ps.NO ? (
                                              <i
                                                className='tabler-trash'
                                                style={{
                                                  color: 'var(--mui-palette-error-main)'
                                                }}
                                                onClick={() => {}}
                                              />
                                            ) : null}
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    </SortableItem>
                                  ))}
                                </SortableContext>
                              </DndContext>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={8} lg={8}>
                <Card
                  sx={{
                    minHeight: '61vh',
                    maxHeight: '61vh',
                    // overflowY: 'scroll',
                    overflowX: 'hidden',
                    border: '1px solid var(--mui-palette-customColors-inputBorder)'
                  }}
                >
                  <CardHeader
                    sx={{
                      backgroundColor: 'var(--mui-palette-background-default)'
                    }}
                    title='Bill of Material'
                    action={<></>}
                  />

                  <CardContent>
                    <FormProvider {...reactHookFormMethods}>
                      <BomAddDndTableData
                        // process={process}
                        data={item}
                        setData={setItem}
                        isMessageError={isMessageError}
                        setIsMessageError={setIsMessageError}
                        open={open}
                        setOpen={setOpen}
                        isLockedBom={true}
                      />
                    </FormProvider>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider textAlign='left' className='mt-5 mb-2'>
              Matching with Product Type
            </Divider>
            <Card
              sx={{
                minHeight: '61vh',
                maxHeight: '61vh',
                overflowY: 'scroll',
                overflowX: 'hidden',
                border: '1px solid var(--mui-palette-customColors-inputBorder)'
              }}
            >
              <CardHeader
                sx={{
                  backgroundColor: 'var(--mui-palette-background-default)'
                }}
                title={<>Matching with Product Type</>}
              />
              <CardContent>
                <Button
                  className='mt-2 mb-2'
                  variant='contained'
                  onClick={() => {
                    // always push to last index
                    setProductTypeSelected(prevState => {
                      return [
                        ...prevState,
                        {
                          PRODUCT_TYPE_ID: null,
                          PRODUCT_TYPE_CODE: null,
                          PRODUCT_TYPE_NAME: null
                        }
                      ]
                    })
                  }}
                >
                  Add New
                </Button>
                <TableContainer
                  sx={{
                    border: '1px solid var(--mui-palette-customColors-inputBorder)',
                    borderRadius: '4px'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Actions</TableCell>
                        <TableCell>Product Type Code</TableCell>
                        <TableCell>Product Type Name</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productTypeSelected.map((productType, index) => {
                        return (
                          <TableRow>
                            <TableCell>
                              <Button
                                disabled={productType.IS_OLD}
                                onClick={() => {
                                  setProductTypeSelected(prevState => {
                                    return prevState.filter((_, idx) => idx !== index)
                                  })
                                }}
                              >
                                <i className='tabler-trash' />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <AsyncSelectCustom<ProductTypeOptionI>
                                value={productTypeSelected[index].PRODUCT_TYPE_NAME ? productTypeSelected[index] : null}
                                onChange={value => {
                                  console.log(value)
                                  if (value?.BOM_CODE) {
                                    setConfirmChangeProductTypeModal(true)
                                    setProductTypeIndex(index)
                                    setProductTypeValue(value)
                                    return
                                  } else {
                                    handleSetProductType(value, index)
                                  }
                                }}
                                label=''
                                inputId='PRODUCT_TYPE_CODE'
                                isSearchable
                                cacheOptions
                                defaultOptions
                                key={reactHookFormMethods.watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}
                                loadOptions={inputValue => {
                                  return fetchProductTypeByLikeProductTypeCodeAndProductMainIdAndInuse(
                                    inputValue,
                                    reactHookFormMethods.getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID,
                                    1
                                  )
                                }}
                                isDisabled={productType.IS_OLD}
                                getOptionLabel={data => data.PRODUCT_TYPE_CODE?.toString()}
                                getOptionValue={data => data.PRODUCT_TYPE_ID?.toString()}
                                classNamePrefix='select'
                                placeholder='Select Product Type Code ...'
                                components={{
                                  Option: props => {
                                    const data = props.data as ProductTypeOptionI

                                    return (
                                      <components.Option
                                        {...props}
                                        className={`${data.BOM_CODE ? 'bg-yellow-500/10' : ''}`}
                                      >
                                        {data.PRODUCT_TYPE_CODE}
                                        {data.BOM_CODE ? (
                                          <>
                                            <br />
                                            <span className='text-gray-400'>(exists on Bom: "{data.BOM_CODE}")</span>
                                          </>
                                        ) : null}
                                      </components.Option>
                                    )
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <AsyncSelectCustom<ProductTypeOptionI>
                                value={productTypeSelected[index].PRODUCT_TYPE_NAME ? productTypeSelected[index] : null}
                                onChange={value => {
                                  console.log(value)

                                  if (value?.BOM_CODE) {
                                    setConfirmChangeProductTypeModal(true)
                                    setProductTypeIndex(index)
                                    setProductTypeValue(value)
                                    return
                                  } else {
                                    handleSetProductType(value, index)
                                  }
                                }}
                                label=''
                                inputId='PRODUCT_TYPE_NAME'
                                isSearchable
                                cacheOptions
                                defaultOptions
                                key={reactHookFormMethods.watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}
                                loadOptions={inputValue => {
                                  return fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                                    inputValue,
                                    reactHookFormMethods.getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID,
                                    1
                                  )
                                }}
                                isDisabled={productType.IS_OLD}
                                getOptionLabel={data => data.PRODUCT_TYPE_NAME.toString()}
                                getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                                classNamePrefix='select'
                                placeholder='Select Product Type Name ...'
                                components={{
                                  Option: props => {
                                    const data = props.data as ProductTypeOptionI

                                    return (
                                      <components.Option
                                        {...props}
                                        className={`${data.BOM_CODE ? 'bg-yellow-500/10' : ''}`}
                                      >
                                        {data.PRODUCT_TYPE_NAME}
                                        {data.BOM_CODE ? (
                                          <>
                                            <br />
                                            <span className='text-gray-400'>(exists on Flow "{data.BOM_CODE}")</span>
                                          </>
                                        ) : null}
                                      </components.Option>
                                    )
                                  }
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </UILoader>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (productTypeSelected.some(item => !item.PRODUCT_TYPE_ID)) {
                const message = {
                  title: 'Add Bom Product Type',
                  message: 'โปรดเลือกข้อมูล Product Type ให้ครบถ้วน'
                }

                ToastMessageError(message)
                return
              }

              const productTypeIds = productTypeSelected.map(item => item.PRODUCT_TYPE_ID)
              const isDuplicate = productTypeIds.some((item, index) => productTypeIds.indexOf(item) !== index)

              if (isDuplicate) {
                const message = {
                  title: 'Add Bom Product Type',
                  message: 'มี Product Type ที่ซ้ำกัน'
                }

                ToastMessageError(message)
                return
              }

              setConfirmModal(true)
            }}
            variant='contained'
          >
            Save & Complete
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleUpdateBomProductType}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
        <ConfirmChangeProductTypeModal
          show={confirmChangeProductTypeModal}
          onConfirmClick={() => {
            handleSetProductType(productTypeValue, productTypeIndex)
          }}
          onCloseClick={() => setConfirmChangeProductTypeModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default BomProductTypeModal

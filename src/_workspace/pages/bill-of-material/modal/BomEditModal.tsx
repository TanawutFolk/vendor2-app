import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useBomData'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import UILoader from '@/components/ui-loader/UILoader'
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
interface EditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<BomI> | null
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

const BomEditModal = ({ openModalEdit, setOpenModalEdit, rowSelected, setIsEnableFetching }: EditModalProps) => {
  // const [process, setProcess] = useState<ProcessInterface[]>([])
  const [item, setItem] = useState<ItemInterface[]>([])
  const [block, setBlock] = useState(false)
  const [noSelected, setNoSelected] = useState<number>()
  const [isMessageError, setIsMessageError] = useState(false)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [isLockedFlowProcess, setIsLockedFlowProcess] = useState(true)
  const [isLockedBom, setIsLockedBom] = useState(true)

  const [isShowFlowProcessModal, setIsShowFlowProcessModal] = useState(false)
  const [isShowBomModal, setIsShowBomModal] = useState(false)

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

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
    if (
      reactHookFormMethods
        .getValues('PROCESS')
        ?.some((item: any) => item.PROCESS_ID === null || item.PROCESS_NAME === null)
    ) {
      const message = {
        title: 'Add Bom',
        message: 'โปรดกรอก Process ให้ครบถ้วน'
      }

      ToastMessageError(message)
      return
    }

    if (
      Object.values(reactHookFormMethods.getValues('ITEM') ?? {})?.some(
        (item: any) => !item.ITEM || !item.ITEM_CATEGORY || !item.PROCESS || !item.USAGE_QUANTITY
      )
    ) {
      const message = {
        title: 'Add Bom',
        message: 'โปรดกรอก Product Type ให้ครบถ้วน'
      }

      ToastMessageError(message)
      return
    }

    if (!isDraft.current && Object.values(reactHookFormMethods.getValues('ITEM') ?? {}).length === 0) {
      const message = {
        title: 'Add Bom',
        message: 'โปรดเลือก Material อย่างน้อย 1 รายการ'
      }

      ToastMessageError(message)
      return
    }

    setConfirmModal(true)
  }

  // Functions
  const handleClose = () => {
    setOpenModalEdit(false)
    // reset()
  }

  const handleEdit = () => {
    setConfirmModal(false)

    const dataItem = {
      BOM_ID: rowSelected?.original.BOM_ID,
      FLOW_ID: rowSelected?.original.FLOW_ID,
      FLOW_PROCESS: reactHookFormMethods.getValues('PROCESS'),
      ITEM: reactHookFormMethods.getValues('ITEM'),
      CREATE_BY: getUserData().EMPLOYEE_CODE,
      UPDATE_BY: getUserData().EMPLOYEE_CODE,
      BOM_NAME: reactHookFormMethods.getValues('BOM_NAME'),
      FLOW_NAME: reactHookFormMethods.getValues('FLOW_NAME'),
      FLOW_TYPE_ID: reactHookFormMethods.getValues('FLOW_TYPE')?.FLOW_TYPE_ID ?? 0,
      FLOW_ALPHABET: reactHookFormMethods.getValues('FLOW_TYPE')?.FLOW_ALPHABET ?? '',
      PRODUCT_MAIN_ID: reactHookFormMethods.getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID,
      PRODUCT_MAIN_ALPHABET: reactHookFormMethods.getValues('PRODUCT_MAIN').PRODUCT_MAIN_ALPHABET,
      TOTAL_COUNT_PROCESS: reactHookFormMethods.getValues('PROCESS').length,
      IS_DRAFT: isDraft.current ? 1 : 0,
      STATUS_DRAFT: rowSelected?.original.IS_DRAFT
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Edit Bom'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Edit Bom',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log('onMutateError')
    console.log(err)

    if (err?.response?.data?.Message) {
      const message = {
        title: 'Edit Bom',
        message: err.response.data.Message.split(':')[1].trim()
      }

      ToastMessageError(message)
    } else {
      const message = {
        title: 'Edit Bom',
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      }

      ToastMessageError(message)
    }
  }

  const mutation = useUpdate(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      //@ts-ignore
      activationConstraint: { delay: 200, distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over.id) {
      reactHookFormMethods.setValue(
        'PROCESS',
        (() => {
          const oldIndex = active.id
          const newIndex = over.id

          if (oldIndex + 1 === noSelected) {
            setNoSelected(newIndex + 1)
          }

          const swapArray = (arr: ProcessInterface[], oldIndex: number, newIndex: number) => {
            const newArr = arrayMove(arr, oldIndex, newIndex)
            return newArr.map((item, index) => {
              return { ...item, NO: index + 1 }
            })
          }

          return swapArray(reactHookFormMethods.getValues('PROCESS'), oldIndex, newIndex)
        })()
      )
      // setProcess(process => {
      //   const oldIndex = active.id
      //   const newIndex = over.id

      //   const swapArray = (arr: ProcessInterface[], oldIndex: number, newIndex: number) => {
      //     const newArr = arrayMove(arr, oldIndex, newIndex)
      //     return newArr.map((item, index) => {
      //       return { ...item, NO: index + 1 }
      //     })
      //   }

      //   return swapArray(process, oldIndex, newIndex)
      // })
    }
  }

  const LoaderFetching = () => {
    return <p className='text-xl'>Loading Data...</p>
  }
  const LoaderPleaseSelectProductMain = () => {
    return <p>Please select a Product Main before.</p>
  }
  const LoaderPleaseChooseProcess = () => {
    return <p>Please select at least 1 process.</p>
  }

  const setProcess = (data: any) => {
    reactHookFormMethods.setValue('PROCESS', data)

    setBlock(false)
    setIsLockedFlowProcess(true)
  }

  const setBom = (data: any) => {
    reactHookFormMethods.setValue('PROCESS', data.PROCESS)
    reactHookFormMethods.setValue('ITEM', data.ITEM)
    if (Object.keys(data.ITEM).length > 0) {
      setItem(
        Object.keys(data.ITEM).map(key => {
          return {
            id: key
          }
        })
      )
    }

    setBlock(false)
    // setIsLockedBom(true)
    setIsLockedFlowProcess(true)
  }

  // reset the process on bom when change process flow
  useEffect(() => {
    const processes = reactHookFormMethods.getValues('PROCESS') ?? []
    const items = Object.entries(reactHookFormMethods.getValues('ITEM') ?? {})

    let itemsResult = reactHookFormMethods.getValues('ITEM') ?? {}

    for (let [key, item] of items) {
      let isHasProcess = false

      for (let process of processes) {
        if (process?.PROCESS_ID && item.PROCESS !== null && process.PROCESS_ID === item.PROCESS.value) {
          isHasProcess = true
          break
        }
      }

      if (!isHasProcess) {
        itemsResult[key].PROCESS = null
      }
    }

    reactHookFormMethods.setValue('ITEM', itemsResult)
  }, [reactHookFormMethods.watch('PROCESS')])

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
        open={openModalEdit}
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
            Edit Bill of Material
          </Typography>
          {/* <Button onMouseEnter={() => console.log(reactHookFormMethods.getValues())}>Get Values</Button> */}

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
                    action={
                      <>
                        <div className='h-full flex items-center justify-center gap-3'>
                          {isLockedFlowProcess ? (
                            <i
                              className='tabler-lock'
                              style={{
                                color: 'var(--mui-palette-error-main)',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setIsLockedFlowProcess(false)
                              }}
                            />
                          ) : (
                            <i
                              className='tabler-lock-open-2'
                              style={{
                                color: 'var(--mui-palette-success-main)',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setIsLockedFlowProcess(true)
                              }}
                            />
                          )}

                          <Button
                            variant='contained'
                            onClick={() => {
                              setIsShowFlowProcessModal(true)
                            }}
                            disabled={isLockedFlowProcess}
                          >
                            Copy & Edit
                          </Button>
                        </div>
                      </>
                    }
                  />
                  <CardHeader
                    sx={{
                      // backgroundColor: 'var(--mui-palette-secondary-darkOpacity)'
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
                                  disabled={isLockedFlowProcess}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      </>
                    }
                  />
                  <UILoader blocking={block} loader={<LoaderPleaseSelectProductMain />}>
                    <CardContent>
                      <TableContainer sx={{ overflowY: 'hidden' }}>
                        <Button
                          sx={{
                            marginBottom: '0.5rem'
                          }}
                          variant='contained'
                          startIcon={<i className='tabler-plus' />}
                          onClick={() => {
                            if (isLockedFlowProcess) {
                              return
                            }

                            const index = reactHookFormMethods.getValues('PROCESS').length

                            reactHookFormMethods.setValue(
                              'PROCESS',
                              [
                                ...reactHookFormMethods.getValues('PROCESS').slice(0, index + 1),
                                {
                                  NO: index + 2,
                                  PROCESS_ID: null,
                                  PROCESS_NAME: null
                                },
                                ...reactHookFormMethods.getValues('PROCESS').slice(index + 1)
                              ].map((item, idx) => {
                                return { ...item, NO: idx + 1 }
                              })
                            )
                          }}
                          disabled={isLockedFlowProcess}
                        >
                          Add New
                        </Button>
                        <Table>
                          <TableBody>
                            {(reactHookFormMethods.watch('PROCESS') ?? []).length === 0 ? (
                              <TableRow sx={{ backgroundColor: 'var(--mui-palette-success-lighterOpacity)' }}>
                                <TableCell colSpan={4} align='center'>
                                  <Button
                                    onClick={() => {
                                      if (isLockedFlowProcess) {
                                        return
                                      }

                                      reactHookFormMethods.setValue('PROCESS', [
                                        {
                                          NO: 1,
                                          PROCESS_ID: null,
                                          PROCESS_NAME: null
                                        }
                                      ])
                                    }}
                                  >
                                    <i className='tabler-plus' />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ) : (
                              <>
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={handleDragEnd}
                                >
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
                                            <Checkbox
                                              disabled={isLockedFlowProcess}
                                              checked={noSelected === ps.NO}
                                              onClick={() => {
                                                if (isLockedFlowProcess) {
                                                  return
                                                }

                                                if (noSelected === ps.NO) {
                                                  setNoSelected(undefined)
                                                  return
                                                }

                                                setNoSelected(ps.NO)
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell>{ps.NO}</TableCell>
                                          <TableCell sx={{ width: '100%', position: 'relative', overflow: 'visible' }}>
                                            {noSelected === ps.NO ? (
                                              <>
                                                <Button
                                                  size='small'
                                                  color='success'
                                                  sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                                  className='absolute -right-8 -top-3 min-w-0 z-50'
                                                  onClick={() => {
                                                    if (isLockedFlowProcess) {
                                                      return
                                                    }
                                                    // setProcess(prevState => {
                                                    //   return [
                                                    //     ...prevState.slice(0, index),
                                                    //     {
                                                    //       NO: index + 1,
                                                    //       PROCESS_ID: null,
                                                    //       PROCESS_NAME: null
                                                    //     },
                                                    //     ...prevState.slice(index)
                                                    //   ].map((item, idx) => {
                                                    //     return { ...item, NO: idx + 1 }
                                                    //   })
                                                    // })

                                                    reactHookFormMethods.setValue(
                                                      'PROCESS',
                                                      [
                                                        ...reactHookFormMethods.getValues('PROCESS').slice(0, index),
                                                        {
                                                          NO: index + 1,
                                                          PROCESS_ID: null,
                                                          PROCESS_NAME: null
                                                        },
                                                        ...reactHookFormMethods.getValues('PROCESS').slice(index)
                                                      ].map((item, idx) => {
                                                        return { ...item, NO: idx + 1 }
                                                      })
                                                    )
                                                  }}
                                                >
                                                  <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                                </Button>
                                                <Button
                                                  size='small'
                                                  color='success'
                                                  sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                                  className='absolute -right-8 -bottom-3 min-w-0 z-50'
                                                  onClick={() => {
                                                    if (isLockedFlowProcess) {
                                                      return
                                                    }
                                                    // setProcess(prevState => {
                                                    //   return [
                                                    //     ...prevState.slice(0, index + 1),
                                                    //     {
                                                    //       NO: index + 2,
                                                    //       PROCESS_ID: null,
                                                    //       PROCESS_NAME: null
                                                    //     },
                                                    //     ...prevState.slice(index + 1)
                                                    //   ].map((item, idx) => {
                                                    //     return { ...item, NO: idx + 1 }
                                                    //   })
                                                    // })

                                                    reactHookFormMethods.setValue(
                                                      'PROCESS',
                                                      [
                                                        ...reactHookFormMethods
                                                          .getValues('PROCESS')
                                                          .slice(0, index + 1),
                                                        {
                                                          NO: index + 2,
                                                          PROCESS_ID: null,
                                                          PROCESS_NAME: null
                                                        },
                                                        ...reactHookFormMethods.getValues('PROCESS').slice(index + 1)
                                                      ].map((item, idx) => {
                                                        return { ...item, NO: idx + 1 }
                                                      })
                                                    )
                                                  }}
                                                >
                                                  <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                                </Button>
                                              </>
                                            ) : null}

                                            <Badge
                                              color='info'
                                              badgeContent={Object.values(
                                                reactHookFormMethods.watch('ITEM') ?? {}
                                              ).reduce((acc: number, item: any) => {
                                                if (item?.PROCESS?.value && ps.PROCESS_ID === item.PROCESS.value) {
                                                  return acc + 1
                                                }

                                                return acc
                                              }, 0)}
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
                                                isDisabled={isLockedFlowProcess}
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
                                                  onClick={() => {
                                                    if (isLockedFlowProcess) {
                                                      return
                                                    }
                                                    // setProcess(prevState => {
                                                    //   // return prevState.filter((_, idx) => idx !== index)

                                                    //   // when delete reset noSelected tp undefined and reassign NO
                                                    //   setNoSelected(undefined)

                                                    //   return prevState
                                                    //     .filter((_, idx) => idx !== index)
                                                    //     .map((item, idx) => {
                                                    //       return { ...item, NO: idx + 1 }
                                                    //     })
                                                    // })

                                                    reactHookFormMethods.setValue(
                                                      'PROCESS',
                                                      reactHookFormMethods
                                                        .getValues('PROCESS')
                                                        .filter((_, idx) => idx !== index)
                                                        .map((item, idx) => {
                                                          return { ...item, NO: idx + 1 }
                                                        })
                                                    )

                                                    setNoSelected(undefined)
                                                  }}
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
                        <div
                          style={{
                            width: '100%',
                            height: '1rem'
                          }}
                        ></div>
                      </TableContainer>
                    </CardContent>
                  </UILoader>
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
                    action={
                      <>
                        <div className='h-full flex items-center justify-center gap-3'>
                          {isLockedBom ? (
                            <i
                              className='tabler-lock'
                              style={{
                                color: 'var(--mui-palette-error-main)',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setIsLockedBom(false)
                              }}
                            />
                          ) : (
                            <i
                              className='tabler-lock-open-2'
                              style={{
                                color: 'var(--mui-palette-success-main)',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                setIsLockedBom(true)
                              }}
                            />
                          )}

                          <Button
                            variant='contained'
                            onClick={() => {
                              setIsShowBomModal(true)
                            }}
                            disabled={isLockedBom}
                          >
                            Copy & Edit
                          </Button>
                        </div>
                      </>
                    }
                  />
                  <UILoader
                    blocking={(reactHookFormMethods.watch('PROCESS') ?? []).length <= 0}
                    loader={<LoaderPleaseChooseProcess />}
                  >
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
                          isLockedBom={isLockedBom}
                        />
                      </FormProvider>
                    </CardContent>
                  </UILoader>
                </Card>
              </Grid>
            </Grid>
          </UILoader>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              isDraft.current = true

              return reactHookFormMethods.handleSubmit(onSubmit, onError)()
            }}
            variant='contained'
            disabled={isLoading}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => {
              isDraft.current = false

              return reactHookFormMethods.handleSubmit(onSubmit, onError)()
            }}
            variant='contained'
            disabled={isLoading}
          >
            Save & Complete
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleEdit}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
      {isShowFlowProcessModal && (
        <FlowProcessSelectModal
          setProcessSelected={setProcess}
          setIsShowFlowProcessModal={setIsShowFlowProcessModal}
          isShowFlowProcessModal={isShowFlowProcessModal}
          setValue={reactHookFormMethods.setValue}
          getValues={reactHookFormMethods.getValues}
          get='process'
        />
      )}
      {isShowBomModal && (
        <BomSelectModal
          setBomSelected={setBom}
          setIsShowBomModal={setIsShowBomModal}
          isShowBomModal={isShowBomModal}
          setValue={reactHookFormMethods.setValue}
          getValues={reactHookFormMethods.getValues}
        />
      )}
    </>
  )
}

export default BomEditModal

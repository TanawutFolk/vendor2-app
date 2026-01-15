import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'
import {
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
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'
import { MRT_Row } from 'material-react-table'
import {
  maxLength,
  minLength,
  nonEmpty,
  nonNullable,
  nullable,
  number,
  object,
  pipe,
  string,
  //@ts-ignore
  type Input
} from 'valibot'
import { FlowProcessI, ProductTypeOptionI } from '@/_workspace/types/flow/FlowProcess'
import { useQueryClient } from '@tanstack/react-query'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Controller, set, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ProcessInterface, ProductTypeInterface } from './FlowProcessAddModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { PREFIX_QUERY_KEY, useUpdate } from '@/_workspace/react-query/hooks/useFlowProcessData'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import CustomTextField from '@/components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'
import ConfirmModal from '@/components/ConfirmModal'
import FlowProcessSelectModal from './FlowProcessSelectModal/FlowProcessSelectModal'
import UILoader from '@/components/ui-loader/UILoader'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from '../components/SortableItem'
import { ProcessOption } from '@/_workspace/types/process/Process'
import { fetchProcessByLikeProcessNameAndProductMainIdAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import { fetchProcessByFlowProcessId } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProcess'
import { fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import { fetchFlowProductTypeByFlowId } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProductType'
import { components } from 'react-select'
import ConfirmChangeProductTypeModal from '@/components/ConfirmChangeProductTypeModal'

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
  FLOW_NAME: pipe(
    string(typeFieldMessage({ fieldName: 'Flow Name', typeName: 'String' })),
    nonEmpty('Flow Name is required'),
    minLength(3, minLengthFieldMessage({ fieldName: 'Flow Name', minLength: 3 })),
    maxLength(200, maxLengthFieldMessage({ fieldName: 'Flow Name', maxLength: 200 }))
  )
  // FLOW_TYPE: nonNullable(
  //   nullable(
  //     object({
  //       FLOW_TYPE_ID: number(),
  //       FLOW_TYPE_NAME: string(),
  //     })
  //   ),
  //   'Flow Type is required'
  // ),
})

type FormData = Input<typeof schema>

// Props
interface EditModalProps {
  openModalEdit: boolean
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<FlowProcessI> | null
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const FlowProcessEditModal = ({
  openModalEdit,
  setOpenModalEdit,
  rowSelected,
  setIsEnableFetching
}: EditModalProps) => {
  const [processSelected, setProcessSelected] = useState<ProcessInterface[]>([])
  const [productTypeSelected, setProductTypeSelected] = useState<ProductTypeInterface[]>([])
  const [block, setBlock] = useState(true)
  const [noSelected, setNoSelected] = useState<number>()

  const [isShowFlowProcessModal, setIsShowFlowProcessModal] = useState(false)
  const [productTypeValue, setProductTypeValue] = useState<ProductTypeInterface>()
  const [productTypeIndex, setProductTypeIndex] = useState<number>()

  useEffect(() => {
    if (openModalEdit) {
      fetchProcessByFlowProcessId(rowSelected?.original.FLOW_ID.toString()).then(data => {
        setProcessSelected(
          data.map((item, index) => {
            return {
              NO: index + 1,
              PROCESS_ID: item.PROCESS_ID,
              PROCESS_NAME: item.PROCESS_NAME
            }
          }) || []
        )
      })

      fetchFlowProductTypeByFlowId(rowSelected?.original.FLOW_ID.toString())
        .then(data => {
          setProductTypeSelected(
            data.map((item, index) => {
              return {
                IS_OLD: true,
                PRODUCT_TYPE_ID: item.PRODUCT_TYPE_ID,
                PRODUCT_TYPE_NAME: item.PRODUCT_TYPE_NAME,
                PRODUCT_TYPE_CODE: item.PRODUCT_TYPE_CODE
              }
            }) || []
          )
        })
        .finally(() => {
          setBlock(false)
        })
    }
  }, [openModalEdit])

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)
  const [confirmChangeProductTypeModal, setConfirmChangeProductTypeModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit, watch, setValue } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      PRODUCT_MAIN: {
        PRODUCT_MAIN_ID: rowSelected?.original.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: rowSelected?.original.PRODUCT_MAIN_NAME,
        PRODUCT_MAIN_ALPHABET: rowSelected?.original.PRODUCT_MAIN_ALPHABET
      },
      FLOW_NAME: rowSelected?.original.FLOW_NAME
      // FLOW_TYPE:{
      //   FLOW_TYPE_ID: rowSelected?.original.FLOW_TYPE_ID,
      //   FLOW_TYPE_ALPHABET: rowSelected?.original.FLOW_TYPE_ALPHABET
      // }
    }
  })

  const { errors } = useFormState({
    control
  })

  const onSubmit = () => {
    if (processSelected.some(item => item.PROCESS_ID === null || item.PROCESS_NAME === null)) {
      const message = {
        title: 'Add Flow Process',
        message: 'โปรดเลือกข้อมูล Process ให้ครบถ้วน'
      }

      ToastMessageError(message)
      return
    }

    if (productTypeSelected.some(item => item.PRODUCT_TYPE_ID === null || item.PRODUCT_TYPE_NAME === null)) {
      const message = {
        title: 'Add Flow Process',
        message: 'โปรดเลือก Product Type ให้ครบถ้วน'
      }

      ToastMessageError(message)
      return
    }

    if (processSelected.length <= 0) {
      const message = {
        title: 'Add Flow Process',
        message: 'โปรดเลือกอย่างน้อย 1 Process'
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

  const handleUpdate = () => {
    setConfirmModal(false)

    const dataItem = {
      FLOW_ID: rowSelected?.original.FLOW_ID,
      INUSE: rowSelected?.original.INUSE,
      FLOW_PROCESS: processSelected,
      PRODUCT_TYPE: productTypeSelected,
      CREATE_BY: getUserData().EMPLOYEE_CODE,
      UPDATE_BY: getUserData().EMPLOYEE_CODE,
      FLOW_NAME: getValues('FLOW_NAME'),
      FLOW_TYPE_ID: getValues('FLOW_TYPE')?.FLOW_TYPE_ID ?? 0,
      FLOW_ALPHABET: getValues('FLOW_TYPE')?.FLOW_ALPHABET ?? '',
      PRODUCT_MAIN_ID: getValues('PRODUCT_MAIN').PRODUCT_MAIN_ID,
      PRODUCT_MAIN_ALPHABET: getValues('PRODUCT_MAIN').PRODUCT_MAIN_ALPHABET,
      TOTAL_COUNT_PROCESS: processSelected.length
    }

    mutation.mutate(dataItem)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Flow Process'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()
    } else {
      const message = {
        title: 'Add Flow Process',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log('onMutateError')

    if (err?.response?.data?.Message) {
      const message = {
        title: 'Add Flow Process',
        message: err.response.data.Message.split(':')[1].trim()
      }

      ToastMessageError(message)
    } else {
      const message = {
        title: 'Add Flow Process',
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
      activationConstraint: { delay: 200 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over.id) {
      setProcessSelected(processSelected => {
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

        return swapArray(processSelected, oldIndex, newIndex)
      })
    }
  }

  const LoadingData = () => {
    return <p>Loading ...</p>
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

  useEffect(() => {
    if (processSelected.length === 1) {
      setValue('FLOW_NAME', processSelected[0].PROCESS_NAME)
    } else {
      if (processSelected?.[0]?.PROCESS_NAME == getValues('FLOW_NAME')) {
        setValue('FLOW_NAME', '')
      }
    }
  }, [processSelected?.[0]?.PROCESS_NAME, processSelected.length])

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
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Edit Flow Process
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
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
                name='PRODUCT_MAIN'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ProductMainOption>
                    isDisabled={true}
                    label='Product Main'
                    inputId='PRODUCT_MAIN'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    value={getValues('PRODUCT_MAIN')}
                    onChange={value => {
                      setBlock(value ? false : true)
                      onChange(value)
                    }}
                    loadOptions={inputValue => {
                      return fetchProductMainByLikeProductMainNameAndInuse(inputValue, 1)
                    }}
                    getOptionLabel={data => data.PRODUCT_MAIN_NAME.toString()}
                    getOptionValue={data => data.PRODUCT_MAIN_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select Product Main ...'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3}>
              <Controller
                name='FLOW_NAME'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Flow Name'
                    placeholder='Enter Flow Name'
                    autoComplete='off'
                    disabled={processSelected.length === 1}
                    // sx={{
                    //   '& .MuiInputLabel-root': {
                    //     lineHeight: '1.4 !important'
                    //   }
                    // }}
                    {...(errors.FLOW_NAME && {
                      error: true,
                      helperText: errors.FLOW_NAME.message
                    })}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Divider>
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
            <Grid item xs={12} sm={5} lg={5}>
              <UILoader blocking={block} loader={<LoadingData />}>
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
                      <Button
                        variant='contained'
                        onClick={() => {
                          setIsShowFlowProcessModal(true)
                        }}
                      >
                        Copy & Edit
                      </Button>
                    }
                  />
                  <CardContent>
                    <TableContainer
                      sx={{ overflowY: 'hidden', maxWidth: '100%', overflowX: 'hidden', paddingBottom: '100px' }}
                    >
                      <Table>
                        <Button
                          sx={{
                            marginY: '0.5rem'
                          }}
                          variant='contained'
                          startIcon={<i className='tabler-plus' />}
                          onClick={() => {
                            setProcessSelected(prev => {
                              return [
                                ...prev,
                                {
                                  NO: prev.length + 1,
                                  PROCESS_ID: null,
                                  PROCESS_NAME: null
                                }
                              ]
                            })
                          }}
                          // disabled={!!columnFilters?.length || isLockedBom}
                        >
                          Add New
                        </Button>
                        <TableBody>
                          {processSelected.length === 0 ? (
                            <TableRow sx={{ backgroundColor: 'var(--mui-palette-success-lighterOpacity)' }}>
                              <TableCell colSpan={4} align='center'>
                                <Button
                                  onClick={() => {
                                    setProcessSelected([
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
                                  items={processSelected.map(item => item.NO)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {processSelected.map((process, index) => (
                                    <SortableItem id={index}>
                                      <TableRow
                                        key={index}
                                        sx={{
                                          width: '100%',
                                          backgroundColor:
                                            noSelected === process.NO ? 'var(--mui-palette-success-lighterOpacity)' : ''
                                        }}
                                      >
                                        <TableCell>
                                          <Checkbox
                                            checked={noSelected === process.NO}
                                            onClick={() => {
                                              if (noSelected === process.NO) {
                                                setNoSelected(undefined)
                                                return
                                              }

                                              setNoSelected(process.NO)
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell>{process.NO}</TableCell>
                                        <TableCell sx={{ width: '100%', position: 'relative', overflow: 'visible' }}>
                                          {noSelected === process.NO ? (
                                            <>
                                              <Button
                                                size='small'
                                                color='success'
                                                sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                                className='absolute -right-5 -top-3 min-w-0 z-50'
                                                onClick={() => {
                                                  setProcessSelected(prevState => {
                                                    return [
                                                      ...prevState.slice(0, index),
                                                      {
                                                        NO: index + 1,
                                                        PROCESS_ID: null,
                                                        PROCESS_NAME: null
                                                      },
                                                      ...prevState.slice(index)
                                                    ].map((item, idx) => {
                                                      return { ...item, NO: idx + 1 }
                                                    })
                                                  })
                                                }}
                                              >
                                                <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                              </Button>
                                              <Button
                                                size='small'
                                                color='success'
                                                sx={{ backgroundColor: 'var(--mui-palette-success-darkerOpacity)' }}
                                                className='absolute -right-5 -bottom-3 min-w-0 z-50'
                                                onClick={() => {
                                                  setProcessSelected(prevState => {
                                                    return [
                                                      ...prevState.slice(0, index + 1),
                                                      {
                                                        NO: index + 2,
                                                        PROCESS_ID: null,
                                                        PROCESS_NAME: null
                                                      },
                                                      ...prevState.slice(index + 1)
                                                    ].map((item, idx) => {
                                                      return { ...item, NO: idx + 1 }
                                                    })
                                                  })
                                                }}
                                              >
                                                <i className='tabler-plus' style={{ fontSize: '16px' }} />
                                              </Button>
                                            </>
                                          ) : null}

                                          <AsyncSelectCustom<ProcessOption>
                                            value={
                                              processSelected[index].PROCESS_ID && processSelected[index].PROCESS_NAME
                                                ? processSelected[index]
                                                : null
                                            }
                                            onChange={value => {
                                              setProcessSelected(prevState => {
                                                const newItems = [...prevState]
                                                newItems[index] = {
                                                  NO: prevState[index].NO,
                                                  PROCESS_ID: value?.PROCESS_ID ?? null,
                                                  PROCESS_NAME: value?.PROCESS_NAME ?? null
                                                }
                                                return newItems
                                              })
                                            }}
                                            label=''
                                            inputId='PROCESS'
                                            isSearchable
                                            cacheOptions
                                            defaultOptions
                                            key={watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}
                                            loadOptions={inputValue => {
                                              return fetchProcessByLikeProcessNameAndProductMainIdAndInuse(
                                                inputValue,
                                                getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID,
                                                1
                                              )
                                            }}
                                            getOptionLabel={data => data.PROCESS_NAME.toString()}
                                            getOptionValue={data => data.PROCESS_ID.toString()}
                                            classNamePrefix='select'
                                            placeholder='Select Process ...'
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button>
                                            {noSelected === process.NO ? (
                                              <i
                                                className='tabler-trash'
                                                style={{
                                                  color: 'var(--mui-palette-error-main)'
                                                }}
                                                onClick={() => {
                                                  setProcessSelected(prevState => {
                                                    // return prevState.filter((_, idx) => idx !== index)

                                                    setNoSelected(undefined)

                                                    return prevState
                                                      .filter((_, idx) => idx !== index)
                                                      .map((item, idx) => {
                                                        return { ...item, NO: idx + 1 }
                                                      })
                                                  })
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
                </Card>
              </UILoader>
            </Grid>
            <Grid item xs={12} sm={7} lg={7}>
              <UILoader blocking={block} loader={<LoadingData />}>
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
                    title={
                      <>
                        Matching with Product Type <span className='text-gray-500'>(optional)</span>
                      </>
                    }
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
                                  {productType.IS_OLD ? null : (
                                    <Button
                                      onClick={() => {
                                        setProductTypeSelected(prevState => {
                                          return prevState.filter((_, idx) => idx !== index)
                                        })
                                      }}
                                    >
                                      <i className='tabler-trash' />
                                    </Button>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <AsyncSelectCustom<ProductTypeOptionI>
                                    value={
                                      productTypeSelected[index].PRODUCT_TYPE_CODE &&
                                      productTypeSelected[index].PRODUCT_TYPE_NAME
                                        ? productTypeSelected[index]
                                        : null
                                    }
                                    isDisabled={productType.IS_OLD}
                                    onChange={value => {
                                      if (value?.FLOW_CODE) {
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
                                    key={watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}
                                    loadOptions={inputValue => {
                                      return fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                                        inputValue,
                                        getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID,
                                        1
                                      )
                                    }}
                                    getOptionLabel={data => data.PRODUCT_TYPE_CODE.toString()}
                                    getOptionValue={data => data.PRODUCT_TYPE_ID.toString()}
                                    classNamePrefix='select'
                                    placeholder='Select Product Type Code ...'
                                    components={{
                                      Option: props => {
                                        const data = props.data as ProductTypeOptionI

                                        return (
                                          <components.Option
                                            {...props}
                                            className={`${data.FLOW_CODE ? 'bg-yellow-500/10' : ''}`}
                                          >
                                            {data.PRODUCT_TYPE_CODE}
                                            {data.FLOW_CODE ? (
                                              <>
                                                <br />
                                                <span className='text-gray-400'>
                                                  (exists on Flow "{data.FLOW_CODE}")
                                                </span>
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
                                    value={
                                      productTypeSelected[index].PRODUCT_TYPE_CODE &&
                                      productTypeSelected[index].PRODUCT_TYPE_NAME
                                        ? productTypeSelected[index]
                                        : null
                                    }
                                    isDisabled={productType.IS_OLD}
                                    onChange={value => {
                                      if (value?.FLOW_CODE) {
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
                                    key={watch('PRODUCT_MAIN')?.PRODUCT_MAIN_ID}
                                    loadOptions={inputValue => {
                                      return fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse(
                                        inputValue,
                                        getValues('PRODUCT_MAIN')?.PRODUCT_MAIN_ID,
                                        1
                                      )
                                    }}
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
                                            className={`${data.FLOW_CODE ? 'bg-yellow-500/10' : ''}`}
                                          >
                                            {data.PRODUCT_TYPE_NAME}
                                            {data.FLOW_CODE ? (
                                              <>
                                                <br />
                                                <span className='text-gray-400'>
                                                  (exists on Flow "{data.FLOW_CODE}")
                                                </span>
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' color='success'>
            Save & Complete
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleUpdate}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
      {setProcessSelected && (
        <FlowProcessSelectModal
          setProcessSelected={setProcessSelected}
          setIsShowFlowProcessModal={setIsShowFlowProcessModal}
          isShowFlowProcessModal={isShowFlowProcessModal}
          getValues={getValues}
        />
      )}
      <ConfirmChangeProductTypeModal
        show={confirmChangeProductTypeModal}
        onConfirmClick={() => {
          handleSetProductType(productTypeValue, productTypeIndex)
        }}
        onCloseClick={() => setConfirmChangeProductTypeModal(false)}
        isDelete={false}
      />
    </>
  )
}

export default FlowProcessEditModal

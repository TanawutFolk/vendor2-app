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
import { FlowProcessI, ProductTypeOptionI } from '@/_workspace/types/flow/FlowProcess'
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'
import { MRT_Row } from 'material-react-table'
import { ProcessInterface } from './FlowProcessAddModal'
import { fetchProcessByFlowProcessId } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProcess'
import { Controller, useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  ProductMainOption
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import CustomTextField from '@/components/mui/TextField'
import UILoader from '@/components/ui-loader/UILoader'
import { SortableItem } from '../components/SortableItem'
import { ProcessOption } from '@/_workspace/types/process/Process'
import { fetchProcessByLikeProcessNameAndProductMainIdAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import { fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import { fetchFlowProductTypeByFlowId } from '@/_workspace/react-select/async-promise-load-options/fetchFlowProductType'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Props
interface ViewModalProps {
  openModalView: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<FlowProcessI> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<FlowProcessI> | null>>
}

const FlowProcessViewModal = ({ openModalView, setOpenModalView, rowSelected, setRowSelected }: ViewModalProps) => {
  const [processSelected, setProcessSelected] = useState<ProcessInterface[]>([])
  const [productTypeSelected, setProductTypeSelected] = useState<ProductTypeInterface[]>([])
  const [block, setBlock] = useState(true)
  const [noSelected, setNoSelected] = useState<number>()

  const [isShowFlowProcessModal, setIsShowFlowProcessModal] = useState(false)

  useEffect(() => {
    if (openModalView) {
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
  }, [openModalView])

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  const queryClient = useQueryClient()

  // Hooks : react-hook-form
  const { control, getValues, handleSubmit, watch } = useForm({
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

  const handleClose = () => {
    setOpenModalView(false)
    setRowSelected(null)
    // reset()
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
        open={openModalView}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            View Flow Process
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
                    disabled={true}
                    fullWidth
                    label='Flow Name'
                    placeholder='Enter Flow Name'
                    autoComplete='off'
                    // sx={{
                    //   '& .MuiInputLabel-root': {
                    //     lineHeight: '1.4 !important'
                    //   }
                    // }}
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
                  />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          {processSelected.length === 0 && !block ? (
                            <TableRow sx={{ backgroundColor: 'var(--mui-palette-success-lighterOpacity)' }}>
                              <TableCell colSpan={4} align='center'>
                                No Process
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
                                  disabled={true}
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
                                            disabled={true}
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
                                            isDisabled={true}
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
                    <TableContainer
                      sx={{
                        border: '1px solid var(--mui-palette-customColors-inputBorder)',
                        borderRadius: '4px',
                        marginTop: '20px'
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
                                <TableCell>{null}</TableCell>
                                <TableCell>
                                  <AsyncSelectCustom<ProductTypeOptionI>
                                    value={
                                      productTypeSelected[index].PRODUCT_TYPE_CODE &&
                                      productTypeSelected[index].PRODUCT_TYPE_NAME
                                        ? productTypeSelected[index]
                                        : null
                                    }
                                    isDisabled={true}
                                    onChange={value => {
                                      setProductTypeSelected(prevState => {
                                        const newItems = [...prevState]
                                        newItems[index] = {
                                          PRODUCT_TYPE_ID: value?.PRODUCT_TYPE_ID ?? null,
                                          PRODUCT_TYPE_CODE: value?.PRODUCT_TYPE_CODE ?? null,
                                          PRODUCT_TYPE_NAME: value?.PRODUCT_TYPE_NAME ?? null
                                        }
                                        return newItems
                                      })
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
                                    isDisabled={true}
                                    onChange={value => {
                                      setProductTypeSelected(prevState => {
                                        const newItems = [...prevState]
                                        newItems[index] = {
                                          PRODUCT_TYPE_ID: value?.PRODUCT_TYPE_ID ?? null,
                                          PRODUCT_TYPE_CODE: value?.PRODUCT_TYPE_CODE ?? null,
                                          PRODUCT_TYPE_NAME: value?.PRODUCT_TYPE_NAME ?? null
                                        }
                                        return newItems
                                      })
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
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default FlowProcessViewModal

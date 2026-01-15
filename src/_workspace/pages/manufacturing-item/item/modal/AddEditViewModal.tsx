// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useState } from 'react'

import { useDxContext } from '@/_template/DxContextProvider'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'

import Typography from '@mui/material/Typography'

// Core Imports
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { Controller, useForm, useFormState } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import type { MRT_Row } from 'material-react-table'

import { zodResolver } from '@hookform/resolvers/zod'

// React Hook Form Imports

// React Query Imports

// Material React Table Imports

// Component Imports
import ConfirmModal from '@/components/ConfirmModal'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import Transition from '@/components/TransitionDialog'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Libs Imports
import type AxiosResponseI from '@/libs/axios/types/AxiosResponseInterface'
import type { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'

// _workspace Imports
import { PREFIX_QUERY_KEY, useCreate, useUpdate } from '@/_workspace/react-query/hooks/useManufacturingItemData'

// Your imports
import { ManufacturingItemI } from '@/_workspace/types/manufacturing-item/ManufacturingItem'
import type { FormData } from './validationSchema'
import { validationSchema } from './validationSchema'

import { fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'

import { fetchColorByColorNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchColor'
import { fetchGetByLikeItemGroupName } from '@/_workspace/react-select/async-promise-load-options/fetchItemGroup'
import { fetchItemPurposeByItemPurposeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemPurpose'
import { fetchMakerByMakerNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchMaker'
import { fetchShapeByShapeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchShape'
import { fetchGetThemeColor } from '@/_workspace/react-select/async-promise-load-options/fetchThemeColor'
import { fetchSymbolBySymbolAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchUnitOfMeasurement'
import { fetchVendorByVendorName } from '@/_workspace/react-select/async-promise-load-options/fetchVendor'
import { ImageFromUrlRawData } from '@/libs/react-query/hooks/common-system/useImageData'
import noImage from '@assets/images/common/no-image-2.jpg'
import { Spinner } from 'reactstrap'
import ImageSwiperThumbnails from '../swiper/ImageSwiperThumbnails'
import { formatNumber } from '@/utils/formatting-checking-value/checkingValueTypes'
import { toast } from 'react-toastify'
import { canSeeCol } from '@/_workspace/pages/sct/sct-for-product/SearchResult'

type ManufacturingItemModalProps =
  | {
      mode: 'View'
      openModal: boolean
      setOpenModal: Dispatch<SetStateAction<boolean>>
      rowSelected: MRT_Row<ManufacturingItemI>
    }
  | {
      mode: 'Add'
      openModal: boolean
      setOpenModal: Dispatch<SetStateAction<boolean>>
      setIsEnableFetching: Dispatch<SetStateAction<boolean>>
    }
  | {
      mode: 'Edit'
      openModal: boolean
      setOpenModal: Dispatch<SetStateAction<boolean>>
      setIsEnableFetching: Dispatch<SetStateAction<boolean>>
      rowSelected: MRT_Row<ManufacturingItemI>
    }

interface ImagePreview {
  id: string
  url: string
  file: File
  isDefault?: boolean
  base64: string
}

const ManufacturingModal = (props: ManufacturingItemModalProps) => {
  const { mode, openModal, setOpenModal } = props

  const [isFetchingImage, setIsFetchingImage] = useState(true)
  const [image, setImage] = useState(noImage)

  const getDefaultValues = (): FormData => {
    switch (mode) {
      case 'Add':
        return {
          itemCategory: null,
          itemPurpose: null,
          itemGroup: null,
          vendor: null,
          maker: null,
          color: null,
          shape: null,
          itemInternalCode: '',
          // itemInternalCode: null,
          itemInternalFullName: '',
          itemInternalShortName: '',
          itemExternalCode: '',
          itemExternalFullName: '',
          itemExternalShortName: '',
          purchaseUnitRatio: '1',
          purchaseUnit: null,
          usageUnitRatio: '',
          usageUnit: null,
          moq: '',
          width: '',
          height: '',
          depth: '',
          leadTime: '',
          safetyStock: '',
          themeColor: null,
          itemCodeForSupportMes: '',
          images: []
        }

      case 'Edit':
      case 'View':
        return {
          itemCategory: {
            ITEM_CATEGORY_ID: props.rowSelected.original.ITEM_CATEGORY_ID,
            ITEM_CATEGORY_NAME: props.rowSelected.original.ITEM_CATEGORY_NAME,
            ITEM_CATEGORY_ALPHABET: props.rowSelected.original.ITEM_CATEGORY_ALPHABET,
            PURCHASE_MODULE_ID: props.rowSelected.original.PURCHASE_MODULE_ID
          },
          itemPurpose: {
            ITEM_PURPOSE_ID: props.rowSelected.original.ITEM_PURPOSE_ID,
            ITEM_PURPOSE_NAME: props.rowSelected.original.ITEM_PURPOSE_NAME
          },
          itemGroup: {
            ITEM_GROUP_ID: props.rowSelected.original.ITEM_GROUP_ID,
            ITEM_GROUP_NAME: props.rowSelected.original.ITEM_GROUP_NAME
          },
          vendor: {
            VENDOR_ID: props.rowSelected.original.VENDOR_ID,
            VENDOR_NAME: props.rowSelected.original.VENDOR_NAME
          },
          maker: {
            MAKER_ID: props.rowSelected.original.MAKER_ID,
            MAKER_NAME: props.rowSelected.original.MAKER_NAME
          },
          color: props.rowSelected.original.ITEM_PROPERTY_COLOR_ID
            ? {
                ITEM_PROPERTY_COLOR_ID: props.rowSelected.original.ITEM_PROPERTY_COLOR_ID,
                ITEM_PROPERTY_COLOR_NAME: props.rowSelected.original.ITEM_PROPERTY_COLOR_NAME
              }
            : null,
          shape: props.rowSelected.original.ITEM_PROPERTY_SHAPE_ID
            ? {
                ITEM_PROPERTY_SHAPE_ID: props.rowSelected.original.ITEM_PROPERTY_SHAPE_ID,
                ITEM_PROPERTY_SHAPE_NAME: props.rowSelected.original.ITEM_PROPERTY_SHAPE_NAME
              }
            : null,
          // itemInternalCode: props.rowSelected.original.ITEM_INTERNAL_CODE,
          itemInternalFullName: props.rowSelected.original.ITEM_INTERNAL_FULL_NAME,
          itemInternalShortName: props.rowSelected.original.ITEM_INTERNAL_SHORT_NAME,
          itemExternalCode: props.rowSelected.original.ITEM_EXTERNAL_CODE,
          itemExternalFullName: props.rowSelected.original.ITEM_EXTERNAL_FULL_NAME,
          itemExternalShortName: props.rowSelected.original.ITEM_EXTERNAL_SHORT_NAME,
          purchaseUnitRatio: props.rowSelected.original.PURCHASE_UNIT_RATIO.toString(),
          purchaseUnit: {
            UNIT_OF_MEASUREMENT_ID: props.rowSelected.original.PURCHASE_UNIT_ID,
            SYMBOL: props.rowSelected.original.PURCHASE_UNIT_SYMBOL
          },
          usageUnitRatio: formatNumber(props.rowSelected.original?.USAGE_UNIT_RATIO, 7, false),
          usageUnit: {
            UNIT_OF_MEASUREMENT_ID: props.rowSelected.original.USAGE_UNIT_ID,
            SYMBOL: props.rowSelected.original.USAGE_UNIT_SYMBOL
          },
          moq: props.rowSelected.original?.MOQ !== null ? props.rowSelected.original?.MOQ.toString() : '',
          leadTime:
            props.rowSelected.original?.LEAD_TIME !== null ? props.rowSelected.original?.LEAD_TIME.toString() : '',
          safetyStock: props.rowSelected.original?.SAFETY_STOCK
            ? props.rowSelected.original?.SAFETY_STOCK.toString()
            : '',
          themeColor: props.rowSelected.original.COLOR_ID
            ? {
                COLOR_ID: props.rowSelected.original.COLOR_ID,
                COLOR_NAME: props.rowSelected.original.COLOR_NAME,
                COLOR_HEX: props.rowSelected.original.COLOR_HEX
              }
            : null,
          itemCodeForSupportMes: props.rowSelected.original.ITEM_CODE_FOR_SUPPORT_MES,
          versionNo: props.rowSelected.original.VERSION_NO,
          width: props.rowSelected.original?.WIDTH !== null ? props.rowSelected.original?.WIDTH.toString() : '',
          height: props.rowSelected.original?.HEIGHT !== null ? props.rowSelected.original?.HEIGHT.toString() : '',
          depth: props.rowSelected.original?.DEPTH !== null ? props.rowSelected.original?.DEPTH.toString() : '',
          images:
            props.rowSelected.original.images?.map((image: any) => ({
              id: image.id || Math.random().toString(36).substring(2, 9),
              url: image.url || '',
              base64: image.base64 || '',
              isDefault: image.isDefault || false
            })) ?? []
        }
    }
  }

  const { control, handleSubmit, getValues, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaultValues()
  })

  useEffect(() => {
    if (
      props?.rowSelected?.original?.ITEM_CODE_FOR_SUPPORT_MES !== 'None' &&
      props?.rowSelected?.original?.ITEM_CODE_FOR_SUPPORT_MES !== null
    ) {
      ImageFromUrlRawData(
        props?.rowSelected?.original?.ITEM_CODE_FOR_SUPPORT_MES,
        setImage,
        setValue,
        setIsFetchingImage
      )
    } else {
      setIsFetchingImage(false)
      setImage(noImage)
      // setValue('itemPropertyImageSrc', '', {
      //   shouldDirty: true,
      //   shouldValidate: true
      // })
    }
  }, [])

  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const { setIsEnableFetching } = useDxContext()

  const [previews, setPreviews] = useState<ImagePreview[]>(getValues('images') || [])

  const [openImage, setOpenImage] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const handleClose = () => {
    reset()

    setPreviews([])

    setOpenModal(false)
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, onChange: Function) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)

      const newPreviews = await Promise.all(
        files.map(async file => {
          const base64 = await convertToBase64(file) // แปลงไฟล์เป็น Base64
          return {
            id: Math.random().toString(36).substring(2, 9),
            url: base64, // ใช้ base64 แทน URL.createObjectURL(file)
            base64, // เก็บ Base64 แทน file
            isDefault: false
          }
        })
      )

      setPreviews((prev: any) => {
        const updatedPreviews = [...prev, ...newPreviews] // รวมรูปเก่ากับรูปใหม่
        const hasDefault = updatedPreviews.some((preview: any) => preview.isDefault)

        if (!hasDefault && updatedPreviews.length > 0) {
          updatedPreviews[0].isDefault = true // ตั้งค่ารูปแรกเป็น Default ถ้ายังไม่มี
        }

        return updatedPreviews
      })

      if (onChange) {
        setPreviews(prev => {
          onChange(prev.map(({ base64, isDefault }) => ({ base64, isDefault }))) // ส่งค่ารูปทั้งหมด
          return prev
        })
      }
    }
  }

  const handleSetDefault = (id: string, onChange: Function) => {
    if (mode === 'View') return
    setPreviews(prev => {
      const updatedPreviews = prev.map(preview => ({
        ...preview,
        isDefault: preview.id === id // ✅ ตั้งค่ารูปที่เลือกเป็น default
      }))

      if (onChange) {
        onChange(updatedPreviews.map(({ base64, isDefault }) => ({ base64, isDefault }))) // ✅ แจ้ง React Hook Form
      }

      return updatedPreviews
    })
  }

  const handleDelete = (id: string, onChange: Function) => {
    if (mode === 'View') return
    setPreviews(prev => {
      const isDeletedDefault = prev.find(p => p.id === id)?.isDefault
      const filteredPreviews = prev.filter(preview => preview.id !== id)

      // ถ้าลบรูป default และยังมีรูปเหลืออยู่ ให้ตั้งรูปแรกเป็น default
      if (isDeletedDefault && filteredPreviews.length > 0) {
        filteredPreviews[0].isDefault = true
      }

      // ✅ เรียก onChange พร้อมส่งค่าใหม่ (เฉพาะ Base64)
      if (onChange) {
        onChange(filteredPreviews.map(({ base64, isDefault }) => ({ base64, isDefault })))
      }

      return filteredPreviews
    })
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleOpenImage = (index: number) => {
    setSelectedImageIndex(index)
    setOpenImage(true)
  }

  const handleCloseImage = () => {
    console.log('handleCloseImage')

    setOpenImage(false)
    setSelectedImageIndex(null)
  }

  const handlePrevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + previews.length) % previews.length)
    }
  }

  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % previews.length)
    }
  }

  // #region react-hook-form

  const { errors, isDirty, dirtyFields } = useFormState({
    control
  })

  const onSubmit: SubmitHandler<FormData> = data => {
    // console.log('อัปโหลดไฟล์:', data.image)
    setOpenConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('ERROR', data)
  }

  // #endregion react-hook-form

  // #region react-query
  const queryClient = useQueryClient()

  const handleAddEdit = () => {
    const dataItem: {
      ITEM_ID: number | ''
      ITEM_CATEGORY_ID: number
      ITEM_PURPOSE_ID: number
      ITEM_GROUP_ID: number
      VENDOR_ID: number
      MAKER_ID: number
      ITEM_PROPERTY_COLOR_ID: number | ''
      ITEM_PROPERTY_SHAPE_ID: number | ''
      ITEM_PROPERTY_MADE_BY_ID: string
      ITEM_INTERNAL_CODE: string | null
      ITEM_INTERNAL_FULL_NAME: string
      ITEM_INTERNAL_SHORT_NAME: string
      ITEM_EXTERNAL_CODE: string
      ITEM_EXTERNAL_FULL_NAME: string
      ITEM_EXTERNAL_SHORT_NAME: string
      IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE: number
      PURCHASE_UNIT_RATIO: number
      USAGE_UNIT_RATIO: number
      PURCHASE_UNIT_ID: number
      USAGE_UNIT_ID: number
      WIDTH: number | ''
      HEIGHT: number | ''
      DEPTH: number | ''
      MOQ: number | ''
      LEAD_TIME: number | ''
      SAFETY_STOCK: number | ''

      COLOR_ID: number | ''
      ITEM_CODE_FOR_SUPPORT_MES: string
      CREATE_BY: string
      UPDATE_BY: string
      IMG: {
        BASE64: string
        isDefault: boolean
      }[]
      IMG_NUMBER: number
      IS_UP_VERSION: number
      INUSE: number
    } = {
      ITEM_ID: mode === 'Add' ? '' : props?.rowSelected?.original?.ITEM_ID,
      ITEM_CATEGORY_ID: getValues('itemCategory').ITEM_CATEGORY_ID,
      ITEM_PURPOSE_ID: getValues('itemPurpose').ITEM_PURPOSE_ID,
      ITEM_GROUP_ID: getValues('itemGroup').ITEM_GROUP_ID,
      VENDOR_ID: getValues('vendor').VENDOR_ID,
      MAKER_ID: getValues('maker').MAKER_ID,
      ITEM_PROPERTY_COLOR_ID: getValues('color')?.ITEM_PROPERTY_COLOR_ID ?? '',
      ITEM_PROPERTY_SHAPE_ID: getValues('shape')?.ITEM_PROPERTY_SHAPE_ID ?? '',
      ITEM_PROPERTY_MADE_BY_ID: '',
      // ITEM_INTERNAL_CODE: getValues('itemInternalCode'),
      ITEM_INTERNAL_CODE: '',
      ITEM_INTERNAL_FULL_NAME: getValues('itemInternalFullName'),
      ITEM_INTERNAL_SHORT_NAME: getValues('itemInternalShortName'),
      ITEM_EXTERNAL_CODE: getValues('itemExternalCode'),
      ITEM_EXTERNAL_FULL_NAME: getValues('itemExternalFullName'),
      ITEM_EXTERNAL_SHORT_NAME: getValues('itemExternalShortName'),
      IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE: 0,
      PURCHASE_UNIT_RATIO: getValues('purchaseUnitRatio') ?? 1,
      PURCHASE_UNIT_ID: getValues('purchaseUnit').UNIT_OF_MEASUREMENT_ID,
      USAGE_UNIT_RATIO: getValues('usageUnitRatio'),
      USAGE_UNIT_ID: getValues('usageUnit').UNIT_OF_MEASUREMENT_ID,
      WIDTH: getValues('width') ?? '',
      HEIGHT: getValues('height') ?? '',
      DEPTH: getValues('depth') ?? '',

      MOQ: getValues('moq') ?? '',
      LEAD_TIME: getValues('leadTime') ?? '',
      SAFETY_STOCK: getValues('safetyStock') ?? '',

      COLOR_ID: getValues('themeColor')?.COLOR_ID ?? '',
      ITEM_CODE_FOR_SUPPORT_MES: getValues('itemCodeForSupportMes'),
      CREATE_BY: getUserData()?.EMPLOYEE_CODE,
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
      IMG: getValues('images'),
      IMG_NUMBER: getValues('images')?.length ?? 0,
      IS_UP_VERSION: dirtyFields.purchaseUnit || dirtyFields.usageUnit || dirtyFields.usageUnitRatio ? 1 : 0,
      INUSE: 1
    }

    if (mode === 'Add') {
      createMutate(dataItem)
    } else if (mode === 'Edit') {
      if (!props?.rowSelected?.original?.ITEM_ID) {
        toast.error('ITEM_ID not found')
        return
      }

      // dataItem.ITEM_ID = props.rowSelected?.original.ITEM_ID
      // console.log(dataItem)
      updateMutate(dataItem)
    }
  }

  const onMutateSuccess = (data: AxiosResponseI) => {
    if (data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Manufacturing Item'
      }

      ToastMessageSuccess(message)
      setIsEnableFetching(true)
      setOpenConfirmModal(false)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      reset()
      setPreviews([])
      handleClose()
    } else {
      const message = {
        title: 'Add ',
        message: data.data.Message.startsWith('1062') ? 'Duplicate Manufacturing Item' : data.data.Message
      }

      ToastMessageError(message)
      setOpenConfirmModal(false)
    }
  }

  const onMutateError = (e: AxiosResponseWithErrorI) => {
    const message = {
      title: 'Add Manufacturing Item',
      message: e.message
    }

    ToastMessageError(message)
    setOpenConfirmModal(false)
  }

  const { mutate: createMutate, isPending: isCreating } = useCreate(onMutateSuccess, onMutateError)
  const { mutate: updateMutate, isPending: isUpdating } = useUpdate(onMutateSuccess, onMutateError)

  // #endregion react-query

  // Render
  return (
    <>
      <Dialog
        maxWidth='xl'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        // poodit
        open={openModal || false}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            {mode} Manufacturing Item
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Header
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='itemCategory'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Item Category Name'
                      getOptionLabel={data => data?.ITEM_CATEGORY_NAME}
                      getOptionValue={data => data.ITEM_CATEGORY_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.itemCategory && { error: true, helperText: errors.itemCategory.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(
                          inputValue
                        )
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View' || mode === 'Edit'}
                      {...(errors.itemCategory && {
                        error: true,
                        helperText: errors.itemCategory.message
                      })}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='itemCodeForSupportMes'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Item Code'
                    placeholder='Enter ...'
                    {...(errors.itemCodeForSupportMes && {
                      error: true,
                      helperText: errors.itemCodeForSupportMes.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View' || mode === 'Edit'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='versionNo'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Version No. (Auto)'
                    placeholder='Auto'
                    fullWidth
                    autoComplete='off'
                    disabled
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Component
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='itemPurpose'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Item Purpose Name'
                      getOptionLabel={data => data?.ITEM_PURPOSE_NAME}
                      getOptionValue={data => data.ITEM_PURPOSE_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.itemPurpose && { error: true, helperText: errors.itemPurpose.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchItemPurposeByItemPurposeNameAndInuse(inputValue)
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View' || mode === 'Edit'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='itemGroup'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Item Group Name'
                      getOptionLabel={data => data?.ITEM_GROUP_NAME}
                      getOptionValue={data => data.ITEM_GROUP_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.itemGroup && { error: true, helperText: errors.itemGroup.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchGetByLikeItemGroupName(inputValue)
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View' || mode === 'Edit'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='vendor'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Vendor Name'
                      getOptionLabel={data => data?.VENDOR_NAME}
                      getOptionValue={data => data.VENDOR_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.vendor && { error: true, helperText: errors.vendor.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        // return fetchVendorByVendorNameAndInuse(inputValue)
                        return fetchVendorByVendorName(inputValue)
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View' || mode === 'Edit'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='maker'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Maker Name'
                      getOptionLabel={data => data?.MAKER_NAME}
                      getOptionValue={data => data.MAKER_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.maker && { error: true, helperText: errors.maker.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchMakerByMakerNameAndInuse(inputValue)
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View' || mode === 'Edit'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Property
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={4}>
              <Controller
                name='images'
                control={control}
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <>
                    {/* <Box
                          sx={{
                            marginLeft: 2.5,
                            fontSize: '0.8125rem'
                          }}
                          mt={3.5}
                        >
                          <div>Images</div>
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            marginLeft: 2.5,
                            border: errors?.images ? '2px solid #d32f2f' : '1px solid grey',
                            borderRadius: '6px'
                          }}
                        >
                          <Grid container spacing={2}>
                            {previews.map((preview, index): any => (
                              <Grid item xs={12} sm={6} md={4} key={preview.id}>
                                <Card
                                  sx={{
                                    position: 'relative',
                                    border: preview.isDefault
                                      ? '3px solid #2196f3'
                                      : errors?.images
                                        ? '1px solid #d32f2f'
                                        : '1px solid transparent',
                                    transition: 'border 0.2s ease-in-out'
                                  }}
                                >
                                  <CardActionArea
                                    onClick={() => {
                                      if (mode === 'View') {
                                        handleOpenImage(index)
                                      } else {
                                        handleSetDefault(preview.id, onChange)
                                      }
                                    }}
                                  >
                                    <CardMedia
                                      component='img'
                                      height='200'
                                      // image={preview.url}
                                      image={preview.base64}
                                      alt='Preview'
                                      sx={{ objectFit: 'contain' }}
                                    />
                                    {preview.isDefault && (
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          top: 5,
                                          left: 5,
                                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                          borderRadius: '50%',
                                          padding: '2px'
                                        }}
                                      >
                                        <CheckCircleIcon color='primary' />
                                      </Box>
                                    )}
                                  </CardActionArea>
                                  <IconButton
                                    sx={{
                                      position: 'absolute',
                                      top: 5,
                                      right: 5,
                                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                      }
                                    }}
                                    size='small'
                                    onClick={e => {
                                      e.stopPropagation()
                                      handleDelete(preview.id, onChange)
                                    }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Card>
                                {preview.isDefault && (
                                  <Typography variant='caption' color='primary' sx={{ mt: 1, display: 'block' }}>
                                    Default Image
                                  </Typography>
                                )}
                              </Grid>
                            ))}
                            {previews.length < 10 && (
                              <Grid item xs={12} sm={6} md={4}>
                                <Card
                                  sx={{
                                    height: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    border: errors?.images ? '1px solid #d32f2f' : 'none'
                                  }}
                                >
                                  <label htmlFor='image-upload'>
                                    <Input
                                      accept='image/*'
                                      id='image-upload'
                                      multiple
                                      type='file'
                                      onChange={e => handleImageChange(e, onChange)}
                                      disabled={mode === 'View'}
                                      {...fieldProps}
                                    />
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                      }}
                                    >
                                      <AddPhotoAlternateIcon
                                        sx={{
                                          fontSize: 40,
                                          color: errors?.images ? '#d32f2f' : 'gray'
                                        }}
                                      />
                                      <Typography variant='body2' color={errors?.images ? 'error' : 'textSecondary'}>
                                        Add more ({previews.length}/10)
                                      </Typography>
                                    </Box>
                                  </label>
                                </Card>
                              </Grid>
                            )}
                          </Grid>
                          {errors?.images?.[0]?.base64?.message && (
                            <FormHelperText error sx={{ mt: 1, textAlign: 'center' }}>
                              {errors.images[0].base64.message}
                            </FormHelperText>
                          )}
                        </Box>

                        {/* Dialog สำหรับดูรูปภาพขนาดใหญ่ */}
                    {/* <Dialog open={openImage} onClose={handleCloseImage} maxWidth='lg' fullWidth>
                          <DialogTitle sx={{ textAlign: 'center' }}>
                            Image {selectedImageIndex !== null ? `(${selectedImageIndex + 1}/${previews.length})` : ''}
                            <IconButton
                              edge='end'
                              color='inherit'
                              onClick={handleCloseImage}
                              aria-label='close'
                              sx={{ position: 'absolute', right: 15, top: 8 }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </DialogTitle>
                          <DialogContent
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'relative'
                            }}
                          >
                            <Box display='flex' alignItems='center' justifyContent='center'>
                              <IconButton onClick={handlePrevImage} sx={{ marginRight: 2 }}>
                                <ArrowBackIosNewIcon />
                              </IconButton>

                              <CardMedia
                                component='img'
                                image={previews[selectedImageIndex ?? 0]?.base64}
                                alt='Preview'
                                sx={{ maxHeight: '80vh', maxWidth: '80%', objectFit: 'contain' }}
                              />

                              <IconButton onClick={handleNextImage} sx={{ marginLeft: 2 }}>
                                <ArrowForwardIosIcon />
                              </IconButton>
                            </Box>
                          </DialogContent>
                        </Dialog> */}
                    <div className='d-flex'>
                      {/* <div className='me-25' style={{ width: '100%' }}> */}
                      {isFetchingImage ? (
                        <Spinner />
                      ) : image.length > 0 && typeof image == 'object' ? (
                        <ImageSwiperThumbnails imageArray={image} />
                      ) : (
                        <img
                          className='rounded me-50'
                          src={image || ''}
                          alt='Not found image !'
                          width='85'
                          height='72'
                        />
                      )}
                      {/* </div> */}
                    </div>
                  </>
                )}
              />
            </Grid>
            <Grid item xs={8}>
              <Grid container item spacing={3}>
                <Grid item xs={4}>
                  <Controller
                    name='width'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        label='Width [mm] (optional)'
                        placeholder='Enter ...'
                        {...(errors.width && {
                          error: true,
                          helperText: errors.width.message
                        })}
                        fullWidth
                        autoComplete='off'
                        disabled={mode === 'View'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name='height'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        label='Height [mm] (optional)'
                        placeholder='Enter ...'
                        {...(errors.height && {
                          error: true,
                          helperText: errors.height.message
                        })}
                        fullWidth
                        autoComplete='off'
                        disabled={mode === 'View'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name='depth'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <CustomTextField
                        {...fieldProps}
                        label='Depth [mm] (optional)'
                        placeholder='Enter ...'
                        {...(errors.depth && {
                          error: true,
                          helperText: errors.depth.message
                        })}
                        fullWidth
                        autoComplete='off'
                        disabled={mode === 'View'}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name='color'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <>
                        <AsyncSelectCustom
                          {...fieldProps}
                          label='Color (optional)'
                          getOptionLabel={data => data?.ITEM_PROPERTY_COLOR_NAME}
                          getOptionValue={data => data.ITEM_PROPERTY_COLOR_ID.toString()}
                          placeholder='Select ...'
                          {...(errors.color && { error: true, helperText: errors.color.message })}
                          loadOptions={inputValue => {
                            if (mode === 'View') {
                              return Promise.resolve([])
                            }

                            return fetchColorByColorNameAndInuse(inputValue)
                          }}
                          isClearable
                          cacheOptions
                          defaultOptions
                          classNamePrefix='select'
                          isDisabled={mode === 'View'}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={4}>
                  <Controller
                    name='shape'
                    control={control}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <>
                        <AsyncSelectCustom
                          {...fieldProps}
                          label='Shape (optional)'
                          getOptionLabel={data => data?.ITEM_PROPERTY_SHAPE_NAME}
                          getOptionValue={data => data.ITEM_PROPERTY_SHAPE_ID.toString()}
                          placeholder='Select ...'
                          {...(errors.shape && { error: true, helperText: errors.shape.message })}
                          loadOptions={inputValue => {
                            if (mode === 'View') {
                              return Promise.resolve([])
                            }

                            return fetchShapeByShapeNameAndInuse(inputValue)
                          }}
                          isClearable
                          cacheOptions
                          defaultOptions
                          classNamePrefix='select'
                          isDisabled={mode === 'View'}
                        />
                      </>
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Code & Name
                </Typography>
              </Divider>
            </Grid>
            {/* <Grid item xs={12} sm={4}>
              <Controller
                name='itemInternalCode'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Item Internal Code (Auto)'
                    placeholder='XXXXXXXXXXXXXXXXXXXXX'
                    {...(errors.itemInternalCode && { error: true, helperText: errors.itemInternalCode.message })}
                    fullWidth
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid> */}
            <Grid container item xs={12} spacing={2}>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='itemInternalFullName'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <CustomTextField
                      {...fieldProps}
                      label='Item Internal Full Name'
                      placeholder='Enter ...'
                      {...(errors.itemInternalFullName && {
                        error: true,
                        helperText: errors.itemInternalFullName.message
                      })}
                      fullWidth
                      autoComplete='off'
                      disabled={mode === 'View' || mode === 'Edit'}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='itemInternalShortName'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <CustomTextField
                      {...fieldProps}
                      label='Item Internal Short Name'
                      placeholder='Enter ...'
                      {...(errors.itemInternalShortName && {
                        error: true,
                        helperText: errors.itemInternalShortName.message
                      })}
                      fullWidth
                      autoComplete='off'
                      disabled={mode === 'View' || mode === 'Edit'}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='itemExternalFullName'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Item External Full Name'
                    placeholder='Enter ...'
                    {...(errors.itemExternalFullName && {
                      error: true,
                      helperText: errors.itemExternalFullName.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View' || mode === 'Edit'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='itemExternalShortName'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Item External Short Name'
                    placeholder='Enter ...'
                    {...(errors.itemExternalShortName && {
                      error: true,
                      helperText: errors.itemExternalShortName.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View' || mode === 'Edit'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='itemExternalCode'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Item External Code (P/N)'
                    placeholder='Enter ...'
                    {...(errors.itemExternalCode && { error: true, helperText: errors.itemExternalCode.message })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View' || mode === 'Edit'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Purchase Unit
                    </Typography>
                  </Divider>
                </Grid>
                <Grid item xs={6}>
                  <Divider textAlign='left'>
                    <Typography variant='body2' color='primary'>
                      Usage Unit
                    </Typography>
                  </Divider>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={3}>
              <Controller
                name='purchaseUnitRatio'
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Purchase Unit Ratio'
                    placeholder='Enter ...'
                    {...(errors.purchaseUnitRatio && {
                      error: true,
                      helperText: errors.purchaseUnitRatio.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View' || mode === 'Add' || mode === 'Edit'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='purchaseUnit'
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Purchase Unit Code'
                      getOptionLabel={data => data?.SYMBOL}
                      getOptionValue={data => data.UNIT_OF_MEASUREMENT_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.purchaseUnit && { error: true, helperText: errors.purchaseUnit.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchSymbolBySymbolAndInuse(inputValue)
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='usageUnitRatio'
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Usage Unit Ratio'
                    placeholder='Enter ...'
                    {...(errors.usageUnitRatio && {
                      error: true,
                      helperText: errors.usageUnitRatio.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='usageUnit'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Usage Unit Code'
                      getOptionLabel={data => data?.SYMBOL}
                      getOptionValue={data => data.UNIT_OF_MEASUREMENT_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.usageUnit && { error: true, helperText: errors.usageUnit.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchSymbolBySymbolAndInuse(inputValue)
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View'}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Item Stock
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='moq'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='MOQ [Purchase Unit] (optional)'
                    placeholder='Enter ...'
                    {...(errors.moq && {
                      error: true,
                      helperText: errors.moq.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='leadTime'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Lead Time [Day] (optional)'
                    placeholder='Enter ...'
                    {...(errors.leadTime && {
                      error: true,
                      helperText: errors.leadTime.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='safetyStock'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <CustomTextField
                    {...fieldProps}
                    label='Safety Stock [Purchase Unit] (optional)'
                    placeholder='Enter ...'
                    {...(errors.safetyStock && {
                      error: true,
                      helperText: errors.safetyStock.message
                    })}
                    fullWidth
                    autoComplete='off'
                    disabled={mode === 'View'}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Item Theme Color
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Controller
                name='themeColor'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <>
                    <AsyncSelectCustom
                      {...fieldProps}
                      label='Theme Color (optional)'
                      getOptionLabel={data => data?.COLOR_NAME}
                      getOptionValue={data => data.COLOR_ID.toString()}
                      placeholder='Select ...'
                      {...(errors.themeColor && { error: true, helperText: errors.themeColor.message })}
                      loadOptions={inputValue => {
                        if (mode === 'View') {
                          return Promise.resolve([])
                        }

                        return fetchGetThemeColor(inputValue)
                      }}
                      isClearable
                      cacheOptions
                      defaultOptions
                      classNamePrefix='select'
                      isDisabled={mode === 'View'}
                    />
                  </>
                )}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Other
                </Typography>
              </Divider>
            </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions>
          {mode !== 'View' && (
            <Button
              onClick={() => {
                if (mode === 'Edit') {
                  if (isDirty === false || Object.keys(dirtyFields).length === 0) {
                    toast.error('ข้อมูลไม่ได้เปลี่ยนแปลง (No changes made)')
                    return
                  } else {
                    if (dirtyFields.purchaseUnit || dirtyFields.usageUnit || dirtyFields.usageUnitRatio) {
                      if (canSeeCol === false) {
                        toast.error(
                          'ไม่สามารถแก้ไขข้อมูล เกี่ยวกับ Purchase Unit และ Usage Unit ได้ กรุณาติดต่อผู้ดูแลระบบ.Unable to edit information related to Purchase Unit and Usage Unit. Please contact the system administrator.',
                          {
                            autoClose: 10000
                          }
                        )
                        return
                      }
                    }
                  }
                }
                handleSubmit(onSubmit, onError)()
              }}
              variant='contained'
              disabled={isCreating || isUpdating}
              color='success'
            >
              Save & Complete
            </Button>
          )}
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={openConfirmModal}
          onConfirmClick={handleAddEdit}
          onCloseClick={() => setOpenConfirmModal(false)}
          isDelete={false}
          isLoading={isCreating || isUpdating}
        />
      </Dialog>
    </>
  )
}

export default ManufacturingModal

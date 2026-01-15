import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { Controller, useForm } from 'react-hook-form'

import { FormData } from '../modal/BomAddModal'

import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'

import { fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemCategory'
import { fetchItemPurposeByItemPurposeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemPurpose'
import { fetchVendorByVendorNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchVendor'
import { fetchMakerByMakerNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchMaker'
import { fetchColorByColorNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchColor'
import { fetchShapeByShapeNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchShape'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOption from '@/libs/react-select/option/StatusOption'
import { ToastMessageError } from '@/components/ToastMessage'
import ManufacturingItemServices from '@/_workspace/services/manufacturing-item/ManufacturingItemServices'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  rowSelected: FormData
  setRowSelected: Dispatch<SetStateAction<FormData>>
  isOpenViewItemModal: boolean
  setIsOpenViewItemModal: Dispatch<SetStateAction<boolean>>
}

const ViewItemModal = ({ rowSelected, setRowSelected, isOpenViewItemModal, setIsOpenViewItemModal }: Props) => {
  const { control } = useForm<any>({
    defaultValues: async (): Promise<FormData> => {
      try {
        const result = await ManufacturingItemServices.getViewItemDataByItemId({
          ITEM_ID: rowSelected.ITEM_ID
        })

        console.log(result?.data.ResultOnDb[0])

        return {
          itemCategory: {
            ITEM_CATEGORY_ID: result?.data.ResultOnDb[0]?.ITEM_CATEGORY_ID,
            ITEM_CATEGORY_NAME: result?.data.ResultOnDb[0]?.ITEM_CATEGORY_NAME
          },
          itemPurpose: {
            ITEM_PURPOSE_ID: result?.data.ResultOnDb[0]?.ITEM_PURPOSE_ID,
            ITEM_PURPOSE_NAME: result?.data.ResultOnDb[0]?.ITEM_PURPOSE_NAME
          },
          vendor: {
            VENDOR_ID: result?.data.ResultOnDb[0]?.VENDOR_ID,
            VENDOR_ALPHABET: result?.data.ResultOnDb[0]?.VENDOR_ALPHABET
          },
          maker: {
            MAKER_ID: result?.data.ResultOnDb[0]?.MAKER_ID,
            MAKER_NAME: result?.data.ResultOnDb[0]?.MAKER_NAME
          },
          color: {
            ITEM_PROPERTY_COLOR_ID: result?.data.ResultOnDb[0]?.ITEM_PROPERTY_COLOR_ID,
            ITEM_PROPERTY_COLOR_NAME: result?.data.ResultOnDb[0]?.ITEM_PROPERTY_COLOR_NAME
          },
          shape: {
            ITEM_PROPERTY_SHAPE_ID: result?.data.ResultOnDb[0]?.ITEM_PROPERTY_SHAPE_ID,
            ITEM_PROPERTY_SHAPE_NAME: result?.data.ResultOnDb[0]?.ITEM_PROPERTY_SHAPE_NAME
          },
          itemInternalCode: result?.data.ResultOnDb[0]?.ITEM_INTERNAL_CODE,
          itemInternalFullName: result?.data.ResultOnDb[0]?.ITEM_INTERNAL_FULL_NAME,
          itemInternalShortName: result?.data.ResultOnDb[0]?.ITEM_INTERNAL_SHORT_NAME,
          itemExternalCode: result?.data.ResultOnDb[0]?.ITEM_EXTERNAL_CODE,
          itemExternalFullName: result?.data.ResultOnDb[0]?.ITEM_EXTERNAL_FULL_NAME,
          itemExternalShortName: result?.data.ResultOnDb[0]?.ITEM_EXTERNAL_SHORT_NAME,
          purchaseUnitRatio: result?.data.ResultOnDb[0]?.PURCHASE_UNIT_RATIO,
          purchaseUnit: {
            UNIT_OF_MEASUREMENT_ID: result?.data.ResultOnDb[0]?.PURCHASE_UNIT_ID,
            UNIT_OF_MEASUREMENT_NAME: result?.data.ResultOnDb[0]?.PURCHASE_UNIT_NAME
          },
          usageUnitRatio: result?.data.ResultOnDb[0]?.USAGE_UNIT_RATIO,
          usageUnit: {
            UNIT_OF_MEASUREMENT_ID: result?.data.ResultOnDb[0]?.USAGE_UNIT_ID,
            UNIT_OF_MEASUREMENT_NAME: result?.data.ResultOnDb[0]?.USAGE_UNIT_NAME
          },
          moq: result?.data.ResultOnDb[0]?.MOQ,
          leadTime: result?.data.ResultOnDb[0]?.LEAD_TIME,
          safetyStock: result?.data.ResultOnDb[0]?.SAFETY_STOCK,
          themeColor: {
            COLOR_ID: result?.data.ResultOnDb[0]?.COLOR_ID,
            COLOR_NAME: result?.data.ResultOnDb[0]?.COLOR_NAME
          },
          itemCodeForSupportMes: result?.data.ResultOnDb[0]?.ITEM_CODE_FOR_SUPPORT_MES,
          status: StatusOption.find(item => item.value === result?.data.ResultOnDb[0]?.INUSE)
        }
      } catch (error) {
        console.log(error)
        const message = {
          title: 'Error',
          message: 'Failed to load data'
        }

        ToastMessageError(message)

        // setIsOpenViewItemModal(false)
      }
    }
  })

  // Functions
  const handleClose = () => {
    setIsOpenViewItemModal(false)
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
        open={isOpenViewItemModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            View Manufacturing Item
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Divider textAlign='left' className='mt-2'>
            <Typography variant='body1' color='primary'>
              Header
            </Typography>
          </Divider>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={2} lg={2} className='mt-2'>
              <Controller
                name='itemCategory'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      // return fetchItemCategoryRawMaterialAndConsumableAndPackingByLikeItemCategoryNameAndInuse(
                      //   inputValue
                      // )
                      return Promise.resolve([])
                    }}
                    getOptionLabel={data => data?.ITEM_CATEGORY_NAME || ''}
                    getOptionValue={data => data?.ITEM_CATEGORY_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Item Category'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Divider textAlign='left' className='mt-2'>
            <Typography variant='body1' color='primary'>
              Component
            </Typography>
          </Divider>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={2} lg={2} className='mt-2'>
              <Controller
                name='itemPurpose'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      // return fetchItemPurposeByItemPurposeNameAndInuse(inputValue)
                      return Promise.resolve([])
                    }}
                    getOptionLabel={data => data?.ITEM_PURPOSE_NAME || ''}
                    getOptionValue={data => data?.ITEM_PURPOSE_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Item Purpose'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2} lg={2} className='mt-2'>
              <Controller
                name='vendor'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      // return fetchVendorByVendorNameAndInuse(inputValue)
                      return Promise.resolve([])
                    }}
                    getOptionLabel={data => data?.VENDOR_ALPHABET || ''}
                    getOptionValue={data => data?.VENDOR_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Vendor'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2} lg={2} className='mt-2'>
              <Controller
                name='maker'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      // return fetchMakerByMakerNameAndInuse(inputValue)
                      return Promise.resolve([])
                    }}
                    getOptionLabel={data => data?.MAKER_NAME || ''}
                    getOptionValue={data => data?.MAKER_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Maker'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Divider textAlign='left' className='mt-2'>
            <Typography variant='body1' color='primary'>
              Property
            </Typography>
          </Divider>
          <Grid container spacing={6}>
            {/* <Grid item xs={12} sm={4} lg={4} className='mt-2'>
              IMAGE KUB
            </Grid> */}
            <Grid item xs={12} sm={2} lg={2} className='mt-2'>
              <Controller
                name='color'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      // return fetchColorByColorNameAndInuse(inputValue)
                      return Promise.resolve([])
                    }}
                    getOptionLabel={data => data?.ITEM_PROPERTY_COLOR_NAME || ''}
                    getOptionValue={data => data?.ITEM_PROPERTY_COLOR_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Color'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2} lg={2} className='mt-2'>
              <Controller
                name='shape'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      // return fetchShapeByShapeNameAndInuse(inputValue)
                      return Promise.resolve([])
                    }}
                    getOptionLabel={data => data?.ITEM_PROPERTY_SHAPE_NAME || ''}
                    getOptionValue={data => data?.ITEM_PROPERTY_SHAPE_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Shape'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider textAlign='left' className='mt-2'>
            <Typography variant='body1' color='primary'>
              Code & Name
            </Typography>
          </Divider>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='itemInternalCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Item Internal Code' autoComplete='off' disabled={true} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='itemInternalFullName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Item Internal Full Name'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='itemInternalShortName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Item Internal Short Name'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='itemExternalCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Item External Code' autoComplete='off' disabled={true} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='itemExternalFullName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Item External Full Name'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='itemExternalShortName'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Item External Short Name'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6} lg={6} className='mt-2'>
              <Divider textAlign='left' className='mt-2'>
                <Typography variant='body1' color='primary'>
                  Purchase Unit
                </Typography>
              </Divider>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6} lg={6} className='mt-2'>
                  <Controller
                    name='purchaseUnitRatio'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Purchase Unit Ratio'
                        autoComplete='off'
                        disabled={true}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6} className='mt-2'>
                  <Controller
                    name='purchaseUnit'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          // return fetchShapeByShapeNameAndInuse(inputValue)
                          return Promise.resolve([])
                        }}
                        getOptionLabel={data => data?.UNIT_OF_MEASUREMENT_NAME || ''}
                        getOptionValue={data => data?.UNIT_OF_MEASUREMENT_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Purchase Unit'
                        isDisabled={true}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6} lg={6} className='mt-2'>
              <Divider textAlign='left' className='mt-2'>
                <Typography variant='body1' color='primary'>
                  Usage Unit
                </Typography>
              </Divider>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6} lg={6} className='mt-2'>
                  <Controller
                    name='usageUnitRatio'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Usage Unit Ratio'
                        autoComplete='off'
                        disabled={true}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6} className='mt-2'>
                  <Controller
                    name='usageUnit'
                    control={control}
                    defaultValue={null}
                    render={({ field: { ref, ...fieldProps } }) => (
                      <AsyncSelectCustom
                        {...fieldProps}
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={inputValue => {
                          // return fetchShapeByShapeNameAndInuse(inputValue)
                          return Promise.resolve([])
                        }}
                        getOptionLabel={data => data?.UNIT_OF_MEASUREMENT_NAME || ''}
                        getOptionValue={data => data?.UNIT_OF_MEASUREMENT_ID?.toString() || ''}
                        classNamePrefix='select'
                        label='Usage Unit'
                        isDisabled={true}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider textAlign='left' className='mt-2'>
            <Typography variant='body1' color='primary'>
              Item Stock
            </Typography>
          </Divider>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='moq'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='MOQ [Purchase Unit]'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='leadTime'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth label='Lead Time (Days)' autoComplete='off' disabled={true} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='safetyStock'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Safety Stock [Purchase Unit]'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Divider textAlign='left' className='mt-2'>
            <Typography variant='body1' color='primary'>
              Item Theme Color
            </Typography>
          </Divider>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='themeColor'
                control={control}
                defaultValue={null}
                render={({ field: { ref, ...fieldProps } }) => (
                  <AsyncSelectCustom
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    loadOptions={inputValue => {
                      // return fetchShapeByShapeNameAndInuse(inputValue)
                      return Promise.resolve([])
                    }}
                    getOptionLabel={data => data?.COLOR_NAME || ''}
                    getOptionValue={data => data?.COLOR_ID?.toString() || ''}
                    classNamePrefix='select'
                    label='Theme Color'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Divider textAlign='left' className='mt-2'>
            <Typography variant='body1' color='primary'>
              Other
            </Typography>
          </Divider>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='itemCodeForSupportMes'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Item Code For Support MES & Old System'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3} lg={3} className='mt-2'>
              <Controller
                name='status'
                control={control}
                render={({ field: { ref, ...fieldProps } }) => (
                  <SelectCustom
                    {...fieldProps}
                    options={StatusOption}
                    isClearable
                    label='Status'
                    classNamePrefix='select'
                    isDisabled={true}
                  />
                )}
              />
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

export default ViewItemModal

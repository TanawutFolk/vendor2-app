import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction } from 'react'

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

import { MRT_Row } from 'material-react-table'

import { Controller, useForm } from 'react-hook-form'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SelectCustom from '@/components/react-select/SelectCustom'

import CustomTextField from '@/components/mui/TextField'

import { VendorI } from '@/_workspace/types/item-master/Vendor'

import {
  fetchItemImportTypeByItemImportTypeNameAndInuse,
  ItemImportTypeOption
} from '@/_workspace/react-select/async-promise-load-options/fetchItemImportType'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

// Dialog
const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Props
interface ViewModalProps {
  openModalView: boolean
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<VendorI> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<VendorI> | null>>
}

const VendorViewModal = ({ openModalView, setOpenModalView, rowSelected, setRowSelected }: ViewModalProps) => {
  // Hooks : react-hook-form
  const { control, watch } = useForm({
    defaultValues: {
      VENDOR_NAME: rowSelected?.original.VENDOR_NAME,
      VENDOR_ALPHABET: rowSelected?.original.VENDOR_ALPHABET,
      ITEM_IMPORT_TYPE: {
        ITEM_IMPORT_TYPE_ID: rowSelected?.original.ITEM_IMPORT_TYPE_ID,
        ITEM_IMPORT_TYPE_NAME: rowSelected?.original.ITEM_IMPORT_TYPE_NAME
      },
      VENDOR_CD_PRONES: rowSelected?.original.VENDOR_CD_PRONES,
      VENDOR_NAME_PRONES: rowSelected?.original.VENDOR_NAME_PRONES,
      INUSE: StatusOption.find(item => item.value == rowSelected?.original.inuseForSearch)
    }
  })

  // Functions

  const handleClose = () => {
    setOpenModalView(false)
    setRowSelected(null)
    // reset()
  }

  return (
    <>
      <Dialog
        maxWidth='sm'
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
            View Vendor
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Controller
                name='VENDOR_NAME'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Vendor Name'
                    placeholder='Enter...'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='VENDOR_ALPHABET'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Vendor Alphabet'
                    placeholder='Enter...'
                    autoComplete='off'
                    disabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='ITEM_IMPORT_TYPE'
                control={control}
                render={({ field: { onChange, ...fieldProps } }) => (
                  <AsyncSelectCustom<ItemImportTypeOption>
                    label='Item Import Type'
                    inputId='ITEM_IMPORT_TYPE'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    value={watch('ITEM_IMPORT_TYPE')}
                    onChange={value => {
                      onChange(value)
                    }}
                    loadOptions={inputValue => {
                      return fetchItemImportTypeByItemImportTypeNameAndInuse(inputValue)
                    }}
                    getOptionLabel={data => data.ITEM_IMPORT_TYPE_NAME.toString()}
                    getOptionValue={data => data.ITEM_IMPORT_TYPE_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select...'
                    isDisabled={true}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='body2' color='primary'>
                  Prones
                </Typography>
              </Divider>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='VENDOR_CD_PRONES'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Vendor Code Prones'
                    placeholder=''
                    autoComplete='off'
                    disabled={true}
                    // {...(errors.VENDOR_CD_PRONES && {
                    //   error: true,
                    //   helperText: errors.VENDOR_CD_PRONES.message
                    // })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='VENDOR_NAME_PRONES'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Vendor Name Prones'
                    placeholder=''
                    autoComplete='off'
                    disabled={true}
                    // {...(errors.VENDOR_NAME_PRONES && {
                    //   error: true,
                    //   helperText: errors.VENDOR_NAME_PRONES.message
                    // })}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='INUSE'
                control={control}
                render={({ field: { ...fieldProps } }) => (
                  <SelectCustom
                    {...fieldProps}
                    options={StatusOptionForEdit}
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

export default VendorViewModal

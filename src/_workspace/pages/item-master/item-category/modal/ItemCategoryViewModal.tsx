import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import { ItemCategoryI } from '@/_workspace/types/item-master/ItemCategory'

import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

import {
  fetchPurchaseModuleNameByPurchaseModuleNameAndInuse,
  PurchaseModuleOption
} from '@/_workspace/react-select/async-promise-load-options/fetchPurchaseModuleName'

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
  rowSelected: MRT_Row<ItemCategoryI> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<ItemCategoryI> | null>>
}

const ItemCategoryViewModal = ({ openModalView, setOpenModalView, rowSelected, setRowSelected }: ViewModalProps) => {
  // Hooks : react-hook-form
  const { control, getValues } = useForm({
    defaultValues: {
      ITEM_CATEGORY_NAME: rowSelected?.original.ITEM_CATEGORY_NAME,
      ITEM_CATEGORY_ALPHABET: rowSelected?.original.ITEM_CATEGORY_ALPHABET,
      ITEM_CATEGORY_SHORT_NAME: rowSelected?.original.ITEM_CATEGORY_SHORT_NAME,
      PURCHASE_MODULE_NAME: {
        PURCHASE_MODULE_ID: rowSelected?.original.PURCHASE_MODULE_ID,
        PURCHASE_MODULE_NAME: rowSelected?.original.PURCHASE_MODULE_NAME
      },
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
            View Item Category
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='ITEM_CATEGORY_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Item Category Name'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='ITEM_CATEGORY_ALPHABET'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Item Category Alphabet'
                  placeholder='Enter...'
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='ITEM_CATEGORY_SHORT_NAME'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Item Category Short Name'
                  placeholder={rowSelected?.original.ITEM_CATEGORY_SHORT_NAME === '' ? null : 'Enter...'}
                  autoComplete='off'
                  disabled={true}
                />
              )}
            />
          </Grid>
          <Grid className='mb-3'>
            <Controller
              name='PURCHASE_MODULE_NAME'
              control={control}
              render={({ field: { onChange, ...fieldProps } }) => (
                <>
                  <AsyncSelectCustom<PurchaseModuleOption>
                    label='Purchase Module Name'
                    inputId='PURCHASE_MODULE_NAME'
                    {...fieldProps}
                    isClearable
                    cacheOptions
                    defaultOptions
                    /* @ts-ignore */
                    value={getValues('PURCHASE_MODULE_NAME')}
                    onChange={value => {
                      onChange(value)
                    }}
                    loadOptions={inputValue => {
                      return fetchPurchaseModuleNameByPurchaseModuleNameAndInuse(inputValue)
                    }}
                    getOptionLabel={data => data.PURCHASE_MODULE_NAME.toString()}
                    getOptionValue={data => data.PURCHASE_MODULE_ID.toString()}
                    classNamePrefix='select'
                    placeholder='Select...'
                    isDisabled={true}
                  />
                </>
              )}
            />
          </Grid>
          <Grid>
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

export default ItemCategoryViewModal

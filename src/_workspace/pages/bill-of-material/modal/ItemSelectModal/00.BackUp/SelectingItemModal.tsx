import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

import { Divider, Grid, Slide, SlideProps, Typography } from '@mui/material'

import { FormProvider, useForm, useFormState } from 'react-hook-form'

import { MRT_FilterFns } from 'material-react-table'

import { useUpdateEffect } from 'react-use'
import ItemSelectModalSearch from '../ItemSelectModalSearch'
import ItemSelectModalTableData from '../ItemSelectModalTableData'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  rowIdSelected: string
  setRowIdSelected: Dispatch<SetStateAction<string>>
  isOpenSelectingItemModal: boolean
  setIsOpenSelectingItemModal: Dispatch<SetStateAction<boolean>>
  setValue: any
}

const columns = [
  'mrt-row-actions',
  'inuseForSearch',
  'IMAGE',
  'ITEM_CODE_FOR_SUPPORT_MES',
  'ITEM_INTERNAL_FULL_NAME',
  'ITEM_INTERNAL_SHORT_NAME',
  'ITEM_CATEGORY_NAME',
  'ITEM_PURPOSE_NAME',
  'VENDOR_ALPHABET',
  'MAKER_NAME',
  'ITEM_PROPERTY_COLOR_NAME',
  'ITEM_PROPERTY_COLOR_SHAPE',
  'USAGE_UNIT',
  'ITEM_EXTERNAL_CODE',
  'ITEM_EXTERNAL_FULL_NAME',
  'ITEM_EXTERNAL_SHORT_NAME',
  'UPDATE_DATE',
  'UPDATE_BY'
]

const SelectingItemModal = ({
  rowIdSelected,
  setRowIdSelected,
  isOpenSelectingItemModal,
  setIsOpenSelectingItemModal,
  setValue
}: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  // react-hook-form
  const reactHookFormMethods = useForm({
    defaultValues: {
      searchFilters: {
        itemCategory: null,
        itemPurpose: null,
        vendor: null,
        maker: null,
        itemInternalCode: '',
        itemInternalFullName: '',
        itemInternalShortName: '',
        itemExternalCode: '',
        itemExternalFullName: '',
        itemExternalShortName: '',
        itemCodeForSupportMes: '',
        status: null,
        color: null,
        shape: null
      },
      searchResults: {
        pageSize: 10,
        columnFilters: [],
        sorting: [],
        density: 'comfortable',
        columnVisibility: {
          inuseForSearch: true,
          IMAGE: true,
          ITEM_CODE_FOR_SUPPORT_MES: true,
          ITEM_INTERNAL_FULL_NAME: true,
          ITEM_INTERNAL_SHORT_NAME: true,
          ITEM_CATEGORY_NAME: true,
          ITEM_PURPOSE_NAME: true,
          VENDOR_ALPHABET: true,
          MAKER_NAME: true,
          ITEM_PROPERTY_COLOR_NAME: true,
          ITEM_PROPERTY_COLOR_SHAPE: true,
          USAGE_UNIT: true,
          ITEM_EXTERNAL_CODE: true,
          ITEM_EXTERNAL_FULL_NAME: true,
          ITEM_EXTERNAL_SHORT_NAME: true,
          UPDATE_DATE: true,
          UPDATE_BY: true
        },
        columnPinning: { left: [], right: [] },
        columnOrder: columns,
        columnFilterFns: {
          inuseForSearch: MRT_FilterFns.contains.name,
          IMAGE: MRT_FilterFns.contains.name,
          ITEM_CODE_FOR_SUPPORT_MES: MRT_FilterFns.contains.name,
          ITEM_INTERNAL_FULL_NAME: MRT_FilterFns.contains.name,
          ITEM_INTERNAL_SHORT_NAME: MRT_FilterFns.contains.name,
          ITEM_CATEGORY_NAME: MRT_FilterFns.contains.name,
          ITEM_PURPOSE_NAME: MRT_FilterFns.contains.name,
          VENDOR_ALPHABET: MRT_FilterFns.contains.name,
          MAKER_NAME: MRT_FilterFns.contains.name,
          ITEM_PROPERTY_COLOR_NAME: MRT_FilterFns.contains.name,
          ITEM_PROPERTY_COLOR_SHAPE: MRT_FilterFns.contains.name,
          USAGE_UNIT: MRT_FilterFns.contains.name,
          ITEM_EXTERNAL_CODE: MRT_FilterFns.contains.name,
          ITEM_EXTERNAL_FULL_NAME: MRT_FilterFns.contains.name,
          ITEM_EXTERNAL_SHORT_NAME: MRT_FilterFns.contains.name,
          UPDATE_DATE: MRT_FilterFns.equals.name,
          UPDATE_BY: MRT_FilterFns.contains.name
        }
      }
    }
  })

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography variant='h4'>Flow Type</Typography>
          <Divider orientation='vertical' className='mx-4' />
        </Grid>
        <Grid item xs={12}>
          <ItemSelectModalSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            'Loading'
          ) : (
            <ItemSelectModalTableData
              isEnableFetching={isEnableFetching}
              setIsEnableFetching={setIsEnableFetching}
              rowIdSelected={rowIdSelected}
              setFormValue={setValue}
              setIsOpenSelectingItemModal={setIsOpenSelectingItemModal}
            />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default SelectingItemModal

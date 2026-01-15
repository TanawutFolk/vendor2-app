import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import SctSellingSelectionSearch from './SctSellingSelectionSearch'
import SctSellingSelectionTableData from './SctSellingSelectionTableData'

import { useForm, useFormContext } from 'react-hook-form'

import { MRT_FilterFns } from 'material-react-table'

import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  any,
  array,
  boolean,
  nullable,
  number,
  object,
  optional,
  picklist,
  record,
  string,
  union,
  unknown
} from 'valibot'
//@ts-ignore
import type { Input } from 'valibot'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const schema = object({
  searchFilters: object({
    PRODUCT_TYPE: nullable(
      object({
        PRODUCT_TYPE_ID: number(),
        PRODUCT_TYPE_NAME: string(),
        PRODUCT_TYPE_CODE: string()
      })
    ),
    PRODUCT_CATEGORY: nullable(
      object({
        PRODUCT_CATEGORY_ID: number(),
        PRODUCT_CATEGORY_NAME: string()
      })
    ),
    PRODUCT_MAIN: nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string()
      })
    ),
    PRODUCT_SUB: nullable(
      object({
        PRODUCT_SUB_ID: number(),
        PRODUCT_SUB_NAME: string()
      })
    ),
    FISCAL_YEAR: nullable(
      object({
        value: number(),
        label: number()
      })
    ),
    SCT_PATTERN_NO: nullable(
      object({
        SCT_PATTERN_ID: number(),
        SCT_PATTERN_NAME: string()
      })
    ),
    BOM: nullable(
      object({
        BOM_ID: number(),
        BOM_CODE: string()
      })
    )
  }),

  searchResults: object({
    pageSize: number(),
    columnFilters: array(
      object({
        id: string(),
        value: union([string(), unknown()])
      })
    ),
    sorting: array(
      object({
        desc: boolean(),
        id: string()
      })
    ),
    density: picklist(['comfortable', 'compact', 'spacious']),
    columnVisibility: record(string(), boolean()),
    columnPinning: object({
      left: optional(array(string())),
      right: optional(array(string()))
    }),
    columnOrder: array(string()),
    columnFilterFns: record(string(), any())
  })
})

export type FormData = Input<typeof schema>

const columns = ['mrt-row-actions', 'SCT_CODE_FOR_SUPPORT_MES', 'SCT_REVISION_CODE']

interface Props {
  isOpenSctSellingSelectionModal: boolean
  setIsOpenSctSellingSelectionModal: Dispatch<SetStateAction<boolean>>
  materialData: any
}

const SctSellingSelectionModal = ({
  isOpenSctSellingSelectionModal,
  setIsOpenSctSellingSelectionModal,
  materialData,
  setValueMatPrice,
  getValuesMatPrice
}: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const handleClose = () => {
    setIsOpenSctSellingSelectionModal(false)
  }

  const { getValues } = useFormContext()

  // react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      searchFilters: {
        ITEM_ID: materialData.ITEM_ID,
        FISCAL_YEAR: getValuesMatPrice('FISCAL_YEAR.value'),
        SCT_PATTERN_ID: getValuesMatPrice('SCT_PATTERN_NO.value')
      },
      searchResults: {
        pageSize: 10,
        columnFilters: [],
        sorting: [],
        density: 'comfortable',
        columnVisibility: columns.reduce((acc: any, key: string) => {
          acc[key] = true
          return acc
        }, {}),
        columnPinning: { left: [], right: [] },
        columnOrder: columns,
        columnFilterFns: columns.reduce((acc: any, key: string) => {
          acc[key] = MRT_FilterFns.contains.name
          return acc
        }, {})
      }
    }
  })

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
        open={isOpenSctSellingSelectionModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Select a SCT
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            {/* <Grid item xs={12}>
              <SctSellingSelectionSearch setIsEnableFetching={setIsEnableFetching} {...reactHookFormMethods} />
            </Grid> */}
            <Grid item xs={12}>
              <SctSellingSelectionTableData
                isEnableFetching={isEnableFetching}
                setIsEnableFetching={setIsEnableFetching}
                setIsOpenSctSellingSelectionModal={setIsOpenSctSellingSelectionModal}
                setValueMatPrice={setValueMatPrice}
                materialData={materialData}
                // getValues={getValues}
                getValuesMatPrice={getValuesMatPrice}
                {...reactHookFormMethods}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SctSellingSelectionModal

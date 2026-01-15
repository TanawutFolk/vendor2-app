import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import SctDataModalSearch from './SctDataModalSearch'
import SctDataModalTableData from './SctDataModalTableData'

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
  originalName?:
    | 'MATERIAL_PRICE'
    | 'YR_GR_FROM_ENGINEER'
    | 'TIME_FROM_MFG'
    | 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
    | 'COST_CONDITION'
    | 'SCT_COMPARE_NO_1'
    | 'SCT_COMPARE_NO_2'
    | string
  isOpenSctModal: boolean
  setIsOpenSctDataModal: Dispatch<SetStateAction<boolean>>
  isCopyAndEdit?: boolean
}

const SctDataModal = ({ originalName, isOpenSctModal, setIsOpenSctDataModal, isCopyAndEdit }: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const handleClose = () => {
    setIsOpenSctDataModal(false)
  }

  const { getValues } = useFormContext()

  // react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      searchFilters: {
        PRODUCT_TYPE: getValues('PRODUCT_TYPE') ?? null,
        PRODUCT_CATEGORY: getValues('PRODUCT_CATEGORY') ?? null,
        PRODUCT_MAIN: getValues('PRODUCT_MAIN') ?? null,
        PRODUCT_SUB: getValues('PRODUCT_SUB') ?? null,
        FISCAL_YEAR: null,
        SCT_PATTERN_NO: null,
        BOM: null
      },
      searchResults: {
        pageSize: 10,
        columnFilters: [],
        sorting: [],
        density: 'compact',
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
        open={isOpenSctModal}
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
            <Grid item xs={12}>
              <SctDataModalSearch
                setIsEnableFetching={setIsEnableFetching}
                masterDataType={originalName ?? ''}
                {...reactHookFormMethods}
              />
            </Grid>
            <Grid item xs={12}>
              <SctDataModalTableData
                isEnableFetching={isEnableFetching}
                setIsEnableFetching={setIsEnableFetching}
                masterDataType={originalName ?? ''}
                setIsOpenSctDataModal={setIsOpenSctDataModal}
                isCopyAndEdit={isCopyAndEdit}
                {...reactHookFormMethods}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SctDataModal

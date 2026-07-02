import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import MasterDataOtherModalSearch from './OtherModalSearch'
import MasterDataOtherModalTableData from './OtherModalTableData'

import { useForm } from 'react-hook-form'

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
    FISCAL_YEAR: nullable(
      object({
        value: number(),
        label: number()
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

interface Props {
  originalName: 'MATERIAL_PRICE' | 'YR_GR_FROM_ENGINEER' | 'TIME_FROM_MFG' | 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
  isOpenMasterDataSelectionModal: boolean
  setIsOpenMasterDataSelectionModal: Dispatch<SetStateAction<boolean>>
}

const MasterDataOtherModal = ({
  originalName,
  isOpenMasterDataSelectionModal,
  setIsOpenMasterDataSelectionModal
}: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  const [columns, setColumns] = useState<string[]>([])

  const handleClose = () => {
    setIsOpenMasterDataSelectionModal(false)
  }

  // react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      searchFilters: {
        FISCAL_YEAR: null
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

  useEffect(() => {
    setColumns(
      originalName === 'MATERIAL_PRICE'
        ? ['FISCAL_YEAR']
        : originalName === 'TIME_FROM_MFG'
          ? ['FISCAL_YEAR']
          : originalName === 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
            ? ['FISCAL_YEAR']
            : ['FISCAL_YEAR']
    )
  }, [originalName])

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
        open={isOpenMasterDataSelectionModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Select{' '}
            {originalName === 'YR_GR_FROM_ENGINEER'
              ? 'Y/R, G/R from Engineer'
              : originalName === 'TIME_FROM_MFG'
                ? 'Clear Time'
                : originalName === 'YR_ACCUMULATION_MATERIAL_FROM_ENGINEER'
                  ? 'Yield Rate Material'
                  : 'Manufacturing Item Price'}
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid item xs={12}>
            <MasterDataOtherModalSearch
              setIsEnableFetching={setIsEnableFetching}
              masterDataType={originalName}
              {...reactHookFormMethods}
            />
          </Grid>
          <Grid item xs={12}>
            <MasterDataOtherModalTableData
              isEnableFetching={isEnableFetching}
              setIsEnableFetching={setIsEnableFetching}
              masterDataType={originalName}
              columns={columns}
              setIsOpenMasterDataSelectionModal={setIsOpenMasterDataSelectionModal}
              {...reactHookFormMethods}
            />
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MasterDataOtherModal

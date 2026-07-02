import React, { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// Third-party Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
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
import { MRT_FilterFns } from 'material-react-table'

import { useUpdateEffect } from 'react-use'

import MasterDataModalSearch from './ModalSearch'
import MasterDataModalTableData from './ModalTableData'

const schema = object({
  searchFilters: object({
    FISCAL_YEAR: nullable(
      object({
        value: number(),
        label: number()
      })
    ),
    PRODUCT_MAIN: nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string()
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

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  // originalName: string
  // name: string
  costConditionType: 'direct' | 'indirect' | 'special' | 'other'
  isOpenMasterDataModal: boolean
  setIsOpenMasterDataModal: Dispatch<SetStateAction<boolean>>
}

const MasterDataModal = ({ costConditionType, isOpenMasterDataModal, setIsOpenMasterDataModal }: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  const [columns, setColumns] = useState<string[]>([])

  useEffect(() => {
    setColumns(
      costConditionType === 'direct'
        ? [
            'FISCAL_YEAR',
            'VERSION',
            'PRODUCT_MAIN_NAME',
            'DIRECT_UNIT_PROCESS_COST',
            'INDIRECT_RATE_OF_DIRECT_PROCESS_COST'
          ]
        : costConditionType === 'indirect'
          ? ['FISCAL_YEAR', 'VERSION', 'PRODUCT_MAIN_NAME', 'LABOR', 'DEPRECIATION', 'OTHER_EXPENSE']
          : costConditionType === 'special'
            ? ['FISCAL_YEAR', 'VERSION', 'PRODUCT_MAIN_NAME', 'ADJUST_PRICE']
            : ['FISCAL_YEAR', 'VERSION', 'PRODUCT_MAIN_NAME', 'GA', 'MARGIN', 'SELLING_EXPENSE', 'VAT', 'CIT']
    )
  }, [costConditionType])

  // react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      searchFilters: {
        PRODUCT_MAIN: null,
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

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  const handleClose = () => {
    setIsOpenMasterDataModal(false)
  }

  return (
    <Dialog
      maxWidth='xl'
      fullWidth={true}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
      TransitionComponent={Transition}
      open={isOpenMasterDataModal}
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
          {costConditionType === 'direct'
            ? 'Direct'
            : costConditionType === 'indirect'
              ? 'Indirect'
              : costConditionType === 'special'
                ? 'Special'
                : 'Other'}{' '}
          Cost Condition
        </Typography>
        <DialogCloseButton onClick={handleClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent>
        <Grid item xs={12}>
          <MasterDataModalSearch
            setIsEnableFetching={setIsEnableFetching}
            {...reactHookFormMethods}
            costConditionType={costConditionType}
          />
        </Grid>
        <Grid item xs={12}>
          <MasterDataModalTableData
            isEnableFetching={isEnableFetching}
            setIsEnableFetching={setIsEnableFetching}
            {...reactHookFormMethods}
            costConditionType={costConditionType}
            columns={columns}
            setIsOpenMasterDataModal={setIsOpenMasterDataModal}
          />
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default MasterDataModal

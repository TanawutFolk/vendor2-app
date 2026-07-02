// React Imports
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

// MUI Imports
import {
  Breadcrumbs,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'

// Components Imports
import StandardCostFormModalSearch from './SctFormModalSearch'
import StandardCostFormModalTableData from './SctFormModalTableData'

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

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useUpdateEffect } from 'react-use'

import dayjs from 'dayjs'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const schema = object({
  // searchFilters: object({
  //   PRODUCT_TYPE: nullable(
  //     object({
  //       PRODUCT_TYPE_ID: number(),
  //       PRODUCT_TYPE_NAME: string(),
  //       PRODUCT_TYPE_CODE: string()
  //     })
  //   ),
  //   PRODUCT_CATEGORY: nullable(
  //     object({
  //       PRODUCT_CATEGORY_ID: number(),
  //       PRODUCT_CATEGORY_NAME: string()
  //     })
  //   ),
  //   PRODUCT_MAIN: nullable(
  //     object({
  //       PRODUCT_MAIN_ID: number(),
  //       PRODUCT_MAIN_NAME: string()
  //     })
  //   ),
  //   PRODUCT_SUB: nullable(
  //     object({
  //       PRODUCT_SUB_ID: number(),
  //       PRODUCT_SUB_NAME: string()
  //     })
  //   ),
  //   FLOW_NAME: nullable(string()),
  //   FISCAL_YEAR: nullable(string()),
  //   SCT_PATTERN: nullable(object({ SCT_PATTERN_ID: number(), SCT_PATTERN_NAME: string() })),
  //   SCT_REASON_SETTING: nullable(object({ SCT_REASON_SETTING_ID: number(), SCT_REASON_SETTING_NAME: string() })),
  //   SCT_TAG_SETTING: nullable(object({ SCT_TAG_SETTING_ID: number(), SCT_TAG_SETTING_NAME: string() }))
  // }),

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

const columns = [
  'mrt-row-actions',
  'SCT_F_CREATE_TYPE_NAME',
  'SCT_F_CODE',
  'PRODUCT_TYPE_CODE',
  'PRODUCT_TYPE_NAME',
  'BOM_CODE',
  'BOM_NAME',
  'PRODUCT_CATEGORY_NAME',
  'PRODUCT_MAIN_NAME',
  'PRODUCT_SUB_NAME',
  'FLOW_NO',
  'FLOW_NAME',
  'FISCAL_YEAR',
  'SCT_PATTERN_NAME',
  'SCT_REASON_SETTING_NAME',
  'SCT_TAG_SETTING_NAME',
  'UPDATE_BY',
  'UPDATE_DATE'
]

interface StandardCostFormModalProps {
  openModalAdd: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetchingMainTable: Dispatch<SetStateAction<boolean>>
}

const StandardCostFormModal = ({
  openModalAdd,
  setOpenModalAdd,
  setIsEnableFetchingMainTable
}: StandardCostFormModalProps) => {
  // State
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  // react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      searchFilters: {
        sctFormCode: '',
        fiscalYear: '',
        sctPattern: null,
        itemCategory: null,
        productCategory: null,
        productMain: null,
        productSub: null,
        productType: null,
        sctReasonSetting: null,
        sctTagSetting: null,
        sctStatusProgress: null,
        productionSpecificationType: null,
        customerInvoice: null
      },
      searchResults: {
        pageSize: 10,
        columnFilters: [],
        sorting: [],
        density: 'comfortable',
        columnVisibility: {
          inuseForSearch: true,
          SCT_F_CREATE_TYPE_NAME: true,
          SCT_F_CODE: true,
          PRODUCT_TYPE_CODE: true,
          PRODUCT_TYPE_NAME: true,
          BOM_CODE: true,
          BOM_NAME: true
        },
        columnPinning: { left: [], right: [] },
        columnOrder: columns,
        columnFilterFns: {
          inuseForSearch: MRT_FilterFns.contains.name,
          SCT_F_CREATE_TYPE_NAME: MRT_FilterFns.contains.name,
          SCT_F_CODE: MRT_FilterFns.contains.name,
          PRODUCT_TYPE_CODE: MRT_FilterFns.contains.name,
          PRODUCT_TYPE_NAME: MRT_FilterFns.contains.name,
          BOM_CODE: MRT_FilterFns.contains.name,
          BOM_NAME: MRT_FilterFns.contains.name,
          PRODUCT_CATEGORY_NAME: MRT_FilterFns.contains.name,
          PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
          PRODUCT_SUB_NAME: MRT_FilterFns.contains.name,
          FLOW_NO: MRT_FilterFns.contains.name,
          FLOW_NAME: MRT_FilterFns.contains.name,
          FISCAL_YEAR: MRT_FilterFns.contains.name,
          SCT_PATTERN_NAME: MRT_FilterFns.contains.name,
          SCT_REASON_SETTING_NAME: MRT_FilterFns.contains.name,
          SCT_TAG_SETTING_NAME: MRT_FilterFns.contains.name,
          UPDATE_BY: MRT_FilterFns.contains.name,
          UPDATE_DATE: MRT_FilterFns.equals.name
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

  // Functions
  const handleClose = () => {
    setOpenModalAdd(false)
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
      open={openModalAdd}
      keepMounted
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
      PaperProps={{ sx: { top: 30, m: 0 } }}
    >
      <DialogTitle id='max-width-dialog-title'>
        <Typography variant='h5' component='span'>
          Standard Cost
        </Typography>
        <Typography variant='h5' component='span' color='primary'>
          {' '}
          Form
        </Typography>
        <DialogCloseButton onClick={handleClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent>
        <FormProvider {...reactHookFormMethods}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <StandardCostFormModalSearch setIsEnableFetching={setIsEnableFetching} />
            </Grid>
            <Grid item xs={12}>
              <StandardCostFormModalTableData
                isEnableFetching={isEnableFetching}
                setIsEnableFetching={setIsEnableFetching}
                setOpenModalAdd={setOpenModalAdd}
                setIsEnableFetchingMainTable={setIsEnableFetchingMainTable}
              />
            </Grid>
          </Grid>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

export default StandardCostFormModal

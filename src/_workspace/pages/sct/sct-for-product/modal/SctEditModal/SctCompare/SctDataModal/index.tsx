import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'

import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import SctDataModalSearch from './SctDataModalSearch'
import SctDataModalTableData from './SctDataModalTableData'

import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { MRT_FilterFns } from 'material-react-table'

import { FormDataPage, validationSchemaPage } from './validationSchema'
import { FormDataPage as FormDataPageParent } from '../../validationSchema'
import { zodResolver } from '@hookform/resolvers/zod'

// Dialog
const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

const columns = ['mrt-row-actions', 'SCT_CODE_FOR_SUPPORT_MES', 'SCT_REVISION_CODE']

interface Props {
  originalName: string
  isOpenSctModal: boolean
  setIsOpenSctDataModal: Dispatch<SetStateAction<boolean>>
  sctCompareNo: number
}

const SctDataModal = ({ originalName, isOpenSctModal, setIsOpenSctDataModal, sctCompareNo }: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const handleClose = () => {
    setIsOpenSctDataModal(false)
  }

  const { getValues: getValuesFormParent, setValue: setValueFormParent } = useFormContext<FormDataPageParent>()

  // react-hook-form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: {
      searchFilters: {
        PRODUCT_TYPE: getValuesFormParent('product.productType') ?? null,
        PRODUCT_CATEGORY: getValuesFormParent('product.productCategory') ?? null,
        PRODUCT_MAIN: getValuesFormParent('product.productMain') ?? null,
        PRODUCT_SUB: getValuesFormParent('product.productSub') ?? null,
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
              <FormProvider {...reactHookFormMethods}>
                <SctDataModalSearch setIsEnableFetching={setIsEnableFetching} />
              </FormProvider>
            </Grid>
            <Grid item xs={12}>
              <FormProvider {...reactHookFormMethods}>
                <SctDataModalTableData
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                  originalName={originalName}
                  setIsOpenSctDataModal={setIsOpenSctDataModal}
                  setValueFormParent={setValueFormParent}
                  getValueFormParent={getValuesFormParent}
                  sctCompareNo={sctCompareNo}
                />
              </FormProvider>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SctDataModal

import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import SctDataModalSearch from './SctDataModalSearch'
import SctDataModalTableData from './SctDataModalTableData'
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import { FormDataPage, validationSchemaPage } from './dataValidation'
import { zodResolver } from '@hookform/resolvers/zod'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import { FormDataPage as FormDataPageParent } from '../../dataValidation'
import { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'

// Dialog
const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

// const columns = ['mrt-row-actions', 'SCT_CODE_FOR_SUPPORT_MES', 'SCT_CODE']

interface Props {
  isOpenSctModal: boolean
  setIsOpenSctDataModal: Dispatch<SetStateAction<boolean>>
  rowData: ProductTypeI
  inputName: string
  RHF_parent: UseFormReturn<FormDataPageParent>
}

const SctSelectionModal = ({ isOpenSctModal, setIsOpenSctDataModal, rowData, RHF_parent }: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const handleClose = () => {
    setIsOpenSctDataModal(false)
  }

  // react-hook-form
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: {
      searchFilters: {
        PRODUCT_TYPE: {
          PRODUCT_TYPE_ID: rowData?.PRODUCT_TYPE_ID ?? null,
          PRODUCT_TYPE_NAME: rowData?.PRODUCT_TYPE_NAME ?? null,
          PRODUCT_TYPE_CODE: rowData?.PRODUCT_TYPE_CODE ?? null
        },
        PRODUCT_CATEGORY: {
          PRODUCT_CATEGORY_ID: rowData?.PRODUCT_CATEGORY_ID ?? null,
          PRODUCT_CATEGORY_NAME: rowData?.PRODUCT_CATEGORY_NAME ?? null
        },
        PRODUCT_MAIN: {
          PRODUCT_MAIN_ID: rowData?.PRODUCT_MAIN_ID ?? null,
          PRODUCT_MAIN_NAME: rowData?.PRODUCT_MAIN_NAME ?? null
        },
        PRODUCT_SUB: {
          PRODUCT_SUB_ID: rowData?.PRODUCT_SUB_ID ?? null,
          PRODUCT_SUB_NAME: rowData?.PRODUCT_SUB_NAME ?? null
        },
        FISCAL_YEAR: null,
        SCT_PATTERN_NO: null,
        BOM: null
      },
      searchResults: {
        pageSize: 10,
        columnFilters: [],
        sorting: [],
        density: 'compact',
        // columnVisibility: columns.reduce((acc: any, key: string) => {
        //   acc[key] = true
        //   return acc
        // }, {}),
        columnPinning: { left: [], right: [] }
        // columnOrder: columns,
        // columnFilterFns: columns.reduce((acc: any, key: string) => {
        //   acc[key] = MRT_FilterFns.contains.name
        //   return acc
        // }, {})
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
          <FormProvider {...reactHookFormMethods}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SctDataModalSearch setIsEnableFetching={setIsEnableFetching} />
              </Grid>
              <Grid item xs={12}>
                <SctDataModalTableData
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                  setIsOpenSctDataModal={setIsOpenSctDataModal}
                  RHF_parent={RHF_parent}
                  rowData={rowData}
                />
              </Grid>
            </Grid>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SctSelectionModal

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'
import { FormProvider, useForm, useFormContext, UseFormSetValue, useFormState } from 'react-hook-form'
import DataMasterSelectionModalSearch from './DataMasterSelectionModalSearch'
import DataMasterSelectionModalTableData from './DataMasterSelectionModalTableData'
import { MRT_FilterFns } from 'material-react-table'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  originalName: 'YR_GR_FROM_ENGINEER' | 'TIME_FROM_MFG'
  setOpenModal: Dispatch<SetStateAction<boolean>>
  openModal: boolean
  setValueMain: UseFormSetValue<any>
}

const columns = [
  'mrt-row-actions',
  'inuseForSearch',
  'PRODUCT_CATEGORY_NAME',
  'PRODUCT_MAIN_NAME',
  'PRODUCT_SUB_NAME',
  'PRODUCT_TYPE_NAME',
  'PRODUCT_CODE_NAME',
  'FISCAL_YEAR',
  'FLOW_CODE',
  'FLOW_NAME',
  'FLOW_PROCESS_NO',
  'REVISION_NO',
  'COLLECTION_POINT_FOR_SCT',
  'MODIFIED_DATE',
  'UPDATE_BY'
]

const DataMasterSelectionModal = ({ originalName, setOpenModal, openModal, setValueMain }: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const form = useFormContext()

  const reactHookFormMethods = useForm({
    defaultValues: {
      searchFilters: {
        PRODUCT_CATEGORY: form.getValues('PRODUCT_CATEGORY'),
        PRODUCT_MAIN: form.getValues('PRODUCT_MAIN'),
        PRODUCT_SUB: form.getValues('PRODUCT_SUB'),
        PRODUCT_TYPE: form.getValues('PRODUCT_TYPE')
      },
      searchResults: {
        pageSize: 10,
        columnFilters: [],
        sorting: [],
        density: 'comfortable',
        columnVisibility: {
          inuseForSearch: true,
          PRODUCT_MAIN_NAME: true,
          PROCESS_ID: false,
          PROCESS_CODE: true,
          PROCESS_NAME: true,
          MODIFIED_DATE: true,
          UPDATE_BY: true
        },
        columnPinning: { left: [], right: [] },
        columnOrder: columns,
        columnFilterFns: {
          inuseForSearch: MRT_FilterFns.contains.name,
          PRODUCT_CATEGORY_NAME: MRT_FilterFns.contains.name,
          PRODUCT_MAIN_NAME: MRT_FilterFns.contains.name,
          PRODUCT_TYPE_NAME: MRT_FilterFns.contains.name,
          PRODUCT_TYPE_CODE: MRT_FilterFns.contains.name,
          PRODUCT_TYPE_CODE_FOR_SCT: MRT_FilterFns.contains.name,
          FLOW_CODE: MRT_FilterFns.contains.name,
          FLOW_NAME: MRT_FilterFns.contains.name,
          FLOW_PROCESS_NO: MRT_FilterFns.contains.name,
          COLLECTION_POINT_FOR_SCT: MRT_FilterFns.contains.name,
          REVISION_NO: MRT_FilterFns.contains.name,
          PROCESS_CODE: MRT_FilterFns.contains.name,
          PROCESS_NAME: MRT_FilterFns.contains.name,
          MODIFIED_DATE: MRT_FilterFns.equals.name,
          UPDATE_BY: MRT_FilterFns.contains.name
        }
      }
    }
  })

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  return (
    <>
      <Dialog
        maxWidth='xl'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            setOpenModal(false)
          }
        }}
        TransitionComponent={Transition}
        open={openModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            {originalName === 'YR_GR_FROM_ENGINEER' ? 'YR & GR Selection' : 'Clear Time Selection'}
          </Typography>

          <DialogCloseButton
            onClick={() => {
              setOpenModal(false)
            }}
            disableRipple
          >
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={6}>
            <FormProvider {...reactHookFormMethods}>
              <Grid item xs={12}>
                <DataMasterSelectionModalSearch setIsEnableFetching={setIsEnableFetching} />
              </Grid>
              <Grid item xs={12}>
                {isLoading ? (
                  'Loading'
                ) : (
                  <DataMasterSelectionModalTableData
                    originalName={originalName}
                    isEnableFetching={isEnableFetching}
                    setIsEnableFetching={setIsEnableFetching}
                    setValueMain={setValueMain}
                    setOpenModal={setOpenModal}
                  />
                )}
              </Grid>
            </FormProvider>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DataMasterSelectionModal

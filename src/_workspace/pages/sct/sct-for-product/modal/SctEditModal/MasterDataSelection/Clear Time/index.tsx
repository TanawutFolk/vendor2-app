import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useState } from 'react'
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import ClearTimeSearch from './ClearTimeSearch'
import ClearTimeTableData from './ClearTimeTableData'
import { FormDataPage, validationSchemaPage } from './validationSchema'
import { FormDataPage as FormDataPageParent } from '../../validationSchema'
import { zodResolver } from '@hookform/resolvers/zod'

const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  isOpenModal: boolean
  setIsOpenModal: Dispatch<SetStateAction<boolean>>
  FISCAL_YEAR: {
    label: string
    value: number
  }
  PRODUCT_TYPE: {
    PRODUCT_TYPE_ID: number
    PRODUCT_TYPE_CODE: string
    PRODUCT_TYPE_NAME: string
  }
  RHF_parent: UseFormReturn<FormDataPageParent>
  onChange: () => void
}
function ClearTime({ isOpenModal, setIsOpenModal, FISCAL_YEAR, PRODUCT_TYPE, RHF_parent, onChange }: Props) {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const handleClose = () => {
    setIsOpenModal(false)
  }

  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: {
      searchFilters: {
        FISCAL_YEAR,
        PRODUCT_TYPE
      },
      searchResults: {
        pageSize: 10,
        density: 'compact'
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
        open={isOpenModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Select a Clear Time
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <FormProvider {...reactHookFormMethods}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ClearTimeSearch setIsEnableFetching={setIsEnableFetching} />
              </Grid>
              <Grid item xs={12}>
                <ClearTimeTableData
                  isEnableFetching={isEnableFetching}
                  setIsEnableFetching={setIsEnableFetching}
                  RHF_parent={RHF_parent}
                  setIsOpenModal={setIsOpenModal}
                  onChange={onChange}
                />
              </Grid>
            </Grid>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  )
}
export default ClearTime

import { fetchMaterialListExcelFile } from '@/_workspace/react-select/async-promise-load-options/fetchMaterialList'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import CustomTextField from '@/components/mui/TextField'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'
import { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'
import { ReturnApiSearchMaterialListI } from '../MaterialListTableData'
import { saveAs } from 'file-saver'
import { MagnifyingGlass } from 'react-loader-spinner'
import progress from '../../../../../../@core/theme/overrides/progress'
import { set } from 'react-hook-form'
import { clear } from 'console'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface ExportModalProps {
  isExportModalOpen: boolean
  setIsExportModalOpen: Dispatch<SetStateAction<boolean>>
  getUrlParamSearch: ReturnApiSearchMaterialListI
}

const MaterialListExportModal = ({ isExportModalOpen, setIsExportModalOpen, getUrlParamSearch }: ExportModalProps) => {
  const [fileName, setFileName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleClose = () => {
    setIsExportModalOpen(false)
  }

  const handleDownload = async () => {
    setIsLoading(true)
    getUrlParamSearch.FILE_NAME = fileName

    const file = await fetchMaterialListExcelFile(getUrlParamSearch, setIsLoading).then(res => {
      return res
    })

    if (file) {
      const message = {
        message: 'Downloaded Successfully',
        title: 'Export file'
      }
      ToastMessageSuccess(message)

      saveAs(file, `${fileName ? fileName : 'Mat_List'}.xlsx`)
      setIsExportModalOpen(false)
    } else {
      const message = {
        message: 'Download Failed',
        title: 'Export file'
      }
      ToastMessageError(message)
    }
  }

  return (
    <>
      <Dialog
        maxWidth='sm'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={isExportModalOpen}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Export Material List
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-5'>
            <CustomTextField
              fullWidth
              label='File Name (optional)'
              placeholder='Mat_List'
              autoComplete='off'
              value={fileName}
              onChange={e => setFileName(e.target.value)}
            />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownload} variant='contained' disabled={isLoading}>
            {isLoading ? (
              <>
                <MagnifyingGlass
                  visible={true}
                  height='22'
                  width='22'
                  ariaLabel='magnifying-glass-loading'
                  wrapperStyle={{}}
                  wrapperClass='magnifying-glass-wrapper'
                  glassColor='#c0efff'
                  color='#e15b64'
                />
                <span className='ms-2'>Downloading...</span>
              </>
            ) : (
              'Download'
            )}
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MaterialListExportModal

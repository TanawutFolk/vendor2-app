// React Imports
import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import type { BoxProps, SlideProps } from '@mui/material'
import {
  Backdrop,
  Box,
  CircularProgress,
  Fade,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  Slide
} from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'
import type { SubmitErrorHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports
import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import SelectCustom from '@/components/react-select/SelectCustom'

import ConfirmModal from '@/components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { z } from 'zod'

import type { AxiosProgressEvent } from 'axios'
import { useDropzone } from 'react-dropzone'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'

import { useUploadBlacklist } from '@/_workspace/react-query/hooks/useBlacklist'
import { zodResolver } from '@hookform/resolvers/zod'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type FormData = z.infer<typeof schema>

const schema = z.object({
  format: z.enum(['US', 'CN'], {
    required_error: 'Please select format'
  }),
  file: z
    .custom<File>(value => value instanceof File, {
      message: 'Please select an Excel file'
    })
    .refine(file => {
      const lowerName = String(file?.name || '').toLowerCase()

      return lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx')
    }, 'Only .xls or .xlsx files are allowed')
})

const FormatOption = [
  { value: 'US', label: 'US' },
  { value: 'CN', label: 'CN' }
]

const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(4),
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'border 0.3s ease-in-out',
    '&:hover': {
      borderColor: theme.palette.primary.main
    },
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(4)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

const shimmerAnimation = keyframes`
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
`

interface UploadBlacklistModalProps {
  openModalUpload: boolean
  setOpenModalUpload: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}
const UploadBlacklistModal = ({
  openModalUpload,
  setOpenModalUpload,
  setIsEnableFetching
}: UploadBlacklistModalProps) => {
  // useState

  // States : Modal

  const [confirmModal, setConfirmModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleClose = () => {
    setOpenModalUpload(false)
    reset()
  }

  // Hooks : react-hook-form
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    // defaultValues
    defaultValues: {
      format: 'US'
    }
  })

  const { errors } = useFormState({
    control
  })

  const selectedFile = watch('file')

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    onDrop: acceptedFiles => {
      const file = acceptedFiles[0]

      if (!file) return

      setValue('file', file, { shouldValidate: true, shouldDirty: true })
    }
  })

  const handleRemoveFile = () => {
    setValue('file', undefined as never, { shouldValidate: true, shouldDirty: true })
  }

  const renderFilePreview = (file: File) => {
    const name = file.name.toLowerCase()
    const isExcelFile = name.endsWith('.xls') || name.endsWith('.xlsx')

    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: isExcelFile ? 'success.lighter' : 'primary.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <i
          className={isExcelFile ? 'tabler-file-spreadsheet' : 'tabler-file'}
          style={{
            color: isExcelFile ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-primary-main)',
            fontSize: '1.5rem'
          }}
        />
      </Box>
    )
  }

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log('ERROR', data)
  }

  const handleUpload = () => {
    setConfirmModal(false)

    const formData = new FormData()

    const dataItem = {
      CREATE_BY: getUserData()?.EMPLOYEE_CODE || 'SYSTEM',
      UPDATE_BY: getUserData()?.EMPLOYEE_CODE || 'SYSTEM'
    }

    formData.append('file', getValues('file'))
    formData.append('DATAITEM', JSON.stringify(dataItem))

    setUploadProgress(0)
    mutation.mutate({
      FORMAT: getValues('format'),
      formData,
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        const total = Number(progressEvent.total || 0)

        if (!total) return

        setUploadProgress(Math.min(100, Math.round((progressEvent.loaded * 100) / total)))
      }
    })
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Update Blacklist'
      }

      ToastMessageSuccess(message)
      setUploadProgress(100)
      setIsEnableFetching(true)
      setTimeout(() => setUploadProgress(0), 200)
      handleClose()
    } else {
      const message = {
        title: 'Update Blacklist',
        message: data.data.Message
      }

      ToastMessageError(message)
      setTimeout(() => setUploadProgress(0), 200)
    }

    console.log('onMutateSuccess')
  }

  const onMutateError = (e: any) => {
    const message = {
      title: 'Update Blacklist',
      message: e?.message || 'Blacklist update failed'
    }

    ToastMessageError(message)
    setTimeout(() => setUploadProgress(0), 200)
    console.log('onMutateError', e)
  }

  const mutation = useUploadBlacklist(onMutateSuccess, onMutateError)

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
        keepMounted
        open={openModalUpload}
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Update Blacklist Excel
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid className='mb-3'>
            <Controller
              name='format'
              control={control}
              render={({ field }) => (
                <SelectCustom
                  label='Format'
                  placeholder='Select ...'
                  isClearable={false}
                  options={FormatOption}
                  value={FormatOption.find(option => option.value === field.value) || FormatOption[0]}
                  onChange={value => field.onChange((value as { value: 'US' | 'CN' } | null)?.value || 'US')}
                  classNamePrefix='select'
                />
              )}
            />
          </Grid>
          <Grid>
            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
              Excel File{' '}
              <Typography component='span' color='error'>
                *
              </Typography>
            </Typography>
            <Dropzone>
              <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <Box
                  sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1.5, textAlign: 'center' }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      bgcolor: 'secondary.lightOpacity',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <i className='tabler-upload' style={{ fontSize: 24, color: 'var(--mui-palette-secondary-main)' }} />
                  </Box>
                  <Typography variant='h6' sx={{ mb: 0.5 }}>
                    Drop files here or click to upload
                  </Typography>
                  <Typography variant='body2' fontWeight={600} color='primary.main'>
                    Allowed: Excel .xls, .xlsx
                  </Typography>
                  {errors.file ? (
                    <Typography variant='caption' color='error' sx={{ mt: 1, fontWeight: 700 }}>
                      {errors.file.message}
                    </Typography>
                  ) : null}
                </Box>
              </div>
              {selectedFile ? (
                <List sx={{ mt: 2, p: 0 }}>
                  <ListItem sx={{ px: 0, py: 0.75 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        transition: 'border 0.2s',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                    >
                      <Box sx={{ flexShrink: 0, display: 'flex' }}>{renderFilePreview(selectedFile)}</Box>
                      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                        <Typography variant='body2' className='file-name' noWrap fontWeight={600} color='text.primary'>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {Math.round(selectedFile.size / 100) / 10 > 1000
                            ? `${(Math.round(selectedFile.size / 100) / 10000).toFixed(1)} MB`
                            : `${(Math.round(selectedFile.size / 100) / 10).toFixed(1)} KB`}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={event => {
                          event.stopPropagation()
                          handleRemoveFile()
                        }}
                        size='small'
                        sx={{
                          color: 'error.main',
                          bgcolor: 'error.lighter',
                          opacity: 0.8,
                          '&:hover': { opacity: 1, bgcolor: 'error.light' }
                        }}
                      >
                        <i className='tabler-trash' style={{ fontSize: '1.25rem' }} />
                      </IconButton>
                    </Box>
                  </ListItem>
                </List>
              ) : null}
            </Dropzone>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' color='success'>
            Save & Complete
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleUpload}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>

      <Backdrop
        open={mutation.isPending}
        sx={{
          zIndex: theme => theme.zIndex.modal + 1,
          backgroundColor: 'rgba(15, 23, 42, 0.28)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Fade in={mutation.isPending}>
          <Box
            sx={{
              minWidth: 320,
              maxWidth: 380,
              px: 5,
              py: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lightOpacity'
              }}
            >
              <CircularProgress
                size={30}
                thickness={4.5}
                sx={{
                  color: 'primary.main'
                }}
              />
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='h6' sx={{ mb: 0.5 }}>
                Updating Blacklist
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                The existing blacklist for this format is being replaced with the latest file.
              </Typography>
            </Box>

            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant='caption' color='text.secondary'>
                  Upload progress
                </Typography>
                <Typography variant='caption' fontWeight={700} color='primary.main'>
                  {uploadProgress}%
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={uploadProgress}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: 'action.hover',
                  overflow: 'hidden',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 999,
                    background: `
                      linear-gradient(
                        90deg,
                        var(--mui-palette-primary-main) 0%,
                        var(--mui-palette-info-main) 35%,
                        rgba(255, 255, 255, 0.92) 50%,
                        var(--mui-palette-info-main) 65%,
                        var(--mui-palette-primary-main) 100%
                      )
                    `,
                    backgroundSize: '200% 100%',
                    animation: `${shimmerAnimation} 2s linear infinite`
                  }
                }}
              />
            </Box>
          </Box>
        </Fade>
      </Backdrop>
    </>
  )
}

export default UploadBlacklistModal

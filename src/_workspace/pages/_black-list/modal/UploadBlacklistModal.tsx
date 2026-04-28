import { useEffect } from 'react'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import SelectCustom from '@components/react-select/SelectCustom'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import type { UploadBlacklistPayload } from '../types'
import { UploadBlacklistSchema } from '../validateSchema'
import type { UploadBlacklistFormData } from '../validateSchema'

interface UploadBlacklistModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (payload: UploadBlacklistPayload) => void | Promise<void>
}

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

const UploadBlacklistModal = ({ open, onClose, onSubmit }: UploadBlacklistModalProps) => {
    const formatOptions = [
        { value: 'US', label: 'US' },
        { value: 'CN', label: 'CN' },
    ]

    const {
        control,
        setValue,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<UploadBlacklistFormData>({
        resolver: zodResolver(UploadBlacklistSchema),
        defaultValues: {
            format: 'US',
        },
    })

    useEffect(() => {
        if (!open) {
            reset({ format: 'US' })
        }
    }, [open, reset])

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

    const submit = async (formData: UploadBlacklistFormData) => {
        await onSubmit({
            format: formData.format,
            file: formData.file,
        })
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth='sm'
            PaperProps={{
                sx: {
                    overflow: 'visible'
                }
            }}
        >
            <DialogTitle>
                Update Blacklist Excel
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Controller
                        name='format'
                        control={control}
                        render={({ field }) => (
                            <SelectCustom
                                label='Format'
                                placeholder='Select ...'
                                isClearable={false}
                                options={formatOptions}
                                value={formatOptions.find(option => option.value === field.value) || formatOptions[0]}
                                onChange={(value) => field.onChange((value as { value: 'US' | 'CN' } | null)?.value || 'US')}
                                classNamePrefix='select'
                            />
                        )}
                    />

                    <Box>
                        <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                            Excel File <Typography component='span' color='error'>*</Typography>
                        </Typography>
                        <Dropzone>
                            <div {...getRootProps({ className: 'dropzone' })}>
                                <input {...getInputProps()} />
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 1.5, textAlign: 'center' }}>
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
                                                onClick={(event) => {
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
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant='tonal' color='secondary' onClick={onClose}>Cancel</Button>
                <Button variant='contained' onClick={handleSubmit(submit)} disabled={isSubmitting}>
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default UploadBlacklistModal

import { forwardRef, useEffect, useState } from 'react'
import type { ReactNode, Ref } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Tooltip, Button, Box, Slide
} from '@mui/material'
import type { SlideProps } from '@mui/material'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactNode },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const getExt = (name: string) => (name.split('.').pop() || '').toLowerCase()
const isImage = (name: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(getExt(name))
const isPdf = (name: string) => getExt(name) === 'pdf'
const canPreview = (name: string) => isImage(name) || isPdf(name)

const getFileIcon = (name: string) => {
    const ext = getExt(name)
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'tabler-photo'
    if (ext === 'pdf') return 'tabler-file-type-pdf'
    if (['xls', 'xlsx'].includes(ext)) return 'tabler-file-type-xls'
    if (['doc', 'docx'].includes(ext)) return 'tabler-file-type-doc'
    return 'tabler-file'
}

const FileViewerDialog = ({ open, files, initialIndex = 0, onClose }: {
    open: boolean; files: { name: string; url: string }[]; initialIndex?: number; onClose: () => void
}) => {
    const [selectedIdx, setSelectedIdx] = useState(initialIndex)

    useEffect(() => {
        if (open) setSelectedIdx(initialIndex)
    }, [open, initialIndex, files])

    const selected = files[selectedIdx]

    const renderPreview = () => {
        if (!selected) {
            return <Typography color='text.secondary'>Select a file to preview</Typography>
        }
        if (isImage(selected.name)) {
            return (
                <Box
                    component='img'
                    src={selected.url}
                    alt={selected.name}
                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', mx: 'auto' }}
                />
            )
        }
        if (isPdf(selected.name)) {
            return (
                <Box
                    component='iframe'
                    src={selected.url}
                    title={selected.name}
                    sx={{ width: '100%', height: '100%', border: 0 }}
                />
            )
        }
        return (
            <Box sx={{ textAlign: 'center' }}>
                <i className={getFileIcon(selected.name)} style={{ fontSize: 56, color: 'var(--mui-palette-text-disabled)' }} />
                <Typography color='text.secondary' sx={{ mt: 1 }}>
                    This file type cannot be previewed.
                </Typography>
                <Button
                    variant='tonal'
                    size='small'
                    sx={{ mt: 1.5 }}
                    startIcon={<i className='tabler-external-link' style={{ fontSize: 16 }} />}
                    onClick={() => window.open(selected.url, '_blank')}
                >
                    Open in new tab
                </Button>
            </Box>
        )
    }

    return (
        <Dialog
            maxWidth='xl'
            fullWidth
            onClose={(_event, reason) => {
                if (reason !== 'backdropClick') onClose()
            }}
            TransitionComponent={Transition}
            open={open}
            sx={{ '& .MuiDialog-paper': { height: '90vh', overflow: 'visible' } }}
        >
            <DialogTitle sx={{ position: 'relative' }}>
                <Typography variant='h5' component='span'>Attached Files ({files.length})</Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, display: 'flex', minHeight: 0 }}>
                {files.length === 0 ? (
                    <Typography color='text.secondary' sx={{ p: 3, m: 'auto' }}>No files attached</Typography>
                ) : (
                    <>
                        {/* File list */}
                        <Box sx={{ width: 280, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider', overflowY: 'auto' }}>
                            <List disablePadding>
                                {files.map((file, idx) => (
                                    <ListItemButton
                                        key={idx}
                                        selected={idx === selectedIdx}
                                        onClick={() => setSelectedIdx(idx)}
                                        sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 38 }}>
                                            <i className={getFileIcon(file.name)} style={{ fontSize: 22, color: 'var(--mui-palette-primary-main)' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography variant='body2' fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                                                    {file.name}
                                                </Typography>
                                            }
                                            secondary={canPreview(file.name) ? 'Preview' : 'Open in new tab'}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>

                        {/* Preview pane */}
                        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', bgcolor: 'action.hover' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                <Typography variant='body2' fontWeight={700} noWrap sx={{ mr: 1 }}>
                                    {selected?.name || '-'}
                                </Typography>
                                {selected && (
                                    <Tooltip title='Open in new tab'>
                                        <IconButton size='small' onClick={() => window.open(selected.url, '_blank')} sx={{ color: 'primary.main' }}>
                                            <i className='tabler-external-link' style={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                            <Box sx={{ flex: 1, minHeight: 0, p: isPdf(selected?.name || '') ? 0 : 2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
                                {renderPreview()}
                            </Box>
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button onClick={onClose} variant='tonal' color='secondary'>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default FileViewerDialog

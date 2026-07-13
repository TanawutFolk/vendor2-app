import { useEffect, useState } from 'react'
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Tooltip, Button, Box
} from '@mui/material'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { Transition } from './shared'

const getExt = (name: string) => (name.split('.').pop() || '').toLowerCase()
const isImage = (name: string) => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(getExt(name))
const isPdf = (name: string) => getExt(name) === 'pdf'
const canPreview = (name: string) => isImage(name) || isPdf(name)

// Force a save-as instead of letting the browser render the file in a tab.
const downloadFile = (file: { name: string; url: string }) => {
    const anchor = document.createElement('a')

    anchor.href = file.url
    anchor.download = file.name
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
}

const getFileIcon = (name: string) => {
    const ext = getExt(name)
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'tabler-photo'
    if (ext === 'pdf') return 'tabler-file-type-pdf'
    if (['xls', 'xlsx'].includes(ext)) return 'tabler-file-type-xls'
    if (['doc', 'docx'].includes(ext)) return 'tabler-file-type-doc'
    return 'tabler-file'
}

const FileViewerDialog = ({ open, files, onClose }: {
    open: boolean; files: { name: string; url: string }[]; onClose: () => void
}) => {
    const [selectedIdx, setSelectedIdx] = useState(0)

    useEffect(() => {
        if (open) setSelectedIdx(0)
    }, [open, files])

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
                    startIcon={<i className='tabler-download' style={{ fontSize: 16 }} />}
                    onClick={() => downloadFile(selected)}
                >
                    Download file
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
                                            secondary={canPreview(file.name) ? 'Preview' : 'Download file'}
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
                                    <Tooltip title='Download file'>
                                        <IconButton size='small' onClick={() => downloadFile(selected)} sx={{ color: 'primary.main' }}>
                                            <i className='tabler-download' style={{ fontSize: 18 }} />
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

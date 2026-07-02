import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Tooltip, Button
} from '@mui/material'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import { Transition } from './shared'

const FileViewerDialog = ({ open, files, onClose }: {
    open: boolean
    files: { name: string; url: string }[]
    onClose: () => void
}) => {
    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'tabler-photo'
        if (ext === 'pdf') return 'tabler-file-type-pdf'
        if (['xls', 'xlsx'].includes(ext || '')) return 'tabler-file-type-xls'
        if (['doc', 'docx'].includes(ext || '')) return 'tabler-file-type-doc'
        return 'tabler-file'
    }

    return (
        <Dialog
            maxWidth='sm'
            fullWidth={true}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            TransitionComponent={Transition}
            open={open}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogTitle>
                <Typography variant='h5' component='span'>Attached Files ({files.length})</Typography>
                <DialogCloseButton onClick={onClose} disableRipple>
                    <i className='tabler-x' />
                </DialogCloseButton>
            </DialogTitle>
            <DialogContent dividers>
                {files.length === 0 ? (
                    <Typography color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>No files attached</Typography>
                ) : (
                    <List disablePadding>
                        {files.map((file, idx) => (
                            <ListItem
                                key={idx}
                                disablePadding
                                sx={{
                                    py: 1.5, px: 2, mb: 1, borderRadius: 1,
                                    border: '1px solid', borderColor: 'divider',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                                secondaryAction={
                                    <Tooltip title='Open / Download'>
                                        <IconButton
                                            edge='end'
                                            size='small'
                                            onClick={() => window.open(file.url, '_blank')}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <i className='tabler-external-link' style={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                }
                            >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <i className={getFileIcon(file.name)} style={{ fontSize: 24, color: 'var(--mui-palette-primary-main)' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant='body2'
                                            fontWeight={600}
                                            sx={{
                                                cursor: 'pointer', color: 'primary.main',
                                                '&:hover': { textDecoration: 'underline' }
                                            }}
                                            onClick={() => window.open(file.url, '_blank')}
                                        >
                                            {file.name}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start' }}>
                <Button onClick={onClose} variant='tonal' color='secondary'>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default FileViewerDialog

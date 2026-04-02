'use client'

// React Imports
import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import {
    Box,
    Slide,
    Typography,
    Card,
    Chip,
    Table,
    TableBody,
    TableRow,
    TableCell
} from '@mui/material'

interface ChangesSummary {
    added: Array<{ type: string; description: string }>
    removed: Array<{ type: string; description: string }>
    modified: Array<{ type: string; description: string; before?: string; after?: string }>
}

interface UpdatedData {
    vendor?: any
    contacts?: any[]
    products?: any[]
    updateSummary?: {
        vendor: number
        contacts: number
        products: number
        successful: number
        total: number
    }
    changes?: ChangesSummary
}

interface SuccessModalProps {
    open: boolean
    onClose: () => void
    title?: string
    message?: string
    updatedData?: UpdatedData
}

const Transition = forwardRef(function Transition(
    props: SlideProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) {
    return <Slide direction='down' ref={ref} {...props} />
})

const SuccessModal = ({
    open,
    onClose,
    title = "Save Successful",
    message = "Data has been updated successfully",
    updatedData
}: SuccessModalProps) => {
    // Check if changes exist and have items
    const hasChanges = updatedData?.changes && (
        updatedData.changes.added.length > 0 ||
        updatedData.changes.removed.length > 0 ||
        updatedData.changes.modified.length > 0
    )

    return (
        <Dialog
            maxWidth='sm'
            fullWidth={true}
            open={open}
            disableEscapeKeyDown
            TransitionComponent={Transition}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose()
                }
            }}
            sx={{
                '& .MuiDialog-paper': { overflow: 'visible' },
                '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
            }}
        >
            <DialogContent>
                {/* Success Header */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        bgcolor: 'success.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className='tabler-check' style={{ fontSize: 40, color: '#fff' }} />
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant='h4' color='success.main' gutterBottom>{title}</Typography>
                    <Typography variant='body1' color='text.secondary'>{message}</Typography>
                </Box>

                {/* Added Items */}
                {hasChanges && updatedData?.changes?.added && updatedData.changes.added.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <i className="tabler-plus" style={{ fontSize: 24, color: '#2e7d32' }} />
                            <Typography variant="h6">Added Items</Typography>
                            <Chip label={`${updatedData.changes.added.length} items`} size="small" color="success" />
                        </Box>

                        <Card variant="outlined">
                            <Table size="small">
                                <TableBody>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold', width: '70%' }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Type</TableCell>
                                    </TableRow>
                                    {updatedData.changes.added.map((item, index) => (
                                        <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                            <TableCell sx={{ fontWeight: 500, color: 'success.main' }}>{item.description}</TableCell>
                                            <TableCell>
                                                <Chip label={item.type} size="small" variant="outlined" color="success" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Box>
                )}

                {/* Removed Items */}
                {hasChanges && updatedData?.changes?.removed && updatedData.changes.removed.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <i className="tabler-trash" style={{ fontSize: 24, color: '#d32f2f' }} />
                            <Typography variant="h6">Removed Items</Typography>
                            <Chip label={`${updatedData.changes.removed.length} items`} size="small" color="error" />
                        </Box>

                        <Card variant="outlined">
                            <Table size="small">
                                <TableBody>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold', width: '70%' }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Type</TableCell>
                                    </TableRow>
                                    {updatedData.changes.removed.map((item, index) => (
                                        <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                            <TableCell sx={{ fontWeight: 500, color: 'error.main', textDecoration: 'line-through' }}>{item.description}</TableCell>
                                            <TableCell>
                                                <Chip label={item.type} size="small" variant="outlined" color="error" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Box>
                )}

                {/* Modified Items */}
                {hasChanges && updatedData?.changes?.modified && updatedData.changes.modified.length > 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <i className="tabler-edit" style={{ fontSize: 24, color: '#ed6c02' }} />
                            <Typography variant="h6">Modified Items</Typography>
                            <Chip label={`${updatedData.changes.modified.length} items`} size="small" color="warning" />
                        </Box>

                        <Card variant="outlined">
                            <Table size="small">
                                <TableBody>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Field</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Section</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'error.main' }}>Before</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'success.main' }}>After</TableCell>
                                    </TableRow>
                                    {updatedData.changes.modified.map((item, index) => (
                                        <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                            <TableCell sx={{ fontWeight: 500 }}>{item.description}</TableCell>
                                            <TableCell>
                                                <Chip label={item.type} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell sx={{ color: 'error.main', bgcolor: 'error.lighter' }}>
                                                {item.before || '-'}
                                            </TableCell>
                                            <TableCell sx={{ color: 'success.main', bgcolor: 'success.lighter' }}>
                                                {item.after || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </Box>
                )}

                {/* No changes message */}
                {!hasChanges && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                            No changes detected
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'flex-start', mb: 3 }}>
                <Button variant='contained' color='success' onClick={onClose} size='large'>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SuccessModal
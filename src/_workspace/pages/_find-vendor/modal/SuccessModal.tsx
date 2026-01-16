'use client'

import type { ReactElement, Ref } from 'react'
import { forwardRef } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Grid,
    Chip,
    Card,
    CardContent,
    Slide,
    SlideProps,
    Alert,
    AlertTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import EditIcon from '@mui/icons-material/Edit'

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
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" fontSize="large" />
                    <Typography variant="h6" component="div" fontWeight="bold">
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>
            
            <Divider />
            
            <DialogContent sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {message}
                </Typography>

                {/* Changes Summary */}
                {updatedData?.changes && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Changes Summary
                        </Typography>

                        {/* Added Items */}
                        {updatedData.changes.added.length > 0 && (
                            <Card variant="outlined" sx={{ mb: 2, bgcolor: 'success.light', opacity: 0.1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                                        <AddIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Added ({updatedData.changes.added.length})
                                    </Typography>
                                    <List dense>
                                        {updatedData.changes.added.map((item, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 30 }}>
                                                    <AddIcon fontSize="small" color="success" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={item.description}
                                                    secondary={item.type}
                                                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                                                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Removed Items */}
                        {updatedData.changes.removed.length > 0 && (
                            <Card variant="outlined" sx={{ mb: 2, bgcolor: 'error.light', opacity: 0.1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                                        <RemoveIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Removed ({updatedData.changes.removed.length})
                                    </Typography>
                                    <List dense>
                                        {updatedData.changes.removed.map((item, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 30 }}>
                                                    <RemoveIcon fontSize="small" color="error" />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={item.description}
                                                    secondary={item.type}
                                                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                                                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}

                        {/* Modified Items */}
                        {updatedData.changes.modified.length > 0 && (
                            <Card variant="outlined" sx={{ mb: 2, bgcolor: 'warning.light', opacity: 0.1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                                        <EditIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Modified ({updatedData.changes.modified.length})
                                    </Typography>
                                    <List dense>
                                        {updatedData.changes.modified.map((item, index) => (
                                            <ListItem key={index} sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 30 }}>
                                                    <EditIcon fontSize="small" color="warning" />
                                                </ListItemIcon>
                                                <ListItemText>
                                                    <Typography variant="body2" fontSize="0.875rem">
                                                        <strong>{item.description}</strong> ({item.type})
                                                    </Typography>
                                                    {item.before && item.after && (
                                                        <Box sx={{ mt: 0.5, pl: 1, borderLeft: 2, borderColor: 'grey.300' }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Before: <span style={{ color: '#f44336' }}>{item.before}</span>
                                                            </Typography>
                                                            <br />
                                                            <Typography variant="caption" color="text.secondary">
                                                                After: <span style={{ color: '#4caf50' }}>{item.after}</span>
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </ListItemText>
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                )}

                {/* Current Data Preview (if no changes summary) */}
                {!updatedData?.changes && updatedData && (
                    <Box>
                        {/* Company Information */}
                        {updatedData.vendor && (
                            <Card variant="outlined" sx={{ mb: 2, bgcolor: 'success.light', opacity: 0.1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="success.main" gutterBottom>
                                        <i className="tabler-building" style={{ marginRight: 8 }} />
                                        Company Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="body2">
                                                <strong>Company Name:</strong> {updatedData.vendor.company_name}
                                            </Typography>
                                        </Grid>
                                        {updatedData.vendor.province && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    <strong>Province:</strong> {updatedData.vendor.province}
                                                </Typography>
                                            </Grid>
                                        )}
                                        {updatedData.vendor.website && (
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    <strong>Website:</strong> {updatedData.vendor.website}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contacts */}
                        {updatedData.contacts && updatedData.contacts.length > 0 && (
                            <Card variant="outlined" sx={{ mb: 2, bgcolor: 'info.light', opacity: 0.1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="info.main" gutterBottom>
                                        <i className="tabler-users" style={{ marginRight: 8 }} />
                                        Contacts ({updatedData.contacts.length} persons)
                                    </Typography>
                                    {updatedData.contacts.map((contact, index) => (
                                        <Box key={index} sx={{ mb: index < updatedData.contacts!.length - 1 ? 2 : 0 }}>
                                            <Typography variant="body2">
                                                <strong>{contact.seller_name || 'N/A'}</strong>
                                                {contact.position && ` - ${contact.position}`}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {contact.tel_phone} | {contact.email}
                                            </Typography>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Products */}
                        {updatedData.products && updatedData.products.length > 0 && (
                            <Card variant="outlined" sx={{ bgcolor: 'warning.light', opacity: 0.1 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="warning.main" gutterBottom>
                                        <i className="tabler-package" style={{ marginRight: 8 }} />
                                        Products ({updatedData.products.length} items)
                                    </Typography>
                                    {updatedData.products.map((product, index) => (
                                        <Box key={index} sx={{ mb: index < updatedData.products!.length - 1 ? 2 : 0 }}>
                                            <Typography variant="body2">
                                                <strong>{product.product_name || 'N/A'}</strong>
                                                {product.maker_name && ` by ${product.maker_name}`}
                                            </Typography>
                                            {product.model_list && (
                                                <Box sx={{ mt: 0.5 }}>
                                                    {product.model_list.split('\n').filter((m: string) => m.trim()).map((model: string, idx: number) => (
                                                        <Chip 
                                                            key={idx}
                                                            label={model.trim()}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </Box>
                )}
            </DialogContent>
            
            <Divider />
            
            <DialogActions sx={{ p: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={onClose}
                    sx={{ minWidth: 100 }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SuccessModal
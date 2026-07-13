// Read-only detail primitives shared by the Vendor Details / Request Details screens.
// These mirror the "view mode" look of the Edit Vendor modal so every detail surface
// in the app reads as the same UI.
import type { ReactNode } from 'react'

import { Box, Divider, Grid, InputAdornment, Typography } from '@mui/material'

import CustomTextField from '@components/mui/TextField'

export type SectionHeaderProps = {
    icon: string
    title: string
    /** Optional trailing slot — e.g. an "Edit" or "View Files" button. */
    action?: ReactNode
}

export const SectionHeader = ({ icon, title, action }: SectionHeaderProps) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
            sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: 'primary.lightOpacity',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}
        >
            <i className={icon} style={{ fontSize: 14, color: 'var(--mui-palette-primary-main)' }} />
        </Box>
        <Typography variant='overline' fontWeight={700} letterSpacing={1} color='text.secondary'>
            {title}
        </Typography>
        {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
    </Box>
)

export type ReadOnlyFieldProps = {
    label: string
    value?: unknown
    multiline?: boolean
    endAdornment?: ReactNode
}

/** A themed, non-editable input — same control the Edit modal renders in view mode. */
export const ReadOnlyField = ({ label, value, multiline, endAdornment }: ReadOnlyFieldProps) => {
    const display = value === null || value === undefined ? '' : String(value)

    return (
        <CustomTextField
            fullWidth
            label={label}
            value={display}
            placeholder='-'
            size='small'
            disabled
            multiline={multiline}
            rows={multiline ? 2 : undefined}
            InputProps={{
                readOnly: true,
                endAdornment: endAdornment ? <InputAdornment position='end'>{endAdornment}</InputAdornment> : undefined
            }}
        />
    )
}

/** Bordered container used to group a section's fields. */
export const DetailCard = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            p: 2.5,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'primary.main'
        }}
    >
        {children}
    </Box>
)

/** Numbered record card — matches ContactsSection / ProductsSection in view mode. */
export const RecordCard = ({ index, title, children }: { index: number; title: string; children: ReactNode }) => (
    <DetailCard>
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant='caption' fontWeight={700}>
                            {index + 1}
                        </Typography>
                    </Box>
                    <Typography variant='subtitle2' fontWeight={600}>
                        {title}
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
            </Grid>
            {children}
        </Grid>
    </DetailCard>
)

export const EmptyState = ({ message }: { message: string }) => (
    <Box sx={{ p: 3, borderRadius: 1.5, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary'>
            {message}
        </Typography>
    </Box>
)

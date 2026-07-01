import { Box, Typography } from '@mui/material'
import type { SectionHeaderProps } from '@_workspace/types/_find-vendor/FindVendorTypes'



const SectionHeader = ({ icon, title }: SectionHeaderProps) => (
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
            }}
        >
            <i className={icon} style={{ fontSize: 14, color: 'var(--mui-palette-primary-main)' }} />
        </Box>
        <Typography variant='overline' fontWeight={700} letterSpacing={1} color='text.secondary'>
            {title}
        </Typography>
    </Box>
)

export default SectionHeader

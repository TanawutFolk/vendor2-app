import { Box, Stack, Typography } from '@mui/material'
import { getUserData } from '@/utils/user-profile/userLoginProfile'

const SearchFilter = () => {
    const empCode = String(getUserData()?.EMPLOYEE_CODE || '').trim()

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography variant='h5' sx={{ fontWeight: 700 }}>
                        Approval GPR C
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        Current GPR C workflow steps assigned to {empCode || 'current user'}
                    </Typography>
                </Box>
            </Box>
        </Stack>
    )
}

export default SearchFilter

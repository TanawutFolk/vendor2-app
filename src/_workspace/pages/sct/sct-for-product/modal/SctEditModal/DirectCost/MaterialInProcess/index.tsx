import Grid from '@mui/material/Grid'
import MaterialInProcessTable from './MaterialInProcessTable'
import { Box } from '@mui/material'
import React from 'react'
const MaterialInProcessTableData = React.lazy(() => import('./MaterialInProcessTableData'))

const MaterialInProcess = () => {
  return (
    <>
      <Grid item xs={12} sm={12} lg={12}>
        <Box
          sx={{
            backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
            color: 'var(--mui-palette-primary-main)',
            padding: '10px 10px',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}
        >
          Material in Process
        </Box>
      </Grid>
      <Grid item xs={12} sm={12} lg={12}>
        <MaterialInProcessTable />
      </Grid>
      <Grid item xs={12} sm={12} lg={12}>
        <MaterialInProcessTableData />
        {/* <MaterialInProcessTableData_AgGrid /> */}
      </Grid>
    </>
  )
}

export default MaterialInProcess

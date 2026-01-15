import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

import FlowProcessBomTable from './FlowProcessBomTable'
import FlowProcessBomTableData from './FlowProcessBomTableData'

const FlowProcess = () => {
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
          Flow Process
        </Box>
      </Grid>
      <Grid item xs={12} sm={12} lg={12}>
        <FlowProcessBomTable />
      </Grid>
      <Grid item xs={12} sm={12} lg={12}>
        <FlowProcessBomTableData />
      </Grid>
    </>
  )
}

export default FlowProcess

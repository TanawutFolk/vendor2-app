import Typography from '@mui/material/Typography'

const RenderError = (message?: string) =>
  message ? <Typography sx={{ color: 'error.main' }}>{message}</Typography> : null

export default RenderError

import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { Button, Grid } from '@mui/material'
import { breadcrumbNavigation, MENU_NAME } from './env'
import LoadingButton from '@mui/lab/LoadingButton'
import { useState } from 'react'
import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'
import SaveIcon from '@mui/icons-material/Coffee'
const ReCalFG = () => {
  return (
    <>
      <Grid container spacing={6}>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>
        <Grid item xs={12}>
          <div className='flex gap-8'>
            <P2 />
            <P3 />
          </div>
        </Grid>
      </Grid>
    </>
  )
}

const P2 = () => {
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleButtonClick = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const response =
        await StandardCostForProductServices.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(
          {
            ITEM_CATEGORY_ID: 1,
            SCT_STATUS_PROGRESS_ID: 3,
            SCT_PATTERN_ID: 1,
            FISCAL_YEAR: 2025,
            SCT_REASON_SETTING_ID: 1,
            CREATE_BY: 'S524',
            UPDATE_BY: 'S524'
          }
        )
      setData(response.data)
    } catch (err) {
      setError('P2 2025 : Re-cal ไม่สำเร็จ :(')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingButton
        variant='contained'
        color='primary'
        loading={loading}
        onClick={handleButtonClick}
        loadingPosition='start'
        startIcon={<SaveIcon />}
      >
        P2 2025 Re-Cal
      </LoadingButton>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <h1>P2 2025 : {data.Status == true ? 'Re-cal สำเร็จ :)' : 'Re-cal ไม่สำเร็จ :('}</h1>}
    </>
  )
}
const P3 = () => {
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleButtonClick = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const response =
        await StandardCostForProductServices.calculateSellPriceByItemCategoryAndSctStatusProgressIdAndSctPatternIdAndFiscalYearAndSctReasonSettingId(
          {
            ITEM_CATEGORY_ID: 1,
            SCT_STATUS_PROGRESS_ID: 3,
            SCT_PATTERN_ID: 2,
            FISCAL_YEAR: 2025,
            SCT_REASON_SETTING_ID: 1,
            CREATE_BY: 'S524',
            UPDATE_BY: 'S524'
          }
        )
      setData(response.data)
    } catch (err) {
      setError('P3 2025 : Re-cal ไม่สำเร็จ :(')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingButton
        variant='contained'
        color='info'
        loading={loading}
        onClick={handleButtonClick}
        loadingPosition='start'
        startIcon={<SaveIcon />}
      >
        P3 2025 Re-Cal
      </LoadingButton>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <h1>P3 2025 : {data.Status == true ? 'Re-cal สำเร็จ :)' : 'Re-cal ไม่สำเร็จ :('}</h1>}
    </>
  )
}
export default ReCalFG

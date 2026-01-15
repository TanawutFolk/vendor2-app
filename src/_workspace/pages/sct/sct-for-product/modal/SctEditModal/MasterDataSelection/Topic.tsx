import {
  Grid,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography
} from '@mui/material'

import { useFormContext, useFormState } from 'react-hook-form'
import Body from './Body'

import { FormDataPage } from '../validationSchema'
import RenderError from '@/_workspace/components/RenderError'

const Topic = () => {
  const { control } = useFormContext<FormDataPage>()
  const { errors } = useFormState({
    control
  })

  return (
    <>
      <Grid item xs={12} sm={12} lg={12} className='mt-2 mb-2'>
        <Typography color='primary'>Master Data Selection</Typography>
      </Grid>
      <Grid item xs={12} sm={12} lg={12}>
        <TableContainer component={Paper}>
          <Table
            size='small'
            sx={{
              // minWidth: 700,
              '& .MuiTableCell-root': {
                border: '1px solid var(--mui-palette-TableCell-border)'
              }
            }}
            aria-label='spanning table'
          >
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell align='center'>Manual Input</TableCell>
                <TableCell align='center'>
                  <div className='flex justify-center items-center '>
                    Master Data (Latest Revision)
                    <NoMaxWidthTooltip
                      title={
                        <>
                          {
                            'คำเตือน: หลังจากที่ SCT มีสถานะ “Prepared” และถูก Calculate (Cal) แล้ว ข้อมูลจะเป็น ค่าคงที่'
                          }
                          <br />
                          {
                            'Warning: Once SCT status is set to “Prepared” and Calculated (Cal), the data will be fixed values.'
                          }
                        </>
                      }
                      placement='top'
                    >
                      <i className='tabler-info-circle text-[18px] ms-1' />
                    </NoMaxWidthTooltip>
                  </div>
                </TableCell>
                <TableCell align='center'>SCT Selection</TableCell>
                <TableCell align='center'>Master Data (Specific Revision)</TableCell>
                <TableCell align='center'>Revision</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  Direct Cost Condition
                  {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.directCostCondition?.message)}
                </TableCell>
                <Body name='masterDataSelection.directCostCondition' SCT_COMPONENT_TYPE_ID={1} />
              </TableRow>
              <TableRow>
                <TableCell>
                  Indirect Cost Condition
                  {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.indirectCostCondition?.message)}
                </TableCell>
                <Body name='masterDataSelection.indirectCostCondition' SCT_COMPONENT_TYPE_ID={2} />
              </TableRow>
              <TableRow>
                <TableCell>
                  Other Cost Condition
                  {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.otherCostCondition?.message)}
                </TableCell>
                <Body name='masterDataSelection.otherCostCondition' SCT_COMPONENT_TYPE_ID={3} />
              </TableRow>
              <TableRow>
                <TableCell>
                  Special Cost Condition {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.specialCostCondition?.message)}
                </TableCell>
                <Body name='masterDataSelection.specialCostCondition' SCT_COMPONENT_TYPE_ID={4} />
              </TableRow>
              <TableRow>
                <TableCell>
                  Yield Rate & Go Straight Rate {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.yieldRateAndGoStraightRate?.message)}
                </TableCell>{' '}
                <Body name='masterDataSelection.yieldRateAndGoStraightRate' SCT_COMPONENT_TYPE_ID={5} />
              </TableRow>
              <TableRow>
                <TableCell>
                  Clear Time {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.clearTime?.message)}
                </TableCell>{' '}
                <Body name='masterDataSelection.clearTime' SCT_COMPONENT_TYPE_ID={6} />
              </TableRow>
              <TableRow>
                <TableCell>
                  Manufacturing Item Price {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.manufacturingItemPrice?.message)}
                </TableCell>{' '}
                <Body name='masterDataSelection.manufacturingItemPrice' SCT_COMPONENT_TYPE_ID={7} />
              </TableRow>
              <TableRow>
                <TableCell>
                  Yield Rate Material
                  {RenderError(errors?.masterDataSelection?.message)}
                  {RenderError(errors?.masterDataSelection?.yieldRateMaterial?.message)}
                </TableCell>
                <Body name='masterDataSelection.yieldRateMaterial' SCT_COMPONENT_TYPE_ID={8} />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </>
  )
}

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none',
    backgroundColor: 'var(--background-color)',
    color: 'var(--secondary-color)'
  }
})

export default Topic

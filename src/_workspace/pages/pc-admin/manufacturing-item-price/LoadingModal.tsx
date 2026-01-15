// React Imports
import type { Ref, ReactElement, SetStateAction, Dispatch, ChangeEvent } from 'react'
import { forwardRef, useEffect, useState } from 'react'
// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import { FormControl, FormControlLabel, FormLabel, Grid, LinearProgress, Radio, RadioGroup, Slide } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Props
interface FiscalYearPeriodAddModalProps {
  openAddModal: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const LoadingModal = ({ openAddModal, setOpenModalAdd, setIsEnableFetching }: FiscalYearPeriodAddModalProps) => {
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === 100) {
          return 0
        }
        const diff = Math.random() * 10

        return Math.min(oldProgress + diff, 100)
      })
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <>
      <Dialog maxWidth='sm' fullWidth={true} TransitionComponent={Transition} open={openAddModal} keepMounted>
        <DialogContent>
          <Grid className='mb-5'>
            <Typography className='font-medium mbe-1.5'>Creating All Standard Price</Typography>
            <LinearProgress variant='determinate' value={progress} />
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LoadingModal

// React Imports

import type { Ref, ReactElement, SetStateAction, Dispatch } from 'react'
import { forwardRef, useEffect, useMemo, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import type { SlideProps } from '@mui/material'
import { Card, CardContent, Chip, Divider, Grid, InputAdornment, Slide } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { styled } from '@mui/material/styles'
import Step from '@mui/material/Step'
import MuiStepper from '@mui/material/Stepper'
import MenuItem from '@mui/material/MenuItem'
import StepLabel from '@mui/material/StepLabel'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import type { StepperProps } from '@mui/material/Stepper'

import {
  MaterialReactTable,

  // createRow,
  type MRT_ColumnDef,
  MRT_ColumnFilterFnsState,
  MRT_ColumnFiltersState,
  type MRT_Row,
  useMaterialReactTable,
  MRT_TableOptions
} from 'material-react-table'

// Third-party Imports
import { useQueryClient } from '@tanstack/react-query'
import {
  object,
  string,
  nullable,
  number,
  unknown,
  array,
  boolean,
  picklist,
  optional,
  record,
  minLength,
  maxLength,
  toTrimmed,
  pipe,
  nonEmpty,
  regex,
  nullish,
  email,
  forward,
  check
} from 'valibot'
import { toast } from 'react-toastify'

import type { Input } from 'valibot'
import { zodResolver } from '@hookform/resolvers/zod'

import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

import { Controller, FormProvider, useForm, useFormState } from 'react-hook-form'

import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

// Your imports
import type { FormData } from './validationSchema'
import { validationSchema } from './validationSchema'

// Components Imports
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import ConfirmModal from '@components/ConfirmModal'
import StepperWrapper from '@core/styles/stepper'
import StepperCustomDot from '@components/stepper-dot'
import DirectionalIcon from '@components/DirectionalIcon'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

// React-hook-form Imports

// React Query Imports
// Utils
import { getUserData } from '@/utils/user-profile/userLoginProfile'

import { fetchProcessByLikeProcessAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import {
  fetchItemCodeForSupportMesAndInuse,
  fetchItemCodeForSupportMesBySctId
} from '@/_workspace/react-select/async-promise-load-options/fetchItemManufacturing'

import type { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import BatchChangeMaterialStepOne from './BatchChangeMaterialStepOne'
import BatchChangeMaterialStepTwo from './BatchChangeMaterialStepTwo'
import BatchChangeMaterialStepThree from './BatchChangeMaterialStepThree'

// Vars
const steps = [
  {
    title: 'Selected Standard Cost',
    subtitle: 'Enter your standard cost issues'
  },
  {
    title: 'Condition',
    subtitle: 'Setup Condition'
  },
  {
    title: 'Batch Change Material',
    subtitle: 'Evaluate your changes'
  }
]

// Styled Components
const Stepper = styled(MuiStepper)<StepperProps>(({ theme }) => ({
  justifyContent: 'center',
  '& .MuiStep-root': {
    '&:first-of-type': {
      paddingInlineStart: 0
    },
    '&:last-of-type': {
      paddingInlineEnd: 0
    },
    [theme.breakpoints.down('md')]: {
      paddingInline: 0
    }
  }
}))

const accountValidationSchema = object({
  // username: pipe(string(), nonEmpty('This field is required'), minLength(1)),
  // email: pipe(string(), nonEmpty('This field is required'), email('Please enter a valid email address')),
  // password: pipe(
  //   string(),
  //   nonEmpty('This field is required'),
  //   minLength(3, 'Password must be at least 3 characters long')
  // ),
  // confirmPassword: pipe(string(), nonEmpty('This field is required'), minLength(3))
})

// const accountSchema = pipe(
//   accountValidationSchema,
//   forward(
//     check(input => input.password === input.confirmPassword, 'Passwords do not match.'),
//     ['confirmPassword']
//   )
// )

const accountSchema = object({
  // accountValidationSchema,
  // forward(
  //   check(input => input.password === input.confirmPassword, 'Passwords do not match.'),
  //   ['confirmPassword']
  // )
})

const personalSchema = object({
  firstName: pipe(string(), nonEmpty('This field is required'), minLength(1)),
  lastName: pipe(string(), nonEmpty('This field is required'), minLength(1)),
  country: pipe(string(), nonEmpty('This field is required'), minLength(1)),
  language: pipe(array(string()), nonEmpty('This field is required'), minLength(1))
})

const socialSchema = object({
  //  twitter: pipe(string(), nonEmpty('This field is required'), minLength(1)),
  // facebook: pipe(string(), nonEmpty('This field is required'), minLength(1)),
  // google: pipe(string(), nonEmpty('This field is required'), minLength(1)),
  // linkedIn: pipe(string(), nonEmpty('This field is required'), minLength(1))
})

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// Props
interface BatchChangeMaterialStepModalProps {
  openModalBatchChange: boolean
  setOpenModalBatchChange: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const BatchChangeMaterialStepModal = ({
  openModalBatchChange,
  setOpenModalBatchChange,
  setIsEnableFetching
}: BatchChangeMaterialStepModalProps) => {
  // State
  const [dataRow, setDataRow] = useState([
    {
      id: 1
    }
  ])

  const [modeMenu, setModeMenu] = useState<string>('add' || 'edit')

  // States : Dialog
  const [confirmModal, setConfirmModal] = useState(false)

  // States
  const [activeStep, setActiveStep] = useState(0)
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [data2, setData2] = useState<StandardCostI[]>([])
  const [dataForBatchChange, setDataForBatchChange] = useState<StandardCostI[]>([])

  // Hooks
  const {
    reset: accountReset,
    control: accountControl,
    handleSubmit: handleAccountSubmit,
    formState: { errors: accountErrors }
  } = useForm({
    // resolver: zodResolver(accountSchema)
  })

  const {
    reset: personalReset,
    control: personalControl,
    handleSubmit: handlePersonalSubmit,
    formState: { errors: personalErrors }
  } = useForm({})

  const {
    reset: socialReset,
    control: socialControl,
    handleSubmit: handleSocialSubmit,
    formState: { errors: socialErrors }
  } = useForm({})

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const onSubmit = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)

    if (activeStep === steps.length - 1) {
      toast.success('Form Submitted')
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
    setDataForBatchChange([])

    // setSctList([])
    // setSctSelectList([])
  }

  const handleReset = () => {
    setActiveStep(0)
    accountReset({ password: '', confirmPassword: '' })
    personalReset({ firstName: '', lastName: '', country: '', language: [] })
    socialReset({ twitter: '', facebook: '', google: '', linkedIn: '' })
    setIsPasswordShown(false)
    setIsConfirmPasswordShown(false)
  }

  // Hooks : react-hook-form
  // const { control, handleSubmit, setValue, reset, getValues, watch, unregister } = useForm<FormData>({
  //   resolver: zodResolver(validationSchema)
  // })

  // #region react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    resolver: zodResolver(validationSchema)
  })

  const { control, getValues } = reactHookFormMethods

  const { errors } = useFormState({
    control
  })

  // Functions
  const handleClose = () => {
    //setDataRow((prevUsers: any) => prevUsers?.filter((user: User) => user.id !== 1))
    setOpenModalBatchChange(false)
    setDataRow([])
    setValue('searchFilters.itemCodeForSupportMes', null)
    setValue('searchFilters.process', null)
    setValue('searchFilters.itemCategory', null)
    setValue('searchFilters.bom', null)
    setValue('searchFilters.flow', null)
    setValue('searchFilters.productCategory', null)
    setValue('searchFilters.productMain', null)
    setValue('searchFilters.productSub', null)
    setValue('searchFilters.productType', null)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const renderStepContent = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        return (
          <form key={0} onSubmit={handleAccountSubmit(onSubmit)}>
            <Grid container spacing={6}>
              {/* <Grid item xs={12}>
                <Typography className='font-medium' color='text.primary'>
                  <Chip label={steps[0].title} color='primary' variant='tonal' size='small' />
                </Typography>
              </Grid> */}
              <>
                <Grid item xs={12}>
                  <BatchChangeMaterialStepOne
                    setIsEnableFetching={setIsEnableFetching}
                    data2={data2}
                    setData2={setData2}

                    //sctSelectedList={sctSelectedList}
                    //setSctSelectedList={setSctSelectedList}
                  />
                </Grid>
              </>
              <Grid item xs={12} className='flex justify-between'>
                <Button
                  variant='tonal'
                  disabled
                  color='secondary'
                  startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
                >
                  Back
                </Button>
                <Button
                  variant='contained'
                  type='submit'
                  endIcon={<DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' />}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          </form>
        )
      case 1:
        return (
          <form key={1} onSubmit={handlePersonalSubmit(onSubmit)}>
            <Grid container spacing={6}>
              <BatchChangeMaterialStepTwo
                data2={data2}
                dataForBatchChange={dataForBatchChange}
                setDataForBatchChange={setDataForBatchChange}
              />
              <Grid item xs={12} className='flex justify-between'>
                <Button
                  variant='tonal'
                  onClick={handleBack}
                  color='secondary'
                  startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
                >
                  Back
                </Button>
                <Button
                  variant='contained'
                  type='submit'
                  endIcon={<DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' />}
                >
                  Next
                </Button>
              </Grid>
            </Grid>
          </form>
        )
      case 2:
        return (
          <form key={2} onSubmit={handleSocialSubmit(onSubmit)}>
            <Grid container spacing={6}>
              <BatchChangeMaterialStepThree dataForBatchChange={dataForBatchChange} />

              <Grid item xs={12} className='flex justify-between'>
                <Button
                  variant='tonal'
                  onClick={handleBack}
                  color='secondary'
                  startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
                >
                  Back
                </Button>
                <Button variant='contained' type='submit' endIcon={<i className='tabler-check' />}>
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        )
      default:
        return <Typography>Unknown stepIndex</Typography>
    }
  }

  return (
    <>
      <Dialog
        maxWidth='xl'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openModalBatchChange}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Batch Change Material
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Card>
            <CardContent>
              <StepperWrapper>
                <Stepper activeStep={activeStep}>
                  {steps.map((label, index) => {
                    const labelProps: {
                      error?: boolean
                    } = {}

                    if (index === activeStep) {
                      labelProps.error = false

                      if ((accountErrors.password || accountErrors['confirmPassword']) && activeStep === 0) {
                        labelProps.error = true
                      } else if (
                        (personalErrors.firstName ||
                          personalErrors.lastName ||
                          personalErrors.country ||
                          personalErrors.language) &&
                        activeStep === 1
                      ) {
                        labelProps.error = true
                      } else if (
                        (socialErrors.google ||
                          socialErrors.twitter ||
                          socialErrors.facebook ||
                          socialErrors.linkedIn) &&
                        activeStep === 2
                      ) {
                        labelProps.error = true
                      } else {
                        labelProps.error = false
                      }
                    }

                    return (
                      <Step key={index} className='max-md:mbe-5'>
                        <StepLabel {...labelProps} StepIconComponent={StepperCustomDot}>
                          <div className='step-label'>
                            <Typography className='step-number'>{`${index + 1}`}</Typography>
                            <div>
                              <Typography className='step-title' color='text.primary'>
                                {label.title}
                              </Typography>
                              <Typography className='step-subtitle'>{label.subtitle}</Typography>
                            </div>
                          </div>
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
              </StepperWrapper>
            </CardContent>
            <Divider />
            <CardContent>
              <FormProvider {...reactHookFormMethods}>
                {activeStep === steps.length ? (
                  <>
                    <Typography className='mlb-2 mli-1'>All steps are completed!</Typography>
                    <div className='flex justify-end mt-4'>
                      <Button variant='contained' onClick={handleReset}>
                        Reset
                      </Button>
                    </div>
                  </>
                ) : (
                  renderStepContent(activeStep)
                )}
              </FormProvider>
            </CardContent>
          </Card>
        </DialogContent>
        {/* <DialogActions>
          <Button
            className='mt-2'
            // onClick={() => handleSubmit(onSubmit, onError)()}
            variant='contained'
            type='button'

          >
            Search
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions> */}
      </Dialog>
    </>
  )
}

export default BatchChangeMaterialStepModal

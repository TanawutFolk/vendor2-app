import type { Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import React, { createContext, forwardRef, useState } from 'react'
import type { SlideProps } from '@mui/material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import Stepper from '@mui/material/Stepper'
import MuiStep from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import type { StepProps } from '@mui/material/Step'
import classnames from 'classnames'
import { toast } from 'react-toastify'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import StepperWrapper from '@/@core/styles/stepper'
import CustomAvatar from '@/@core/components/mui/Avatar'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import MultipleCreateSearch from './Page1_SelectProductType/MultipleCreateSearch'
import MultipleCreate from './Page2_Create'
import DirectionalIcon from '@/components/DirectionalIcon'
import { FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form'
import { FormDataPage, validationSchemaPage } from './dataValidation'
import { zodResolver } from '@hookform/resolvers/zod'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { PREFIX_QUERY_KEY, useCreateSctFormMultiple } from '@/_workspace/react-query/hooks/useStandardCostForProduct'
import AxiosResponseI, { AxiosResponseWithErrorI } from '@/libs/axios/types/AxiosResponseInterface'
import ConfirmModal from '@/components/ConfirmModal'
import { MultipleSctDataResponse } from './type'
import dayjs from 'dayjs'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useQueryClient } from '@tanstack/react-query'

// Vars
const steps = [
  {
    title: 'Product Type List',
    icon: 'tabler-file-analytics',
    subtitle: 'Select a Product Type'
  },
  {
    title: 'Details for Multiple Creation',
    icon: 'tabler-file-plus',
    subtitle: 'Set Up Your Data'
  }
]

const Step = styled(MuiStep)<StepProps>(({ theme }) => ({
  paddingInline: theme.spacing(7),
  paddingBlock: theme.spacing(1),
  '& + i': {
    color: 'var(--mui-palette-text-secondary)'
  },
  '&:first-of-type': {
    paddingInlineStart: 0
  },
  '&:last-of-type': {
    paddingInlineEnd: 0
  },
  '& .MuiStepLabel-iconContainer': {
    display: 'none'
  },
  '&.Mui-completed .step-title, &.Mui-completed .step-subtitle': {
    color: 'var(--mui-palette-text-disabled)'
  },
  '&.Mui-completed + i': {
    color: 'var(--mui-palette-primary-main)'
  },
  [theme.breakpoints.down('md')]: {
    padding: 0,
    ':not(:last-of-type)': {
      marginBlockEnd: theme.spacing(6)
    }
  }
}))

// Dialog
const Transition = forwardRef(function Transition(props: SlideProps & { children?: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface Props {
  openMultipleCreateModal: boolean
  setOpenMultipleCreateModal: Dispatch<SetStateAction<boolean>>
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetchingMainTable: Dispatch<SetStateAction<boolean>>
}

type AppContextContextType = {
  confirmModal: boolean
  setConfirmModal: Dispatch<SetStateAction<boolean>>
}

const AppContext = createContext<AppContextContextType>({
  confirmModal: false,
  setConfirmModal: () => {}
})

const StandardMultipleCreateModal = ({
  openMultipleCreateModal,
  setOpenMultipleCreateModal,
  setOpenModalAdd,
  setIsEnableFetchingMainTable
}: Props) => {
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage)
  })

  const { getValues, handleSubmit, reset } = reactHookFormMethods
  // react-hook-form
  const [isDraft, setIsDraft] = useState(false)

  // let selectedSchema = isDraft ? draftSchema : saveSchema
  const [confirmModal, setConfirmModal] = useState(false)

  const [isEnableFetching, setIsEnableFetching] = useState(false)
  const [dataProductTypeSelected, setDataProductTypeSelected] = useState<ProductTypeI[]>([])

  const queryClient = useQueryClient()

  // Functions
  const handleClose = () => {
    setIsEnableFetchingMainTable(true)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

    setOpenMultipleCreateModal(false)
    setOpenModalAdd(false)
  }

  // States
  const [activeStep, setActiveStep] = useState<number>(0)

  // Handle Stepper
  const handleNext = () => {
    //setActiveStep(activeStep + 1)
    // setActiveStep(prevActiveStep => prevActiveStep + 1)

    if (dataProductTypeSelected.length <= 0) {
      toast.error('Please Select Product Type')
    } else {
      setActiveStep(prevActiveStep => prevActiveStep + 1)
    }

    // setActiveStep(activeStep + 1)
  }

  const handlePrev = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)

    // if (activeStep !== 0) {
    //   setActiveStep(activeStep - 1)
    // }
  }

  const getStepContent = (step: number, handleNext: () => void, handlePrev: () => void) => {
    switch (step) {
      case 0:
        return (
          <MultipleCreateSearch
            handleNext={handleNext}
            setIsEnableFetching={setIsEnableFetching}
            dataProductTypeSelected={dataProductTypeSelected}
            setDataProductTypeSelected={setDataProductTypeSelected}
          />
        )
      case 1:
        return (
          <FormProvider {...reactHookFormMethods}>
            <AppContext.Provider value={{ confirmModal, setConfirmModal }}>
              <MultipleCreate
                handleNext={handleNext}
                handlePrev={handlePrev}
                isEnableFetching={isEnableFetching}
                setIsEnableFetching={setIsEnableFetching}
                dataProductTypeSelected={dataProductTypeSelected}
                setOpenMultipleCreateModal={setOpenMultipleCreateModal}
                isDraft={isDraft}
                setIsDraft={setIsDraft}
                setOpenModalAdd={setOpenModalAdd}
                setIsEnableFetchingMainTable={setIsEnableFetchingMainTable}
              />
            </AppContext.Provider>
          </FormProvider>
        )

      default:
        return null
    }
  }

  const onMutateSuccess = (data: AxiosResponseI) => {
    if (data?.data?.Status == true) {
      // if (data.data.ResultOnDb.affectedRows === 0) {
      //   const message = {
      //     title: 'SCT Form',
      //     message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
      //   }
      //   ToastMessageError(message)
      //   return
      // }
      // Ausada

      const message = {
        message: data.data.Message,
        title: 'SCT Multiple Create'
      }

      ToastMessageSuccess(message)
      // setOpenModalAdd(false)
      handleClose()
    } else {
      const message = {
        title: 'SCT Form',
        message: data.data.Message
      }
      ToastMessageError(message)
    }
  }

  const onMutateError = (err: AxiosResponseWithErrorI) => {
    const message = {
      title: 'SCT Multiple Create',
      message: err.message
    }

    ToastMessageError(message)
  }

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormDataPage> = data => {
    toast.error('Please fill in the required fields')
    console.log(data)
  }

  const createMutation = useCreateSctFormMultiple(onMutateSuccess, onMutateError)

  const handleSaveComplete = () => {
    //setConfirmModal(false)

    const dataItem: MultipleSctDataResponse = {
      IS_DRAFT: false,
      SCT_F_CREATE_TYPE_ID: 3,
      SCT_F_CREATE_TYPE_ALPHABET: 'M',

      SCT_FORMULA_VERSION_ID: 3,

      SCT_PATTERN_ID: getValues('header.sctPatternNo.value'),
      SCT_PATTERN_NO: getValues('header.sctPatternNo.label'),

      FISCAL_YEAR: getValues('header.fiscalYear.value'),

      ESTIMATE_PERIOD_START_DATE: dayjs(getValues('header.estimatePeriodStartDate')).format('YYYY-MM-DD'),
      ESTIMATE_PERIOD_END_DATE: dayjs(getValues('header.estimatePeriodEndDate')).format('YYYY-MM-DD'),

      SCT_REASON_SETTING_ID: getValues('header.sctReason.SCT_REASON_SETTING_ID'),
      SCT_REASON_SETTING_NAME: getValues('header.sctReason.SCT_REASON_SETTING_NAME'),
      SCT_TAG_SETTING_ID: getValues('header.sctTag.SCT_TAG_SETTING_ID') || '',
      SCT_TAG_SETTING_NAME: getValues('header.sctTag.SCT_TAG_SETTING_NAME') || '',

      CREATE_BY: getUserData().EMPLOYEE_CODE,
      UPDATE_BY: getUserData().EMPLOYEE_CODE,

      NOTE: getValues('header.note') || '',

      LIST_MULTIPLE_SCT_DATA: []
    }

    const LIST_SCT_CREATE_FROM_SETTING: {
      SCT_CREATE_FROM_SETTING_ID: number
      SCT_CREATE_FROM_NAME: string
    }[] = [
      { SCT_CREATE_FROM_SETTING_ID: 1, SCT_CREATE_FROM_NAME: 'BOM - BOM Actual' },
      { SCT_CREATE_FROM_SETTING_ID: 2, SCT_CREATE_FROM_NAME: 'BOM - BOM Then' },
      { SCT_CREATE_FROM_SETTING_ID: 3, SCT_CREATE_FROM_NAME: 'SCT Tag - MES' },
      { SCT_CREATE_FROM_SETTING_ID: 4, SCT_CREATE_FROM_NAME: 'SCT Tag - Budget' },
      { SCT_CREATE_FROM_SETTING_ID: 5, SCT_CREATE_FROM_NAME: 'SCT Tag - Price' },
      { SCT_CREATE_FROM_SETTING_ID: 6, SCT_CREATE_FROM_NAME: 'SCT Last Revision' },
      { SCT_CREATE_FROM_SETTING_ID: 7, SCT_CREATE_FROM_NAME: 'SCT Selection' }
    ]

    const masterDataSelection = getValues(`masterDataSelection`)

    for (let i = 0; i < dataProductTypeSelected?.length; i++) {
      const element = dataProductTypeSelected[i]
      const body = getValues(`productType.body.${element.PRODUCT_TYPE_CODE}`)

      const SCT_CREATE_FROM_SETTING_ID: number | undefined = LIST_SCT_CREATE_FROM_SETTING.find(
        dataItem => dataItem.SCT_CREATE_FROM_NAME === body?.sctCreateFrom
      )?.SCT_CREATE_FROM_SETTING_ID

      if (!SCT_CREATE_FROM_SETTING_ID) {
        toast.error('SCT Create From not found')
        return
      }

      if (typeof body?.bomId !== 'number') {
        toast.error('BOM ID not found')
        return
      }

      const BOM_ID: number = body.bomId
      const SCT_ID_SELECTION: string = body?.sctSelectId || ''
      const CREATE_FROM_SCT_STATUS_PROGRESS_ID: number | '' =
        body?.sctSelectStatusProgress?.SCT_STATUS_PROGRESS_ID || ''
      const CREATE_FROM_SCT_FISCAL_YEAR: number | '' = body?.sctSelectFiscalYear?.value ?? ''
      const CREATE_FROM_SCT_PATTERN_ID: number | '' = body?.sctSelectPattern?.SCT_PATTERN_ID ?? ''

      if ([3, 4, 5, 6, 7].includes(SCT_CREATE_FROM_SETTING_ID) && !SCT_ID_SELECTION) {
        toast.error('SCT Selection not found')
        return
      }

      // push data

      dataItem.LIST_MULTIPLE_SCT_DATA.push({
        SCT_CREATE_FROM_SETTING_ID,
        BOM_ID,
        UPDATE_BY: getUserData().EMPLOYEE_CODE,
        CREATE_FROM_SCT_ID: SCT_ID_SELECTION,
        CREATE_BY: getUserData().EMPLOYEE_CODE,
        CREATE_FROM_SCT_FISCAL_YEAR,
        CREATE_FROM_SCT_PATTERN_ID,
        CREATE_FROM_SCT_STATUS_PROGRESS_ID,

        PRODUCT_CATEGORY_ID: element?.PRODUCT_CATEGORY_ID,
        PRODUCT_CATEGORY_NAME: element?.PRODUCT_CATEGORY_NAME,
        PRODUCT_CATEGORY_ALPHABET: element?.PRODUCT_CATEGORY_ALPHABET,
        PRODUCT_MAIN_ID: element?.PRODUCT_MAIN_ID,
        PRODUCT_MAIN_NAME: element?.PRODUCT_MAIN_NAME,
        PRODUCT_MAIN_ALPHABET: element?.PRODUCT_MAIN_ALPHABET,
        PRODUCT_SUB_ID: element?.PRODUCT_SUB_ID,
        PRODUCT_SUB_NAME: element?.PRODUCT_SUB_NAME,
        PRODUCT_SUB_ALPHABET: element?.PRODUCT_SUB_ALPHABET,
        PRODUCT_TYPE_ID: element?.PRODUCT_TYPE_ID,
        PRODUCT_TYPE_NAME: element?.PRODUCT_TYPE_NAME,
        PRODUCT_TYPE_CODE: element?.PRODUCT_TYPE_CODE,

        PRODUCT_SPECIFICATION_TYPE_ID: element?.PRODUCT_SPECIFICATION_TYPE_ID,
        PRODUCT_SPECIFICATION_TYPE_ALPHABET: element?.PRODUCT_SPECIFICATION_TYPE_ALPHABET,
        PRODUCT_SPECIFICATION_TYPE_NAME: element?.PRODUCT_SPECIFICATION_TYPE_NAME,

        // ** DATA

        listSctComponentType: [
          {
            SCT_COMPONENT_TYPE_ID: 1,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.directCostCondition.SCT_RESOURCE_OPTION_ID
          },
          {
            SCT_COMPONENT_TYPE_ID: 2,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.indirectCostCondition.SCT_RESOURCE_OPTION_ID
          },
          {
            SCT_COMPONENT_TYPE_ID: 3,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.otherCostCondition.SCT_RESOURCE_OPTION_ID
          },
          {
            SCT_COMPONENT_TYPE_ID: 4,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.specialCostCondition.SCT_RESOURCE_OPTION_ID
          },
          {
            SCT_COMPONENT_TYPE_ID: 5,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.yieldRateAndGoStraightRate.SCT_RESOURCE_OPTION_ID
          },
          {
            SCT_COMPONENT_TYPE_ID: 6,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.clearTime.SCT_RESOURCE_OPTION_ID
          },
          {
            SCT_COMPONENT_TYPE_ID: 7,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.manufacturingItemPrice.SCT_RESOURCE_OPTION_ID
          },
          {
            SCT_COMPONENT_TYPE_ID: 8,
            SCT_RESOURCE_OPTION_ID: masterDataSelection.yieldRateMaterial.SCT_RESOURCE_OPTION_ID
          }
        ]
      })
    }
    createMutation.mutate(dataItem)
  }

  return (
    <>
      <ConfirmModal
        show={confirmModal}
        onConfirmClick={handleSaveComplete}
        onCloseClick={() => setConfirmModal(false)}
        isDelete={false}
        isLoading={createMutation.isPending}
      />

      <Dialog
        fullWidth={true}
        maxWidth={false}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openMultipleCreateModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span' color='primary'>
            Standard Cost Form |
          </Typography>
          <Typography variant='h5' component='span'>
            {' '}
            Multiple Create
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <StepperWrapper>
            <Stepper activeStep={activeStep} className='mbe-2 md:mbe-2'>
              {steps.map((step, index) => {
                return (
                  <Step key={index}>
                    <StepLabel>
                      <div className='step-label'>
                        <CustomAvatar
                          variant='rounded'
                          skin={activeStep === index ? 'filled' : 'light'}
                          {...(activeStep >= index && { color: 'primary' })}
                          {...(activeStep === index && { className: 'shadow-primarySm' })}
                          size={38}
                        >
                          <i className={classnames(step.icon, 'text-[22px]')} />
                        </CustomAvatar>
                        <div>
                          <Typography className='step-title'>{step.title}</Typography>
                          <Typography className='step-subtitle'>{step.subtitle}</Typography>
                        </div>
                      </div>
                    </StepLabel>
                  </Step>
                )
              })}
            </Stepper>
            {getStepContent(activeStep, handleNext, handlePrev)}
          </StepperWrapper>
        </DialogContent>
        <DialogActions>
          {activeStep === 0 ? (
            <>
              <Button
                disabled
                variant='tonal'
                color='secondary'
                startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
              >
                Previous
              </Button>
              <Button
                variant='contained'
                onClick={() => {
                  handleNext()
                  reset()
                }}
                endIcon={<DirectionalIcon ltrIconClass='tabler-arrow-right' rtlIconClass='tabler-arrow-left' />}
              >
                Next
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='tonal'
                color='secondary'
                onClick={handlePrev}
                startIcon={<DirectionalIcon ltrIconClass='tabler-arrow-left' rtlIconClass='tabler-arrow-right' />}
              >
                Previous
              </Button>
              <Button
                variant='contained'
                onMouseEnter={() => setIsDraft(false)}
                color='success'
                disabled={createMutation.isPending}
                onClick={() => {
                  return handleSubmit(onSubmit, onError)()
                }}
              >
                {createMutation.isPending ? 'Saving...' : 'Save & Complete'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default StandardMultipleCreateModal

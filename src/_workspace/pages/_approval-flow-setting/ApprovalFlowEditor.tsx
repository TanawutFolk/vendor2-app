import { useEffect, useMemo, useState } from 'react'

import LoadingButton from '@mui/lab/LoadingButton'
import { Box, Card, CardContent, CardHeader, Chip, Divider, FormControlLabel, Grid, Stack, Switch, Typography } from '@mui/material'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'

import ConfirmModal from '@components/ConfirmModal'
import SelectCustom from '@/components/react-select/SelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useApprovalFlowSetting, useSaveWorkflowSetting } from '@/_workspace/react-query/hooks/useApprovalFlowSetting'
import type {
  ApprovalFlowDataI,
  ApprovalGroupOptionI,
  WorkflowDraftStepPayloadI,
  WorkflowStepI
} from '@/_workspace/types/_approval-flow-setting/ApprovalFlowSettingTypes'

import type { FormDataPage } from './validationSchema'

const toFlag = (value: unknown) => (value === true || Number(value) === 1 ? 1 : 0)

const mapGroupOption = (group: ApprovalFlowDataI['APPROVAL_GROUPS'][number]): ApprovalGroupOptionI => ({
  value: Number(group.APPROVAL_GROUP_ID),
  label: `${group.GROUP_NAME} / ${group.APPROVER_NAME || 'No active approver'}`,
  groupCode: group.GROUP_CODE,
  activeMemberCount: Number(group.ACTIVE_MEMBER_COUNT)
})

const mapStepToForm = (step: WorkflowStepI, groupOptions: ApprovalGroupOptionI[]): FormDataPage['STEPS'][number] => ({
  WORKFLOW_STEP_MASTER_ID: Number(step.WORKFLOW_STEP_MASTER_ID),
  WORKFLOW_STEP_TYPE_ID: Number(step.WORKFLOW_STEP_TYPE_ID),
  STEP_CODE: step.STEP_CODE,
  STEP_NAME: step.STEP_NAME || step.STATUS_LABEL || step.STEP_CODE,
  IS_REQUIRED: Number(step.IS_REQUIRED),
  DEFAULT_STEP_ORDER: Number(step.DEFAULT_STEP_ORDER),
  APPROVAL_GROUP: groupOptions.find(option => option.value === Number(step.DEFAULT_APPROVAL_GROUP_ID || 0)) || null,
  CAN_EDIT_SELECTION_SHEET: Number(step.CAN_EDIT_SELECTION_SHEET || 0),
  LOCK_SELECTION_SHEET_ON_APPROVE: Number(step.LOCK_SELECTION_SHEET_ON_APPROVE || 0),
  INUSE: Number(step.IS_REQUIRED) === 1 ? 1 : Number(step.INUSE)
})

const ApprovalFlowEditor = () => {
  const user = getUserData()
  const [openConfirm, setOpenConfirm] = useState(false)
  const [pendingSavePayload, setPendingSavePayload] = useState<Record<string, unknown> | null>(null)

  const { control, handleSubmit, reset, watch, formState } = useFormContext<FormDataPage>()
  const { fields } = useFieldArray({ control, name: 'STEPS' })
  const watchedSteps = watch('STEPS')

  const workflowQuery = useApprovalFlowSetting()
  const workflowData = workflowQuery.data as ApprovalFlowDataI | undefined
  const groupOptions = useMemo(
    () => (workflowData?.APPROVAL_GROUPS || []).map(mapGroupOption),
    [workflowData?.APPROVAL_GROUPS]
  )

  useEffect(() => {
    if (!workflowData?.DEFINITION) return

    const configurableSteps = workflowData.STEPS.filter(step => Number(step.IS_CONFIGURABLE) === 1)
    reset({
      WORKFLOW_DEFINITION_ID: Number(workflowData.DEFINITION.WORKFLOW_DEFINITION_ID),
      DESCRIPTION: '',
      STEPS: configurableSteps.map(step => mapStepToForm(step, groupOptions))
    })
  }, [groupOptions, reset, workflowData])

  const saveSettingMutation = useSaveWorkflowSetting(
    () => {
      setOpenConfirm(false)
      setPendingSavePayload(null)
      ToastMessageSuccess({ message: 'Approval flow settings saved successfully.' })
    },
    error => {
      setOpenConfirm(false)
      ToastMessageError({ message: error.message })
    }
  )

  const requestSave = handleSubmit(formData => {
    const steps: WorkflowDraftStepPayloadI[] = formData.STEPS.map(step => ({
      WORKFLOW_STEP_MASTER_ID: step.WORKFLOW_STEP_MASTER_ID,
      WORKFLOW_STEP_TYPE_ID: step.WORKFLOW_STEP_TYPE_ID,
      DEFAULT_STEP_ORDER: step.DEFAULT_STEP_ORDER,
      DEFAULT_APPROVAL_GROUP_ID: Number(step.APPROVAL_GROUP?.value || 0),
      CAN_EDIT_SELECTION_SHEET: toFlag(step.CAN_EDIT_SELECTION_SHEET),
      LOCK_SELECTION_SHEET_ON_APPROVE: toFlag(step.LOCK_SELECTION_SHEET_ON_APPROVE),
      INUSE: toFlag(step.INUSE)
    }))

    setPendingSavePayload({ STEPS: steps, UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM' })
    setOpenConfirm(true)
  })

  const activePreviewSteps = (watchedSteps || []).filter(step => Number(step.INUSE) === 1)
  const skippedOptionalSteps = (watchedSteps || []).filter(
    step => Number(step.IS_REQUIRED) !== 1 && Number(step.INUSE) !== 1
  )

  if (workflowQuery.isLoading) return <SkeletonCustom />

  if (workflowQuery.isError || !workflowData) {
    return (
      <Card>
        <CardContent>
          <Typography color='error'>
            {workflowQuery.error instanceof Error ? workflowQuery.error.message : 'Failed to load approval flow.'}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Approval Flow Preview'
              subheader='Preview the flow that will apply to new requests.'
            />
            <Divider />
            <CardContent>
              <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap' alignItems='center'>
                <Chip label='PO PIC / GPR C' color='info' variant='filled' />
                {activePreviewSteps.map(step => (
                  <Box key={step.WORKFLOW_STEP_TYPE_ID} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <i className='tabler-arrow-right text-xl' />
                    <Chip label={step.STEP_NAME} color='primary' variant='filled' />
                  </Box>
                ))}
                <i className='tabler-arrow-right text-xl' />
                <Chip label='Account Register' color='success' variant='filled' />
              </Stack>
              {skippedOptionalSteps.length > 0 && (
                <Box sx={{ mt: 4, p: 3, border: '1px solid', borderColor: 'info.main', borderRadius: 1 }}>
                  <Typography variant='body2' color='info.main'>
                    {skippedOptionalSteps.map(step => step.STEP_NAME).join(', ')} will be skipped. The workflow will
                    continue directly to the first active approval step.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Approval Steps'
              subheader='PO Mgr, PO GM and MD are required and always included in the flow.'
            />
            <Divider />
            <CardContent>
              <Grid container spacing={4}>
                {fields.map((field, index) => {
                  const stepEnabled = Number(watchedSteps?.[index]?.INUSE) === 1
                  const isRequired = Number(watchedSteps?.[index]?.IS_REQUIRED) === 1

                  return (
                    <Grid item xs={12} key={field.id}>
                      <Card variant='outlined'>
                        <CardContent>
                          <Grid container spacing={4} alignItems='center'>
                            <Grid item xs={12} md={4}>
                              <Stack direction='row' spacing={2} alignItems='center'>
                                <Box
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: stepEnabled ? 'primary.main' : 'action.disabledBackground',
                                    color: stepEnabled ? 'primary.contrastText' : 'text.disabled',
                                    fontWeight: 700
                                  }}
                                >
                                  {index + 1}
                                </Box>
                                <Typography variant='h6'>{watchedSteps?.[index]?.STEP_NAME}</Typography>
                                {isRequired && <Chip label='Required' size='small' color='error' variant='filled' />}
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={8} md={5}>
                              <Controller
                                name={`STEPS.${index}.APPROVAL_GROUP`}
                                control={control}
                                render={({ field: groupField }) => (
                                  <SelectCustom<ApprovalGroupOptionI>
                                    classNamePrefix='select'
                                    label='Approval Group / Approver'
                                    value={groupField.value}
                                    options={groupOptions}
                                    onChange={groupField.onChange}
                                    isDisabled={!stepEnabled}
                                    isClearable={false}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                              <Controller
                                name={`STEPS.${index}.INUSE`}
                                control={control}
                                render={({ field: activeField }) => (
                                  <FormControlLabel
                                    label={stepEnabled ? 'Included in Flow' : 'Skipped'}
                                    control={
                                      <Switch
                                        checked={stepEnabled}
                                        onChange={event => activeField.onChange(event.target.checked ? 1 : 0)}
                                        disabled={isRequired}
                                      />
                                    }
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </CardContent>
            <Divider />
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 2 }}>
              <LoadingButton
                variant='contained'
                loading={saveSettingMutation.isPending}
                disabled={!formState.isDirty}
                onClick={requestSave}
              >
                Save Changes
              </LoadingButton>
              {formState.isDirty && (
                <Typography variant='body2' color='warning.main'>
                  You have unsaved changes.
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      <ConfirmModal
        show={openConfirm}
        onConfirmClick={() => {
          if (pendingSavePayload) saveSettingMutation.mutate(pendingSavePayload)
        }}
        onCloseClick={() => {
          if (!saveSettingMutation.isPending) {
            setOpenConfirm(false)
            setPendingSavePayload(null)
          }
        }}
        isLoading={saveSettingMutation.isPending}
        message='Save and apply these approval flow changes? New requests will use the new settings; existing requests will not be changed.'
      />
    </>
  )
}

export default ApprovalFlowEditor

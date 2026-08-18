import { z } from 'zod'

const approvalGroupOptionSchema = z.object({
  value: z.number().int().positive(),
  label: z.string(),
  groupCode: z.string(),
  activeMemberCount: z.number().int().nonnegative()
})

const workflowStepSchema = z.object({
  WORKFLOW_STEP_MASTER_ID: z.number().int().positive(),
  WORKFLOW_STEP_TYPE_ID: z.number().int().positive(),
  STEP_CODE: z.string(),
  STEP_NAME: z.string(),
  IS_REQUIRED: z.number().int(),
  DEFAULT_STEP_ORDER: z.number().int().positive(),
  APPROVAL_GROUP: approvalGroupOptionSchema.nullable(),
  CAN_EDIT_SELECTION_SHEET: z.number().int(),
  LOCK_SELECTION_SHEET_ON_APPROVE: z.number().int(),
  INUSE: z.number().int()
})

export const validationSchemaPage = z.object({
  WORKFLOW_DEFINITION_ID: z.number().int().nonnegative(),
  DESCRIPTION: z.string().trim().max(100, 'Change reason must not exceed 100 characters.'),
  STEPS: z.array(workflowStepSchema)
})

export type FormDataPage = z.infer<typeof validationSchemaPage>

export const fetchDefaultValues = async (): Promise<FormDataPage> => ({
  WORKFLOW_DEFINITION_ID: 0,
  DESCRIPTION: '',
  STEPS: []
})

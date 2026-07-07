export type TaskQueueRow = Record<string, unknown> & {
    REQUEST_REGISTER_VENDOR_ID?: number
    REQUEST_NUMBER?: string
    COMPANY_NAME?: string
    REQUEST_STATUS?: string
    REQUEST_STATE?: string
    VENDOR_REGION?: string
    CREATE_DATE?: string
    WORKFLOW_TYPE?: string
    CURRENT_STEP_NAME?: string
    CURRENT_STEP_CODE?: string
    CURRENT_GROUP_CODE?: string
    CURRENT_GROUP_NAME?: string
    CURRENT_OWNER_EMPCODE?: string
    CURRENT_OWNER_ACTIVE?: boolean | number
    REASSIGN_ENABLED?: boolean | number
    ASSIGNMENT_HEALTH?: string
}

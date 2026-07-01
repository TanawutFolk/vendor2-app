export type TaskQueueRow = Record<string, unknown> & {
    request_id?: number
    request_number?: string
    company_name?: string
    request_status?: string
    request_state?: string
    vendor_region?: string
    CREATE_DATE?: string
    workflow_type?: string
    current_step_name?: string
    current_step_code?: string
    current_group_code?: string
    current_group_name?: string
    current_owner_empcode?: string
    current_owner_active?: boolean | number
    reassign_enabled?: boolean | number
    assignment_health?: string
}

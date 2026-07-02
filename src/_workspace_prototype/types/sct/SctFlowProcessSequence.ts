export interface SctFlowProcessSequenceI {
  SCT_FLOW_PROCESS_SEQUENCE_ID: string
  SCT_ID: string
  FLOW_PROCESS_ID: string
  SCT_PROCESS_SEQUENCE_CODE: string
  OLD_SYSTEM_PROCESS_SEQUENCE_CODE: string
  OLD_SYSTEM_COLLECTION_POINT: boolean
  DESCRIPTION: string
  CREATE_BY: string
  CREATE_DATE: string
  UPDATE_BY: string
  UPDATE_DATE: string
  INUSE: 1 | 0
  IS_FROM_SCT_COPY: 1 | 0
}

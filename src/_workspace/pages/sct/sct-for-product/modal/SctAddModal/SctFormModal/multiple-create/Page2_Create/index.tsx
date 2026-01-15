import type { Dispatch, SetStateAction } from 'react'
import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import { useFormContext } from 'react-hook-form'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

interface Props {
  handleNext: () => void
  handlePrev: () => void
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
  dataProductTypeSelected: ProductTypeI[]
  setOpenMultipleCreateModal: Dispatch<SetStateAction<boolean>>
  isDraft: boolean
  setIsDraft: Dispatch<SetStateAction<boolean>>
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetchingMainTable: Dispatch<SetStateAction<boolean>>
}

import MasterDataSelection_Topic from './MasterDataSelection/Topic'
// import { MRT_RowSelectionState } from 'material-react-table'

import { FormDataPage } from '../dataValidation'

import ProductTypeSelection from './ProductTypeSelection'
import Header from './Header'

const MultipleCreate = ({
  // handlePrev,
  dataProductTypeSelected
  // setOpenMultipleCreateModal,
  // isDraft,
  // setIsDraft
}: Props) => {
  // Hooks : react-hook-form

  // const [isOpenChangeTagBudget, setIsOpenChangeTagBudget] = useState(false)
  // const [sctTagBudget, setSctTagBudget] = useState([])

  // const reactHookFormMethods = useForm<FormDataPage>({
  //   resolver: zodResolver(validationSchemaPage)
  // })

  const { getValues, watch, setValue } = useFormContext<FormDataPage>()

  // useEffect(() => {
  //   reset()
  // }, [])

  // const { errors } = useFormState({
  //   control
  // })

  // const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})
  // const [dataList, setDataList] = useState<[]>([])

  // const [openModalView, setOpenModalView] = useState(false)

  // // // Hooks : react-query
  // const queryClient = useQueryClient()

  // const onSubmit = () => {
  //   setConfirmModal(true)
  // }

  // const onDraft = () => {
  //   setConfirmModal(true)
  // }

  // const onError: SubmitErrorHandler<FormDataPage> = data => {
  //   console.log(data)
  // }

  // const handleClose = () => {
  //   setOpenMultipleCreateModal(false)
  // }

  // const onMutateSuccess = (data: any) => {
  //   if (data.data && data.data.Status == true) {
  //     if (data.data.ResultOnDb.affectedRows === 0) {
  //       const message = {
  //         title: 'SCT Form',
  //         message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
  //       }

  //       ToastMessageError(message)
  //       return
  //     }

  //     // Ausada
  //     // setOpenModalAdd(false)
  //     // handleClose()
  //   } else {
  //     const message = {
  //       title: 'SCT Form',
  //       message: data.data.Message
  //     }
  //     ToastMessageError(message)
  //   }
  // }

  // const onMutateError = (err: any) => {
  //   const message = {
  //     title: 'SCT Form',
  //     message: err.Message
  //   }

  //   ToastMessageError(message)
  // }

  // const createMutation = useCreateSctFormMultiple(onMutateSuccess, onMutateError)

  // const handleDraft = () => {
  //   console.log('DRAFT')
  //   setConfirmModal(false)

  //   let listMultipleSct = []

  //   for (let i = 0; i < dataProductTypeSelected?.length; i++) {
  //     const element = dataProductTypeSelected[i]

  //     let dataItem = {
  //       BOM_ID:
  //         getValues(`BOM_ACTUAL_BOM-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID ||
  //         getValues(`BOM_THEN_BOM-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID ||
  //         getValues(`MES_BOM_BOM-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID ||
  //         getValues(`BUDGET_BOM_BOM-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID ||
  //         getValues(`PRICE_BOM_BOM-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID,

  //       PRODUCT_CATEGORY_ID: element?.PRODUCT_CATEGORY_ID,
  //       PRODUCT_CATEGORY_NAME: element?.PRODUCT_CATEGORY_NAME,
  //       PRODUCT_CATEGORY_ALPHABET: element?.PRODUCT_CATEGORY_ALPHABET,
  //       PRODUCT_MAIN_ID: element?.PRODUCT_MAIN_ID,
  //       PRODUCT_MAIN_NAME: element?.PRODUCT_MAIN_NAME,
  //       PRODUCT_MAIN_ALPHABET: element?.PRODUCT_MAIN_ALPHABET,
  //       PRODUCT_SUB_ID: element?.PRODUCT_SUB_ID,
  //       PRODUCT_SUB_NAME: element?.PRODUCT_SUB_NAME,
  //       PRODUCT_SUB_ALPHABET: element?.PRODUCT_SUB_ALPHABET,
  //       PRODUCT_TYPE_ID: element?.PRODUCT_TYPE_ID,
  //       PRODUCT_TYPE_NAME: element?.PRODUCT_TYPE_NAME,
  //       PRODUCT_TYPE_CODE: element?.PRODUCT_TYPE_CODE,

  //       PRODUCT_SPECIFICATION_TYPE_ID: element?.PRODUCT_SPECIFICATION_TYPE_ID,
  //       PRODUCT_SPECIFICATION_TYPE_ALPHABET: element?.PRODUCT_SPECIFICATION_TYPE_ALPHABET,
  //       PRODUCT_SPECIFICATION_TYPE_NAME: element?.PRODUCT_SPECIFICATION_TYPE_NAME,

  //       // ** DATA
  //       SCT_REASON_SETTING: getValues()?.SCT_REASON_SETTING,
  //       SCT_TAG_SETTING: getValues()?.SCT_TAG_SETTING,
  //       COST_CONDITION: getValues()?.COST_CONDITION,
  //       COST_CONDITION_RESOURCE_OPTION_ID: getValues()?.COST_CONDITION_RESOURCE_OPTION_ID,
  //       END_DATE: getValues()?.END_DATE,
  //       FISCAL_YEAR: getValues()?.FISCAL_YEAR,
  //       MATERIAL_PRICE: getValues()?.MATERIAL_PRICE,
  //       MATERIAL_PRICE_RESOURCE_OPTION_ID: getValues()?.MATERIAL_PRICE_RESOURCE_OPTION_ID,
  //       SCT_PATTERN_NO: getValues()?.SCT_PATTERN_NO,
  //       START_DATE: getValues()?.START_DATE,
  //       TIME_FROM_MFG: getValues()?.TIME_FROM_MFG,
  //       TIME_FROM_MFG_RESOURCE_OPTION_ID: getValues()?.TIME_FROM_MFG_RESOURCE_OPTION_ID,
  //       YR_ACCUMULATION_MATERIAL_FROM_ENGINEER: getValues()?.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER,
  //       YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID:
  //         getValues()?.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID,
  //       YR_GR_FROM_ENGINEER: getValues()?.YR_GR_FROM_ENGINEER,
  //       YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID: getValues()?.YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID,
  //       IS_DRAFT: true,
  //       SCT_F_CREATE_TYPE_ID: 3,
  //       SCT_F_CREATE_TYPE_ALPHABET: 'S',
  //       CREATE_BY: getUserData().EMPLOYEE_CODE
  //     }

  //     listMultipleSct.push(dataItem)
  //   }

  //   let dataItem = {
  //     LIST_MULTIPLE_SCT_DATA: listMultipleSct
  //   }
  //   // console.log('dataItem', dataItem)

  //   // createDraftMutation.mutate(dataItem)
  // }

  // const handleSaveComplete = () => {
  //   setConfirmModal(false)

  //   const dataItem: MultipleSctDataResponse = {
  //     IS_DRAFT: false,
  //     SCT_F_CREATE_TYPE_ID: 3,
  //     SCT_F_CREATE_TYPE_ALPHABET: 'M',

  //     SCT_FORMULA_VERSION_ID: 3,

  //     SCT_PATTERN_ID: getValues('header.fiscalYear.value'),
  //     SCT_PATTERN_NO: getValues('header.sctPatternNo.label'),

  //     FISCAL_YEAR: getValues('header.fiscalYear.value'),

  //     ESTIMATE_PERIOD_START_DATE: dayjs(getValues('header.estimatePeriodStartDate')).format('YYYY-MM-DD'),
  //     ESTIMATE_PERIOD_END_DATE: dayjs(getValues('header.estimatePeriodEndDate')).format('YYYY-MM-DD'),

  //     SCT_REASON_SETTING_ID: getValues('header.sctReason.SCT_REASON_SETTING_ID'),
  //     SCT_REASON_SETTING_NAME: getValues('header.sctReason.SCT_REASON_SETTING_NAME'),
  //     SCT_TAG_SETTING_ID: getValues('header.sctTag.SCT_TAG_SETTING_ID') || '',
  //     SCT_TAG_SETTING_NAME: getValues('header.sctTag.SCT_TAG_SETTING_NAME') || '',

  //     CREATE_BY: getUserData().EMPLOYEE_CODE,
  //     UPDATE_BY: getUserData().EMPLOYEE_CODE,

  //     NOTE: getValues('header.note') || '',

  //     LIST_MULTIPLE_SCT_DATA: []
  //   }

  //   for (let i = 0; i < dataProductTypeSelected?.length; i++) {
  //     const element = dataProductTypeSelected[i]

  //     // declare variable
  //     let SCT_CREATE_FROM_SETTING_ID: number
  //     let BOM_ID: number
  //     let SCT_ID_SELECTION: string = ''
  //     let CREATE_FROM_SCT_STATUS_PROGRESS_ID: number | '' = ''
  //     let CREATE_FROM_SCT_FISCAL_YEAR: number | '' = ''
  //     let CREATE_FROM_SCT_PATTERN_ID: number | '' = ''

  //     // check Sct Create From & Assign Value
  //     if (getValues(`BOM_SWITCH.BOM_ACTUAL-${element?.PRODUCT_TYPE_ID}.BOM_ID`)) {
  //       SCT_CREATE_FROM_SETTING_ID = 1
  //       BOM_ID = getValues(`BOM_SWITCH.BOM_ACTUAL-${element?.PRODUCT_TYPE_ID}`).BOM_ID
  //     } else if (getValues(`SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID) {
  //       SCT_CREATE_FROM_SETTING_ID = 6
  //       BOM_ID = getValues(`SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`).BOM_ID

  //       // SCT_ID_SELECTION
  //       SCT_ID_SELECTION = getValues(`SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`).SCT_ID
  //       CREATE_FROM_SCT_STATUS_PROGRESS_ID = getValues(
  //         `SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`
  //       ).SCT_STATUS_PROGRESS_ID
  //       CREATE_FROM_SCT_PATTERN_ID = getValues(`SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`).SCT_PATTERN_ID
  //       CREATE_FROM_SCT_FISCAL_YEAR = getValues(`SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`).FISCAL_YEAR
  //     } else if (getValues(`SCT_SWITCH.SCT_LATEST_REVISION.DATA-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID) {
  //       SCT_CREATE_FROM_SETTING_ID = 7
  //       BOM_ID = getValues(`SCT_SWITCH.SCT_LATEST_REVISION.DATA-${element?.PRODUCT_TYPE_ID}`).BOM_ID

  //       // SCT_ID_SELECTION
  //       SCT_ID_SELECTION = getValues(`SCT_SWITCH.SCT_LATEST_REVISION.DATA-${element?.PRODUCT_TYPE_ID}`).SCT_ID
  //       CREATE_FROM_SCT_STATUS_PROGRESS_ID = getValues(
  //         `SCT_SWITCH.SCT_LATEST_REVISION.DATA-${element?.PRODUCT_TYPE_ID}`
  //       ).SCT_STATUS_PROGRESS_ID
  //       CREATE_FROM_SCT_PATTERN_ID = getValues(`SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`).SCT_PATTERN_ID
  //       CREATE_FROM_SCT_FISCAL_YEAR = getValues(`SCT_SWITCH.SCT_SELECT.DATA-${element?.PRODUCT_TYPE_ID}`).FISCAL_YEAR
  //     } else {
  //       const message = {
  //         title: 'SCT Multiple Create',
  //         message: 'Not found : SCT CREATE FROM'
  //       }

  //       ToastMessageError(message)
  //       return
  //     }

  //     // push data

  //     dataItem.LIST_MULTIPLE_SCT_DATA.push({
  //       SCT_CREATE_FROM_SETTING_ID,
  //       BOM_ID,
  //       UPDATE_BY: getUserData().EMPLOYEE_CODE, // UPDATE_BY
  //       CREATE_FROM_SCT_ID: SCT_ID_SELECTION,
  //       CREATE_BY: getUserData().EMPLOYEE_CODE,
  //       CREATE_FROM_SCT_FISCAL_YEAR,
  //       CREATE_FROM_SCT_PATTERN_ID,
  //       CREATE_FROM_SCT_STATUS_PROGRESS_ID,
  //       // SCT_FISCAL_YEAR: getValues(`SCT_SWITCH.SCT_FISCAL_YEAR.ID-${element?.PRODUCT_TYPE_ID}.SCT_FISCAL_YEAR_ID`),
  //       // SCT_SCT_PATTERN_ID: getValues(`SCT_SWITCH.SCT_PATTERN.ID-${element?.PRODUCT_TYPE_ID}.SCT_PATTERN_ID`),

  //       PRODUCT_CATEGORY_ID: element?.PRODUCT_CATEGORY_ID,
  //       PRODUCT_CATEGORY_NAME: element?.PRODUCT_CATEGORY_NAME,
  //       PRODUCT_CATEGORY_ALPHABET: element?.PRODUCT_CATEGORY_ALPHABET,
  //       PRODUCT_MAIN_ID: element?.PRODUCT_MAIN_ID,
  //       PRODUCT_MAIN_NAME: element?.PRODUCT_MAIN_NAME,
  //       PRODUCT_MAIN_ALPHABET: element?.PRODUCT_MAIN_ALPHABET,
  //       PRODUCT_SUB_ID: element?.PRODUCT_SUB_ID,
  //       PRODUCT_SUB_NAME: element?.PRODUCT_SUB_NAME,
  //       PRODUCT_SUB_ALPHABET: element?.PRODUCT_SUB_ALPHABET,
  //       PRODUCT_TYPE_ID: element?.PRODUCT_TYPE_ID,
  //       PRODUCT_TYPE_NAME: element?.PRODUCT_TYPE_NAME,
  //       PRODUCT_TYPE_CODE: element?.PRODUCT_TYPE_CODE,

  //       PRODUCT_SPECIFICATION_TYPE_ID: element?.PRODUCT_SPECIFICATION_TYPE_ID,
  //       PRODUCT_SPECIFICATION_TYPE_ALPHABET: element?.PRODUCT_SPECIFICATION_TYPE_ALPHABET,
  //       PRODUCT_SPECIFICATION_TYPE_NAME: element?.PRODUCT_SPECIFICATION_TYPE_NAME,

  //       // ** DATA

  //       listSctComponentType: [
  //         {
  //           SCT_COMPONENT_TYPE_ID: 1,
  //           SCT_RESOURCE_OPTION_ID: getValues('COST_CONDITION_RESOURCE_OPTION_ID')
  //         },
  //         {
  //           SCT_COMPONENT_TYPE_ID: 2,
  //           SCT_RESOURCE_OPTION_ID: getValues('YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID')
  //         },
  //         {
  //           SCT_COMPONENT_TYPE_ID: 3,
  //           SCT_RESOURCE_OPTION_ID: getValues('TIME_FROM_MFG_RESOURCE_OPTION_ID')
  //         },
  //         {
  //           SCT_COMPONENT_TYPE_ID: 4,
  //           SCT_RESOURCE_OPTION_ID: getValues('MATERIAL_PRICE_RESOURCE_OPTION_ID')
  //         },
  //         {
  //           SCT_COMPONENT_TYPE_ID: 5,
  //           SCT_RESOURCE_OPTION_ID: getValues('YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID')
  //         }
  //       ]

  //       // COST_CONDITION: getValues()?.COST_CONDITION,
  //       // COST_CONDITION_RESOURCE_OPTION_ID: getValues()?.COST_CONDITION_RESOURCE_OPTION_ID,

  //       // YR_GR_FROM_ENGINEER: getValues()?.YR_GR_FROM_ENGINEER,
  //       // YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID:
  //       //   getValues()?.YR_GR_FROM_ENGINEER_RESOURCE_OPTION_ID,

  //       // TIME_FROM_MFG: getValues()?.TIME_FROM_MFG,
  //       // TIME_FROM_MFG_RESOURCE_OPTION_ID: getValues()?.TIME_FROM_MFG_RESOURCE_OPTION_ID,

  //       // MATERIAL_PRICE: getValues()?.MATERIAL_PRICE,
  //       // MATERIAL_PRICE_RESOURCE_OPTION_ID: getValues()?.MATERIAL_PRICE_RESOURCE_OPTION_ID,

  //       // YR_ACCUMULATION_MATERIAL_FROM_ENGINEER:
  //       //   getValues()?.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER,
  //       // YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID:
  //       //   getValues()?.YR_ACCUMULATION_MATERIAL_FROM_ENGINEER_RESOURCE_OPTION_ID,

  //       // SCT_F
  //       // SCT_F_CREATE_TYPE_ID: 3,
  //       // SCT_F_CREATE_TYPE_ALPHABET: 'S',
  //       // SCT_F_M_RESOURCE_FROM_ID: getValues(`BOM_ACTUAL_BOM-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID
  //       //   ? 1
  //       //   : getValues(`BOM_THEN_BOM-${element?.PRODUCT_TYPE_ID}`)?.BOM_ID
  //       //     ? 2
  //       //     : getValues(`SCT_SWITCH.MES.ID-${element?.PRODUCT_TYPE_ID}`)
  //       //       ? 3
  //       //       : getValues(`SCT_SWITCH.BUDGET.ID-${element?.PRODUCT_TYPE_ID}`)
  //       //         ? 4
  //       //         : getValues(`SCT_SWITCH.PRICE.ID-${element?.PRODUCT_TYPE_ID}`)
  //       //           ? 5
  //       //           : getValues(`SCT_SWITCH.SCT_LATEST_REVISION.ID-${element?.PRODUCT_TYPE_ID}`)
  //       //             ? 6
  //       //             : getValues(`SCT_SWITCH.SCT_SELECT.ID-${element?.PRODUCT_TYPE_ID}`)
  //       //               ? 7
  //       //               : undefined,
  //     })

  //     // listMultipleSct.push(dataItem)
  //   }

  //   // const dataItem = {
  //   //   LIST_MULTIPLE_SCT_DATA: listMultipleSct
  //   // }
  //   //console.log('dataItem', dataItem)

  //   createMutation.mutate(dataItem)
  // }

  return (
    <>
      <Grid container spacing={4}>
        <Header dataProductTypeSelected={dataProductTypeSelected} />
        <Grid item xs={12}>
          <ProductTypeSelection dataProductTypeSelected={dataProductTypeSelected} />
        </Grid>
        <Grid item xs={12}>
          <MasterDataSelection_Topic />
        </Grid>
      </Grid>

      {/* <ConfirmModal
        show={confirmModal}
        onConfirmClick={handleSaveComplete}
        onCloseClick={() => setConfirmModal(false)}
        isDelete={false}
      /> */}

      {/* {openModalView ? (
        <SctForProductEditModal
          isOpenModal={openModalView}
          setIsOpenModal={setOpenModalView}
          rowSelected={rowSelection}
          setRowSelected={setRowSelection}
          mode='view'
        />
      ) : null} */}
    </>
  )
}
export default MultipleCreate

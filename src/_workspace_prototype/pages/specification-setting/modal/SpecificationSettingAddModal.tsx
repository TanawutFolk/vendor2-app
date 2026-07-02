import type { Ref, ReactElement, Dispatch, SetStateAction } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// MUI Imports

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { SlideProps } from '@mui/material'
import { Box, Divider, Grid, Slide } from '@mui/material'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, FormProvider, useForm, useFormContext, useFormState } from 'react-hook-form'
import type { FadeProps } from '@mui/material/Fade'
import Fade from '@mui/material/Fade'
import AsyncSelect from 'react-select/async'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import AddIcon from '@mui/icons-material/Add'

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
  nullish,
  pipe,
  nonEmpty,
  minValue,
  union,
  literal,
  variant
} from 'valibot'

import type { InferInput } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import AsyncCreatableSelect from 'react-select/async-creatable'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

// import type { ProductCategoryOption } from '@/libs/react-select/AsyncPromiseLoadOptions/fetchProductCategory'
// import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/libs/react-select/AsyncPromiseLoadOptions/'
import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useSpecificationSettingData'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import { getUserData } from '@/utils/user-profile/userLoginProfile'

import type { SearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'

import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import ConfirmModal from '@components/ConfirmModal'
import { ToastMessageError, ToastMessageSuccess } from '@components/ToastMessage'

// import { fetchProductMainByLikeProductMainNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProductMain'
import { fetchCustomerOrderFromByLikeCustomerOrderFromNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerOrderFrom'
import {
  fetchProcessByLikeProcessAndInuse,
  fetchProcessByLikeProcessNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import { fetchSubProcessByLikeProcessAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchSubProcess'
import {
  useCreateSpecificationSetting,
  useSearchSpecificationSetting
} from '@/_workspace/react-query/hooks/useSpecificationSettingData'
import SpecificationSettingDnd from './SpecificationSettingDnd'

import SpecificationSettingCompleteTable from './SpecificationSettingCompleteTable'
import data from '@/data/searchData'
import SpecificationSettingCompleteTableForSearch from './SpecificationSettingCompleteTableForSearch'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

// interface ParamApiSearchProfileI extends ParamApiSearchResultTableI {
//   PRODUCT_SPECIFICATION_SETTING_ID?: number | ''
//   CUSTOMER_ORDER_FROM_ID?: number | ''
//   PRODUCT_MAIN_NAME?: string
//   PRODUCT_SPECIFICATION_SETTING_NAME?: string
//   CUSTOMER_ORDER_FROM_NAME?: string
// }

export type FormData = InferInput<typeof schema>

const schema = object({
  // productCategory: object({
  //   PRODUCT_CATEGORY_ID: coerce(string([toTrimmed()])
  // }),

  // searchFilters: object({
  //   productMain: record(
  //     string(),
  //     object(
  //       {
  //         PRODUCT_MAIN_ID: number('Please select ...'),
  //         PRODUCT_MAIN_NAME: string()
  //       },
  //       'Product Main is required'
  //     ),
  //     'Product Main is required'
  //   ),
  searchFilters: object({
    productMain: nullish(
      object({
        PRODUCT_MAIN_ID: nullish(number())

        // ,PRODUCT_MAIN_NAME: nullish(string())
      })
    ),
    customerOrderFrom: nullish(
      object({
        CUSTOMER_ORDER_FROM_ID: nullish(number())

        // ,PRODUCT_MAIN_NAME: nullish(string())
      })
    ),

    // customerOrderFrom: nullish(
    //   object({
    //     CUSTOMER_ORDER_FROM_ID: nullish(number()),
    //     CUSTOMER_ORDER_FROM_NAME: nullish(string())
    //   })
    // ),

    productSpecificationType: record(
      string(),
      object(
        {
          PRODUCT_SPECIFICATION_TYPE_ID: number('Please select ...'),
          PRODUCT_SPECIFICATION_TYPE_NAME: string()
        },
        'Product Specification Type is required'
      ),
      'Product Specification Type is required'
    ),
    // customerOrderFrom: record(
    //   string(),
    //   object(
    //     {
    //       CUSTOMER_ORDER_FROM_ID: number('Please select ...'),
    //       CUSTOMER_ORDER_FROM_NAME: string()
    //     },
    //     'Customer Order From is required'
    //   ),
    //   'Customer Order From is required'
    // ),

    specificationSetting: record(
      string(),
      pipe(
        string('Product Specification Setting is required'),
        nonEmpty('Product Specification Setting is required'),
        minLength(3, minLengthFieldMessage({ fieldName: 'Product Specification Setting', minLength: 3 })),
        maxLength(100, minLengthFieldMessage({ fieldName: 'Product Specification Setting', minLength: 100 }))
      ),
      'Product Specification Setting is required'
    ),

    partNumber: record(
      string(),
      pipe(
        string('Product Part Number is required'),
        minLength(5, minLengthFieldMessage({ fieldName: 'Product Part Number', minLength: 5 })),
        maxLength(20, minLengthFieldMessage({ fieldName: 'Product Part Number', minLength: 20 })),
        nonEmpty('Product Part Number is required')
      ),
      'Product Part Number is required'
    ),
    specificationSettingNumber: record(
      string(),
      pipe(
        string('Product Specification Setting Number is required'),
        nonEmpty('Product Specification Setting Number is required'),
        minLength(3, minLengthFieldMessage({ fieldName: 'Product Specification Setting Number', minLength: 3 })),
        maxLength(100, minLengthFieldMessage({ fieldName: 'Product Specification Setting Number', minLength: 100 }))
      ),
      'Product Specification Setting Number is required'
    ),

    // modelNumber: union([literal(''), string()]),
    specificationSettingVersionRevision: record(
      string(),
      pipe(
        string('Product Specification Setting Version Reversion is required'),
        nonEmpty('Product Specification Setting Version Reversion is required')
      ),
      'Product Specification Setting Version Reversion is required'
    )
  })
})

interface SpecificationSettingModalProps {
  openAddModal: boolean
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
}

// interface lastIdSpecificationSettingProps {
//   PRODUCT_SPECIFICATION_SETTING_ID: number
//   SPECIFICATION_SETTING_NAME: string
// }

// Types
// // Types
// let lastIdSpecificationSetting: undefined | lastIdSpecificationSettingProps = undefined

interface Props {
  isEnableFetching: boolean
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const SpecificationSettingAddModal = ({
  openAddModal,
  setOpenModalAdd,
  isEnableFetching,
  setIsEnableFetching
}: Props & SpecificationSettingModalProps) => {
  // useState

  // States : Modal
  const [activeList, setActiveList] = useState('1')

  const toggleList = (list: any) => {
    if (activeList !== list) {
      setActiveList(list)
    }
  }

  const [dataRow, setData] = useState([])

  const [confirmModal, setConfirmModal] = useState(false)

  const [isMessageError, setIsMessageError] = useState(false)
  const [open, setOpen] = useState(false)

  // useEffect(() => {
  //   lastIdSpecificationSetting = undefined
  // }, [])

  const handleClickOpen = () => setOpenModalAdd(true)

  const handleClose = () => {
    setOpenModalAdd(false)
  }

  //*-------------- Global value ------------------
  // const { control, handleSubmit, setValue } = reactHookFormMethods
  // Hooks : react-hook-form
  const reactHookFormMethods = useForm<FormData>({
    // const { control, handleSubmit, setValue } = reactHookFormMethods
    // ###VALIBOT####
    // resolver: valibotResolver(schema)
    // defaultValues: {
    //   // @ts-ignore
    //   productMain: null,
    //   process: null,
    // }
    resolver: valibotResolver(schema),
    defaultValues: {
      productSpecificationType: null,
      specificationSettingVersionRevision: null,
      specificationSettingNumber: null,
      partNumber: null,
      modelNumber: null,
      specificationSetting: null,
      productMain: null,
      customerOrderFrom: null
    }
  })

  // const reactHookFormMethodsForCopyPage = useForm<FormData>({
  //   // ###VALIBOT####
  //   // resolver: valibotResolver(schema)
  //   // defaultValues: {
  //   //   // @ts-ignore
  //   //   productMain: null,
  //   //   process: null,
  //   // }
  //   // resolver: valibotResolver(schema),
  //   defaultValues: {
  //     productSpecificationType: null,
  //     specificationSettingVersionRevision: null,
  //     specificationSettingNumber: null,
  //     partNumber: null,
  //     modelNumber: null,
  //     specificationSetting: null,
  //     productMain: null,
  //     customerOrderFrom: null,
  //     status: null
  //   }
  // })

  const { control, handleSubmit, getValues, watch, setValue, reset, unregister, register, trigger } =
    reactHookFormMethods

  // const {
  //   control: controlForCopyPage,
  //   handleSubmit: handleSubmitForCopyPage,
  //   getValues: getValuesForCopyPage,
  //   watch: watchForCopyPage,
  //   setValue: setValueForCopyPage,
  //   reset: resetForCopyPage,
  //   unregister: unregisterForCopyPage,
  //   register: registerForCopyPage,
  //   trigger: triggerForCopyPage
  // } = reactHookFormMethodsForCopyPage

  // useEffect(() => {
  //   console.log('watchhhh', watch())
  // }, [watch()])
  // const { errors } = useFormState({
  //   control
  // })

  const onSubmit: SubmitHandler<FormData> = () => {
    setConfirmModal(true)
  }

  // Functions
  const handleAdd = () => {
    setConfirmModal(false)
    const listData: any = []

    for (let i = 0; i < dataRow?.length; i++) {
      const ele = dataRow[i]?.id

      console.log('CHECK-ie', ele)
      console.log('dataRow', dataRow[i])

      const dataItem = {
        PRODUCT_MAIN_ID: getValues('searchFilters.productMain')?.[ele]?.['PRODUCT_MAIN_ID'] || '',
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME: getValues('searchFilters.specificationSetting')?.[ele],
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER: getValues('searchFilters.specificationSettingNumber')?.[ele],
        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION: getValues(
          'searchFilters.specificationSettingVersionRevision'
        )?.[ele],
        CUSTOMER_ORDER_FROM_ID: getValues('searchFilters.customerOrderFrom')?.[ele]?.['CUSTOMER_ORDER_FROM_ID'] || '',
        PRODUCT_SPECIFICATION_TYPE_ID: getValues('searchFilters.productSpecificationType')?.[ele]?.[
          'PRODUCT_SPECIFICATION_TYPE_ID'
        ],
        PRODUCT_MODEL_NUMBER: getValues('searchFilters.modelNumber')?.[ele] || '',
        PRODUCT_PART_NUMBER: getValues('searchFilters.partNumber')?.[ele],
        CREATE_BY: getUserData()?.EMPLOYEE_CODE,
        UPDATE_BY: getUserData()?.EMPLOYEE_CODE,
        INUSE: 1,
        PRODUCT_TYPE_STATUS_PROGRESS_ID: 1,
        PRODUCT_TYPE_STATUS_WORKING_ID: 2,

        // for Product Type
        PRODUCT_TYPE_NAME: '',
        PRODUCT_TYPE_CODE: '',
        PRODUCT_SUB_ID: ''
      }

      listData.push(dataItem)
    }

    // ** Data Insert
    const dataItem = {
      LIST_DATA: listData
    }

    console.log('insertData', dataItem)
    mutation.mutate(dataItem)
    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
  }

  //console.log(dataRow)

  // console.log('con2')

  // mutation.mutate(dataItem)
  // queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

  //   }
  // }
  useEffect(() => {
    console.log('DataIncom', dataRow)
    // console.log('[getValues]All', getValues())
  }, [dataRow])
  // useEffect(() => {
  //   if (lastIdSpecificationSetting !== undefined) {
  //     setValue('processTimeStudyCode', lastIdSpecificationSetting.SPECIFICATION_SETTING_NAME)
  //   } else if (watch('productMain')) {
  //     setValue('processTimeStudyCode', 'PWS' + '-' + watch('productMain')?.PRODUCT_MAIN_ALPHABET + '-' + 'XXXXX')
  //   } else if (watch('productMain') === null) {
  //     setValue('processTimeStudyCode', '')
  //   }
  // }, [watch('productMain'), lastIdSpecificationSetting])

  const onMutateSuccess = data => {
    if (data.data && data.data.Status == true) {
      const message = {
        message: data.data.Message,
        title: 'Add Product Main'
      }

      setIsEnableFetching(true)
      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      ToastMessageSuccess(message)
      handleClose()

      // ToastMessageError(message)
    } else {
      const message = {
        message: data.data.Message,
        title: 'Add Product Main'
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = e => {
    const message = {
      title: 'Add Product Main',
      message: e.message
    }

    ToastMessageError(message)
  }

  const mutation = useCreateSpecificationSetting(onMutateSuccess, onMutateError)

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const initState: SearchResultTableI = {
    queryPageIndex: 0,
    queryPageSize: 10,
    totalCount: 0,
    querySortBy: [],
    withRowBorders: true,
    withTableBorder: false,
    withColumnBorders: false,
    striped: true
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
        open={openAddModal}
        keepMounted
        sx={{ '&.MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Add Product Specification Document Setting
          </Typography>
          <DialogCloseButton className='mt-4 mr-4 ' onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>

        <DialogContent>
          {/* <FormProvider {...reactHookFormMethodsForCopyPage}> */}
          {/*
          <Grid alignItems='center'>
            <SpecificationSettingCompleteTableForSearch setIsEnableFetching={setIsEnableFetching} />
          </Grid> */}

          <Grid item xs={12}>
            {' '}
            <br />
          </Grid>

          <Grid item xs={12}>
            <Divider textAlign='left'>
              <Typography variant='h5' color='primary'>
                Completed Product Specification Document Setting For Copy
              </Typography>
            </Divider>
          </Grid>
          <FormProvider {...reactHookFormMethods}>
            <Grid item xs={12}>
              <SpecificationSettingCompleteTable
                // setValue={setValueForCopyPage}
                isEnableFetching={isEnableFetching}
                setIsEnableFetching={setIsEnableFetching}
                data={dataRow || []}
                setData={setData}
              />
            </Grid>
            {/* </FormProvider> */}
            <Grid item xs={12}>
              {' '}
              <br />
            </Grid>

            <Grid item xs={12}>
              <Divider textAlign='left'>
                <Typography variant='h5' color='primary'>
                  Add Product Specification Document Setting
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12}>
              <SpecificationSettingDnd
                data={dataRow}
                setData={setData}
                isMessageError={isMessageError}
                setIsMessageError={setIsMessageError}
                open={open}
                setOpen={setOpen}
              />
            </Grid>
          </FormProvider>
        </DialogContent>

        <DialogActions className='mt-4'>
          <Button
            onClick={() => {
              handleSubmit(onSubmit, onError)()

              // setValue('buttonValue', 'save')
            }}
            variant='contained'
          >
            Save & Complete
          </Button>
          <Button onClick={handleClose} variant='tonal' color='secondary'>
            Close
          </Button>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          onConfirmClick={handleAdd}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default SpecificationSettingAddModal

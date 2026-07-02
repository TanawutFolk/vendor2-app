import React, { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'

// MUI Imports
import {
  Breadcrumbs,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Slide,
  SlideProps,
  Typography
} from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'

import { useQueryClient } from '@tanstack/react-query'

import { array, is, nullable, number, object, string } from 'valibot'

//@ts-ignore
import type { Input } from 'valibot'

import { FormProvider, SubmitErrorHandler, useForm } from 'react-hook-form'

import Product from './components/Product'
import Header from './components/Header'
import SctData from './components/SctData'
import FlowProcess from './components/FlowProcess'
import MaterialInProcess from './components/MaterialInProcess'

import ConfirmModal from '@/components/ConfirmModal'

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

import {
  PREFIX_QUERY_KEY,
  useCreateSctForm,
  useUpdateSctForm
} from '@/_workspace/react-query/hooks/useStandardCostForProduct'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { StandardCostFormI } from '@/_workspace/types/sct/StandardCostForProductType'
import { MRT_Row } from 'material-react-table'
import { valibotResolver } from '@hookform/resolvers/valibot'
import StandardCostForProductServices from '@/_workspace/services/sct/StandardCostForProductServices'
import {
  fetchBomDetailsByBomId,
  fetchBomDetailsByBomIdAndProductTypeId
} from '@/_workspace/react-select/async-promise-load-options/fetchBom'
import dayjs from 'dayjs'

import { draftSchema, saveSchema } from './dataValidation'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export type SaveFormData = Input<typeof saveSchema>
export type DraftFormData = Input<typeof draftSchema>

interface Props {
  isOpenModal: boolean
  setIsOpenModal: Dispatch<SetStateAction<boolean>>
  setIsEnableFetching?: Dispatch<SetStateAction<boolean>>
  setOpenModalAdd: Dispatch<SetStateAction<boolean>>
  setIsEnableFetchingMainTable: Dispatch<SetStateAction<boolean>>
  rowSelected?: MRT_Row<StandardCostFormI> | null
  mode: 'add' | 'view' | 'edit'
}

const StandardSingleCreateModal = ({
  isOpenModal,
  setIsOpenModal,
  setIsEnableFetching,
  rowSelected,
  mode,
  setOpenModalAdd,
  setIsEnableFetchingMainTable
}: Props) => {
  const [collapse, setCollapse] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  let selectedSchema = isDraft ? draftSchema : saveSchema

  // react-hook-form
  const reactHookFormMethods = useForm<DraftFormData | SaveFormData>({
    resolver: valibotResolver(selectedSchema),
    shouldFocusError: true,
    defaultValues: async (): Promise<SaveFormData> => {
      try {
        if (mode === 'add') {
          return { mode: mode }
        }

        let sctFormDetails = await StandardCostForProductServices.getSctFormDetail({
          SCT_F_ID: rowSelected?.original.SCT_F_ID
        })

        sctFormDetails = sctFormDetails.data.ResultOnDb

        fetchBomDetailsByBomIdAndProductTypeId(sctFormDetails.BOM_ID, sctFormDetails.PRODUCT_TYPE_ID).then(res => {
          reactHookFormMethods.setValue('FLOW_PROCESS', res.PROCESS)
          reactHookFormMethods.setValue('MATERIAL_IN_PROCESS', res.ITEM)
          reactHookFormMethods.setValue(
            'MATERIAL_IN_PROCESS_ID',
            Object.keys(res.ITEM).map(key => {
              return {
                id: key
              }
            })
          )
        })

        return {
          ...sctFormDetails,
          mode: mode,
          START_DATE: sctFormDetails?.START_DATE ? new Date(sctFormDetails.START_DATE) : null,
          END_DATE: sctFormDetails?.END_DATE ? new Date(sctFormDetails.END_DATE) : null,
          PRODUCT_CATEGORY: null,
          PRODUCT_MAIN: null,
          PRODUCT_SUB: null
        }
      } catch (e) {
        return { mode: mode }
      }
    }
  })

  const queryClient = useQueryClient()

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onDraft = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<DraftFormData | SaveFormData> = data => {
    console.log(data)
  }

  const handleClose = () => {
    setIsOpenModal(false)
  }

  const onMutateSuccess = (data: any) => {
    if (data.data && data.data.Status == true) {
      if (data.data.ResultOnDb.affectedRows === 0) {
        const message = {
          title: 'SCT Form',
          message: 'ข้อมูลที่คุณต้องการบันทึก มีอยู่แล้ว Data already exists'
        }

        ToastMessageError(message)

        return
      }

      const message = {
        message: data.data.Message,
        title: 'SCT Form'
      }

      ToastMessageSuccess(message)

      if (setIsEnableFetching) {
        setIsEnableFetching(true)
        setIsEnableFetchingMainTable(true)
      }

      queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })
      //reset()
      handleClose()

      if (!isDraft) {
        setOpenModalAdd(false)
      }
    } else {
      const message = {
        title: 'SCT Form',
        message: data.data.Message
      }

      ToastMessageError(message)
    }
  }

  const onMutateError = (err: any) => {
    console.log('onMutateError')
    console.log(err)

    const message = {
      title: 'SCT Form',
      message: err.Message
    }

    ToastMessageError(message)
  }

  const createMutation = useCreateSctForm(onMutateSuccess, onMutateError)
  const updateMutation = useUpdateSctForm(onMutateSuccess, onMutateError)

  const handleSaveComplete = () => {
    setConfirmModal(false)

    const dataItem = {
      ...reactHookFormMethods.getValues(),
      SCT_FORMULA_VERSION_ID: 3,
      IS_DRAFT: false,
      SCT_F_CREATE_TYPE_ID: 2,
      SCT_F_CREATE_TYPE_ALPHABET: 'S',
      CREATE_BY: getUserData().EMPLOYEE_CODE
    }

    createMutation.mutate(dataItem)
  }

  const handleDraft = () => {
    setConfirmModal(false)

    const dataItem = {
      ...reactHookFormMethods.getValues(),
      SCT_FORMULA_VERSION_ID: 3,
      IS_DRAFT: true,
      SCT_F_CREATE_TYPE_ID: 2,
      SCT_F_CREATE_TYPE_ALPHABET: 'S',
      CREATE_BY: getUserData().EMPLOYEE_CODE
    }

    createMutation.mutate(dataItem)
  }

  const handleUpdateSaveComplete = () => {
    setConfirmModal(false)

    const dataItem = {
      ...reactHookFormMethods.getValues(),
      SCT_FORMULA_VERSION_ID: 3,
      IS_DRAFT: false,
      SCT_F_CREATE_TYPE_ID: 2,
      SCT_F_CREATE_TYPE_ALPHABET: 'S',
      UPDATE_BY: getUserData().EMPLOYEE_CODE,
      CREATE_BY: getUserData().EMPLOYEE_CODE,
      SCT_F_ID: rowSelected?.original.SCT_F_ID
    }

    updateMutation.mutate(dataItem)
  }

  const handleUpdateDraft = () => {
    setConfirmModal(false)

    const dataItem = {
      ...reactHookFormMethods.getValues(),
      SCT_FORMULA_VERSION_ID: 3,
      IS_DRAFT: true,
      SCT_F_CREATE_TYPE_ID: 2,
      SCT_F_CREATE_TYPE_ALPHABET: 'S',
      UPDATE_BY: getUserData().EMPLOYEE_CODE,
      CREATE_BY: getUserData().EMPLOYEE_CODE,
      SCT_F_ID: rowSelected?.original.SCT_F_ID
    }

    updateMutation.mutate(dataItem)
  }

  // useEffect(() => {
  //   console.log(reactHookFormMethods.watch())
  // }, [reactHookFormMethods.watch()])

  return (
    <Dialog
      //fullScreen
      maxWidth={false}
      // fullWidth={true}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
      TransitionComponent={Transition}
      open={isOpenModal}
      // open={true}
      keepMounted
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
      // PaperProps={{ sx: { top: 30, m: 0 } }}
    >
      <DialogTitle id='max-width-dialog-title'>
        <Typography variant='h5' component='span' color='primary'>
          Standard Cost Form |
        </Typography>
        <Typography variant='h5' component='span'>
          {' '}
          Single Create
          {/* <Button onClick={() => console.log(reactHookFormMethods.getValues())}>Get Values</Button> */}
        </Typography>
        <DialogCloseButton onClick={handleClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent>
        <FormProvider {...reactHookFormMethods}>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={7} lg={7}>
              <Product />
            </Grid>
            <Grid item xs={12} sm={5} lg={5}>
              <Header />
            </Grid>
          </Grid>

          <Grid container spacing={6} className='mt-2'>
            <Grid
              item
              xs={12}
              sm={collapse ? 2 : 4}
              lg={collapse ? 2 : 4}
              className='transition-all duration-200 ease-in-out'
            >
              <FlowProcess setCollapse={setCollapse} collapse={collapse} />
            </Grid>
            <Grid item xs={12} sm={collapse ? 10 : 8} lg={collapse ? 10 : 8}>
              <MaterialInProcess />
            </Grid>
          </Grid>

          <SctData />
        </FormProvider>
      </DialogContent>
      <DialogActions>
        {mode !== 'view' && (
          <>
            {/* <Button
              onMouseEnter={() => setIsDraft(true)}
              onClick={() => {
                return reactHookFormMethods.handleSubmit(onDraft, onError)()
              }}
              variant='contained'
            >
              Save Draft
            </Button> */}
            <Button
              onMouseEnter={() => setIsDraft(false)}
              onClick={() => {
                return reactHookFormMethods.handleSubmit(onSubmit, onError)()
              }}
              variant='contained'
            >
              Save & Complete
            </Button>
          </>
        )}
        <Button onClick={handleClose} variant='tonal' color='secondary'>
          Close
        </Button>
      </DialogActions>
      <ConfirmModal
        show={confirmModal}
        onConfirmClick={
          isDraft
            ? reactHookFormMethods.getValues('mode') === 'add'
              ? handleDraft
              : handleUpdateDraft
            : reactHookFormMethods.getValues('mode') === 'add'
              ? handleSaveComplete
              : handleUpdateSaveComplete
        }
        onCloseClick={() => setConfirmModal(false)}
        isDelete={false}
      />
    </Dialog>
  )
}

export default StandardSingleCreateModal

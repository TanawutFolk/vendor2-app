import React, { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'
import { ProcessInterface } from '../FlowProcessAddModal'
import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import FlowProcessSelectModalTableData from './FlowProcessSelectModalTableData'
import FlowProcessSelectModalSearch from './FlowProcessSelectModalSearch'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useUpdateEffect } from 'react-use'
import { nullable, number, object, string } from 'valibot'
//@ts-ignore
import type { Input } from 'valibot'

const schema = object({
  searchFilters: object({
    PRODUCT_CATEGORY: nullable(
      object({
        PRODUCT_CATEGORY_ID: number(),
        PRODUCT_CATEGORY_NAME: string()
      })
    ),
    PRODUCT_MAIN: nullable(
      object({
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string()
      })
    ),
    FLOW_CODE: nullable(string()),
    FLOW_NAME: nullable(string()),
    INUSE: nullable(
      object({
        value: number(),
        label: string()
      })
    )
  })
})

export type FormData = Input<typeof schema>

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export interface FlowInterface {
  FLOW_CODE: string
  FLOW_ID: number
  FLOW_NAME: string
  FLOW_TYPE_ID: number
  INUSE: number
  INUSE_RAW_DATA: number
  MODIFIED_DATE: string
  No: number
  PRODUCT_MAIN_ALPHABET: string
  PRODUCT_MAIN_ID: number
  PRODUCT_MAIN_NAME: string
  TOTAL_COUNT_PROCESS: number
  UPDATE_BY: string
}

export type FlowProcessSelectModalProps =
  | {
      get: 'process'
      setProcessSelected: Dispatch<SetStateAction<ProcessInterface[]>>
      setFlowSelected?: () => void
      setIsShowFlowProcessModal: Dispatch<SetStateAction<boolean>>
      isShowFlowProcessModal: boolean
      getValues: any
      setValue: any
    }
  | {
      get: 'flow'
      setProcessSelected?: Dispatch<SetStateAction<ProcessInterface[]>>
      setFlowSelected: (flow: FlowInterface) => void
      setIsShowFlowProcessModal: Dispatch<SetStateAction<boolean>>
      isShowFlowProcessModal: boolean
      getValues: any
      setValue: any
    }

const FlowProcessSelectModal = ({
  setProcessSelected,
  setIsShowFlowProcessModal,
  isShowFlowProcessModal,
  getValues,
  get,
  setFlowSelected,
  setValue
}: FlowProcessSelectModalProps) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: async () => {
      const productMain = (await getValues('PRODUCT_MAIN')) ?? null
      // const productCategory = (await getValues('PRODUCT_MAIN')) ?? null

      return {
        searchFilters: {
          PRODUCT_CATEGORY: null,
          PRODUCT_MAIN: productMain,
          FLOW_CODE: '',
          FLOW_NAME: '',
          INUSE: null
        }
      }
    }
  })

  // useEffect(() => {
  // reactHookFormMethods.reset({
  //   searchFilters: {
  //     PRODUCT_CATEGORY: null,
  //     PRODUCT_MAIN: null,
  //     FLOW_CODE: '',
  //     FLOW_NAME: '',
  //     INUSE: null
  //   }
  // })
  // }, [isShowFlowProcessModal])

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  const handleClose = () => {
    setIsShowFlowProcessModal(false)
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
        open={isShowFlowProcessModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Selection Flow Process
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={6}>
            <FormProvider {...reactHookFormMethods}>
              <Grid item xs={12}>
                <FlowProcessSelectModalSearch setIsEnableFetching={setIsEnableFetching} />
              </Grid>
              <Grid item xs={12}>
                {isLoading ? (
                  'Loading'
                ) : (
                  <FlowProcessSelectModalTableData
                    isEnableFetching={isEnableFetching}
                    setIsEnableFetching={setIsEnableFetching}
                    PRODUCT_MAIN={getValues('PRODUCT_MAIN')}
                    setProcessSelected={setProcessSelected}
                    setFlowSelected={setFlowSelected}
                    setIsShowFlowProcessModal={setIsShowFlowProcessModal}
                    get={get}
                    setValue={setValue}
                  />
                )}
              </Grid>
            </FormProvider>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FlowProcessSelectModal

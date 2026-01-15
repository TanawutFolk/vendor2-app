import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import React, { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { useUpdateEffect } from 'react-use'
import { nullable, number, object, string } from 'valibot'
//@ts-ignore
import type { Input } from 'valibot'
import BomSelectModalSearch from './BomSelectModalSearch'
import BomSelectModalTableData from './BomSelectModalTableData'

export interface BomSelectModalProps {
  setBomSelected: (data: any) => void
  setIsShowBomModal: Dispatch<SetStateAction<boolean>>
  isShowBomModal: boolean
  setValue: any
  getValues: any
}

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
    PRODUCTION_PURPOSE: nullable(
      object({
        PRODUCTION_PURPOSE_ID: number(),
        PRODUCTION_PURPOSE_NAME: string()
      })
    ),
    FLOW_PROCESS_CODE: nullable(
      object({
        FLOW_ID: number(),
        FLOW_CODE: string(),
        FLOW_NAME: string(),
        FLOW_TYPE_ID: number(),
        INUSE: number(),
        INUSE_RAW_DATA: number(),
        MODIFIED_DATE: string(),
        No: number(),
        PRODUCT_MAIN_ID: number(),
        PRODUCT_MAIN_NAME: string(),
        TOTAL_COUNT_PROCESS: number(),
        UPDATE_BY: string()
      })
    ),
    BOM_CODE: nullable(string()),
    BOM_NAME: nullable(string()),
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

const BomSelectModal = ({
  setBomSelected,
  setIsShowBomModal,
  isShowBomModal,
  setValue,
  getValues
}: BomSelectModalProps) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: async () => {
      const productMain = (await getValues('PRODUCT_MAIN')) ?? null
      const productCategory = (await getValues('PRODUCT_MAIN')) ?? null

      return {
        searchFilters: {
          PRODUCT_CATEGORY: productCategory,
          PRODUCT_MAIN: productMain,
          PRODUCTION_PURPOSE: null,
          FLOW_PROCESS_CODE: null,
          BOM_CODE: '',
          BOM_NAME: '',
          INUSE: null
        }
      }
    }
  })

  useEffect(() => {
    reactHookFormMethods.reset({
      searchFilters: {
        PRODUCT_CATEGORY: null,
        PRODUCT_MAIN: null,
        PRODUCTION_PURPOSE: null,
        FLOW_PROCESS_CODE: null,
        BOM_CODE: '',
        BOM_NAME: '',
        INUSE: null
      }
    })
  }, [isShowBomModal])

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  const handleClose = () => {
    setIsShowBomModal(false)
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
        open={isShowBomModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Selection Bill of Material
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={6}>
            <FormProvider {...reactHookFormMethods}>
              <Grid item xs={12}>
                <BomSelectModalSearch setIsEnableFetching={setIsEnableFetching} />
              </Grid>
              <Grid item xs={12}>
                {isLoading ? (
                  'Loading'
                ) : (
                  <BomSelectModalTableData
                    isEnableFetching={isEnableFetching}
                    setIsEnableFetching={setIsEnableFetching}
                    setBomSelected={setBomSelected}
                    setIsShowBomModal={setIsShowBomModal}
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

export default BomSelectModal

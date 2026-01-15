import React, { Dispatch, forwardRef, ReactElement, Ref, SetStateAction, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, Grid, Slide, SlideProps, Typography } from '@mui/material'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import ItemSelectModalTableData from './ItemSelectModalTableData'
import ItemSelectModalSearch from './ItemSelectModalSearch'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useUpdateEffect } from 'react-use'
import { nullable, number, object, string } from 'valibot'
//@ts-ignore
import type { Input } from 'valibot'
import { ProcessInterface } from '../BomAddModal'

const schema = object({
  searchFilters: object({
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

interface Props {
  rowIdSelected: string
  setRowIdSelected: Dispatch<SetStateAction<string>>
  isOpenSelectingItemModal: boolean
  setIsOpenSelectingItemModal: Dispatch<SetStateAction<boolean>>
  setValue: any
}

const ItemSelectModal = ({
  rowIdSelected,
  setRowIdSelected,
  isOpenSelectingItemModal,
  setIsOpenSelectingItemModal,
  setValue
}: Props) => {
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      searchFilters: {
        FLOW_CODE: '',
        FLOW_NAME: '',
        INUSE: null
      }
    }
  })

  useEffect(() => {
    reactHookFormMethods.reset({
      searchFilters: {
        // PRODUCT_MAIN: getValues('PRODUCT_MAIN'),
        FLOW_CODE: '',
        FLOW_NAME: '',
        INUSE: null
      }
    })
  }, [isOpenSelectingItemModal])

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  const handleClose = () => {
    setIsOpenSelectingItemModal(false)
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
        open={isOpenSelectingItemModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span'>
            Selection Item
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={6}>
            <FormProvider {...reactHookFormMethods}>
              <Grid item xs={12}>
                <ItemSelectModalSearch setIsEnableFetching={setIsEnableFetching} />
              </Grid>
              <Grid item xs={12}>
                {/* {isLoading ? (
                  'Loading'
                ) : (
                  <ItemSelectModalTableData
                    isEnableFetching={isEnableFetching}
                    setIsEnableFetching={setIsEnableFetching}
                    // PRODUCT_MAIN={getValues('PRODUCT_MAIN')}
                    setProcessSelected={setProcessSelected}
                    setFlowSelected={setFlowSelected}
                    setIsOpenSelectingItemModal={setIsOpenSelectingItemModal}
                    get={get}
                    setValue={setValue}
                  />
                )} */}

                {isLoading ? (
                  'Loading'
                ) : (
                  <ItemSelectModalTableData
                    isEnableFetching={isEnableFetching}
                    setIsEnableFetching={setIsEnableFetching}
                    rowIdSelected={rowIdSelected}
                    setFormValue={setValue}
                    setIsOpenSelectingItemModal={setIsOpenSelectingItemModal}
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

export default ItemSelectModal

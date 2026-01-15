import CircularProgress from '@mui/material/CircularProgress'
import type { ChangeEvent, Dispatch, ReactElement, Ref, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Slide,
  SlideProps,
  Stack,
  Switch,
  Typography
} from '@mui/material'

import type { SubmitErrorHandler } from 'react-hook-form'
import { useFormContext, useFormState } from 'react-hook-form'

import { useQueryClient } from '@tanstack/react-query'

import { useSearchSctExport } from '@/_workspace/react-query/hooks/useStandardCostExportData'

// types Imports
import type { FormData } from '../index'

import ConfirmModal from '@/components/ConfirmModal'

interface Props {
  openPriceListModal: boolean
  setOpenPriceListModal: Dispatch<SetStateAction<boolean>>
  rowSelection: any
  isFetchExportData: boolean
  setIsFetchExportData: Dispatch<SetStateAction<boolean>>
  handleClearAllSelected: () => void
}
//@ts-ignore

import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'

import { useExportToFileForNewApi } from '@/_workspace/react-query/hooks/usePriceListData'
import { fetchSubAssyByLikeSctId } from '@/_workspace/react-select/async-promise-load-options/fetchSctExport'
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// Dialog
const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const getUrlParamSearch = (rowSelection: any): object => {
  const dataItem: any = []

  for (let i = 0; i < Object.keys(rowSelection).length; i++) {
    const element = Object.keys(rowSelection)[i]

    const data = {
      SCT_ID: element
    }
    dataItem.push(data)
  }

  const params = {
    LIST_SCT_ID: dataItem
  }
  return params
}

const PriceListExportModal = ({
  openPriceListModal,
  setOpenPriceListModal,
  rowSelection,
  isFetchExportData: isFetchData,
  setIsFetchExportData,
  handleClearAllSelected
}: Props) => {
  // Hooks : react-hook-form
  const [confirmModal, setConfirmModal] = useState(false)
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger, setError, clearErrors } =
    useFormContext<FormData>()
  const { errors } = useFormState({
    control
  })
  //  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({})

  const [isSubSwitch, setIsSubSwitch] = useState(false)
  const [isLoadingAllSubAssy, setIsLoadingAllSubAssy] = useState([])
  const [checked, setChecked] = useState<boolean>(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
  }
  // Hooks : react-query
  const queryClient = useQueryClient()

  const onSuccessExportData = (data: any) => {
    if (data?.data) {
      // const fileName = `PriceList_${dayjs().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss')}.xlsx`

      const filename = 'Price_List.xlsx'
      const blob = new Blob([data.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      dayjs.extend(utc)
      dayjs.extend(timezone)
      link.download = `PriceList_${dayjs().tz('Asia/Bangkok').format('YYYYMMDD_HHmmss')}.xlsx`

      // setIsShowConfirmModal(false)

      const reader = new FileReader()
      reader.onload = function () {
        let message
        let status

        if (reader?.result[0] === '{') {
          message = JSON.parse(reader?.result).message
          status = JSON.parse(reader?.result).Status
        }

        if (status === false) {
          const Message = {
            title: 'Export File',
            message: message
          }
          setIsSubSwitch(false)
          setIsDisabled && setIsDisabled(false)
          ToastMessageError(Message)
          //  setIsLoading(false)
          //  setProductTypeSelectedList([])
        } else {
          document.body.appendChild(link)

          link.click()

          document.body.removeChild(link)

          const Message = {
            title: 'Export File',
            message: 'Export file successfully.'
          }
          setIsSubSwitch(false)
          setIsDisabled && setIsDisabled(false)
          handleClearAllSelected()
          ToastMessageSuccess(Message)
          handleClose()
        }
      }
      reader.readAsText(blob)
    } else {
      const message = {
        title: 'Export File',
        message: 'Export file failed. Please try again.'
      }
      ToastMessageError(message)
      handleClose()
      setIsSubSwitch(false)
      setIsDisabled && setIsDisabled(false)
    }
  }

  const onErrorExportData = (error: any) => {
    const message = {
      title: 'Export File',
      message: error.message
    }
    ToastMessageError(message)
    handleClose()
    //setIsLoading(false)
  }

  const { mutate: createExportMutation, isPending: isLoadingExportFile } = useExportToFileForNewApi(
    onSuccessExportData,
    onErrorExportData
  )

  const handlePriceListExport = async () => {
    const listData: any = []
    const level = 0

    const dataExport = data?.data?.ResultOnDb || []

    for (let i = 0; i < dataExport.length; i++) {
      const element = dataExport[i]

      const dataItem = {
        SCT_ID: element?.SCT_ID
      }

      setIsSubSwitch(true)
      setIsDisabled(true)

      if (checked) {
        await fetchSubAssyByLikeSctId(dataItem).then(responseJson => {
          if (responseJson?.length > 0) {
            setValue(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`, responseJson)
          } else {
            setValue(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`, '')
          }
        })
      }

      const dataPriceList = {
        SCT_ID: element?.SCT_ID,
        LEVEL: level,
        SCT_COMPARE_ID: element?.SCT_ID_FOR_COMPARE || ''
      }

      listData.push(dataPriceList)

      if (checked) {
        if (watch(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`)?.length > 0) {
          for (let i = 0; i < watch(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`)?.length; i++) {
            const eleSubAssy = watch(`SUB_SWITCH.SUB_ASSY:${element?.SCT_ID}`)[i]

            const dataItem = {
              SCT_ID: eleSubAssy?.SCT_ID,
              LEVEL: eleSubAssy?.LEVEL,
              SCT_COMPARE_ID: eleSubAssy?.SCT_ID_FOR_COMPARE || ''
            }
            listData.push(dataItem)
          }
        }
      }
    }

    const dataItem = {
      LIST_SCT_ID: listData
    }

    createExportMutation(dataItem)
  }

  const onSubmit = () => {
    setConfirmModal(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  const { data } = useSearchSctExport(getUrlParamSearch(rowSelection), isFetchData)

  const handleClose = () => {
    clearErrors()
    setOpenPriceListModal(false)
    setIsFetchExportData(false)
  }

  return (
    <>
      <Dialog
        maxWidth='sm'
        fullWidth={true}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
        TransitionComponent={Transition}
        open={openPriceListModal}
        keepMounted
        sx={{
          '& .MuiDialog-paper': { overflow: 'visible' },
          '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
        }}
        PaperProps={{ sx: { top: 30, m: 0 } }}
      >
        <DialogTitle id='max-width-dialog-title'>
          <Typography variant='h5' component='span' color='primary'>
            Standard Cost |
          </Typography>
          <Typography variant='h5' component='span'>
            {' '}
            Export Price List
          </Typography>
          <DialogCloseButton onClick={handleClose} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <Grid item xs={12}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Grid container spacing={2} alignItems='center'>
                  <FormControlLabel
                    label={
                      <Typography className='mt-1 ml-1' sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                        NEED ALL SUB-ASSEMBLY
                      </Typography>
                    }
                    control={
                      <Switch
                        disabled={isDisabled || isLoadingExportFile || isSubSwitch}
                        checked={checked}
                        onChange={handleChange}
                      />
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Stack direction='row' spacing={2}>
            <Button
              disabled={isLoadingExportFile || isSubSwitch || isDisabled}
              onClick={() => handleSubmit(handlePriceListExport, onError)()}
              variant='contained'
            >
              {isLoadingExportFile || isSubSwitch || isDisabled ? (
                <>
                  <CircularProgress sx={{ mr: 2, color: '#fff' }} size={20} />
                  <span className='ms-50'>Loading ...</span>
                </>
              ) : (
                <>Export </>
              )}
            </Button>
            <Button onClick={handleClose} variant='tonal' color='secondary'>
              Close
            </Button>
          </Stack>
        </DialogActions>
        <ConfirmModal
          show={confirmModal}
          //onConfirmClick={isDraft ? handleDraft : handleSaveComplete}
          onCloseClick={() => setConfirmModal(false)}
          isDelete={false}
        />
      </Dialog>
    </>
  )
}

export default PriceListExportModal

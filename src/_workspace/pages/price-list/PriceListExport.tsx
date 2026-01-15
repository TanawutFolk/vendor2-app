// React Imports
import { Dispatch, SetStateAction, useState } from 'react'
import FileDownloadSharpIcon from '@mui/icons-material/FileDownloadSharp'

// MUI Imports
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Grid,
  IconButton,
  Select,
  Skeleton
} from '@mui/material'

// Third-party Imports
import classNames from 'classnames'

// Components Imports

// react-hook-from Imports
import { Controller, Form, FormProvider, useForm, useFormContext, useFormState } from 'react-hook-form'

import ProductForm from './ProductForm'
import FiscalYearForm from './modal/FiscalYearForm'
import OptionForm from './modal/OptionForm'
import SelectColumnForm from './modal/SelectColumnForm'
import ExportForm from './modal/ExportForm'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import PriceListConfirmModal from './PriceListModel'
import { useExportToFile, useExportToFileForNew } from '@/_workspace/react-query/hooks/usePriceListData'
import { array, boolean, nullable, number, object, optional, record, string, type InferInput } from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

type ProductType = {
  PRODUCT_TYPE_ID: number
  PRODUCT_TYPE_NAME: string
}

export type FormData = InferInput<typeof schema>

const schema = object({
  fiscalYear: object({
    year: array(
      object({
        value: number(),
        label: number(),
        FISCAL_YEAR_ID: number(),
        FISCAL_YEAR_NAME: number()
      }),
      'Fiscal year is required'
    )
  })
})

function PriceListExport() {
  // States
  const [isShowConfirmModal, setIsShowConfirmModal] = useState(false)
  const [collapse, setCollapse] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  //
  const [productTypeList, setProductTypeList] = useState([])
  const [productTypeSelectedList, setProductTypeSelectedList] = useState([])
  const [group, setGroup] = useState<ProductType[]>([])

  const {
    control,
    watch,
    getValues,
    setValue,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      option: {
        priceListOption: 'FG',
        revision: 'newestRevision'
      },
      selectColumn: {
        sctCode: true,
        sctRevisionCode: true,
        sctStatus: true,
        itemCategory: true,
        sellingPrice_Bath: true,
        productGroup: {
          productType: true
        }
      },
      export: 'excel'
    }
  })

  const onSubmit = () => {
    setIsShowConfirmModal(true)
    // console.log('....')
  }

  const onSuccessExportData = data => {
    if (data?.data) {
      var filename = 'Price_List.xlsx'
      var blob = new Blob([data.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      var link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = filename

      setIsShowConfirmModal(false)

      var reader = new FileReader()
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
          ToastMessageError(Message)
          setIsLoading(false)
          setProductTypeSelectedList([])
        } else {
          document.body.appendChild(link)

          link.click()

          document.body.removeChild(link)

          const Message = {
            title: 'Export File',
            message: 'Export file successfully.'
          }
          ToastMessageSuccess(Message)
          setIsLoading(false)
          setProductTypeSelectedList([])
        }
      }
      reader.readAsText(blob)
    } else {
      const message = {
        title: 'Export File',
        message: 'Export file failed. Please try again.'
      }
      ToastMessageError(message)
      setIsLoading(false)
      setProductTypeSelectedList([])
    }
  }

  const onErrorExportData = error => {
    const message = {
      title: 'Export File',
      message: error.message
    }
    ToastMessageError(message)
    setIsLoading(false)
  }

  const { mutate } = useExportToFileForNew(onSuccessExportData, onErrorExportData)

  const handleExportToFile = () => {
    setIsLoading(true)
    const values = getValues()

    mutate(values)
  }

  return (
    <>
      <Card title='Price List' style={{ overflow: 'visible', zIndex: 4 }}>
        <CardHeader
          title='Export Price List'
          action={
            <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
              <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
            </IconButton>
          }
          avatar={<i className='text-xl' />}
          titleTypographyProps={{ variant: 'h5' }}
          sx={{ '& .MuiCardHeader-avatar': { mr: 0 } }}
        />
        <Collapse in={!collapse}>
          <CardContent>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <ProductForm
                control={control}
                watch={watch}
                getValues={getValues}
                setValue={setValue}
                errors={errors}
                setProductTypeList={setProductTypeList}
                productTypeList={productTypeList}
                setProductTypeSelectedList={setProductTypeSelectedList}
                productTypeSelectedList={productTypeSelectedList}
                setGroup={setGroup}
                group={group}
              />

              <Grid item xs={12}>
                {' '}
                <br />
              </Grid>

              <FiscalYearForm control={control} setValue={setValue} errors={errors} />

              <OptionForm control={control} setValue={setValue} errors={errors} />
              <SelectColumnForm control={control} setValue={setValue} errors={errors} watch={watch} />
              <ExportForm control={control} setValue={setValue} errors={errors} watch={watch} />

              <Grid mb={1} mt={2} ml={160}>
                <Button
                  style={{
                    width: '150px',
                    margin: 'auto',
                    fontSize: 'large',
                    border: '2px solid ',
                    borderRadius: '8px'
                  }}
                  type='submit'
                >
                  <FileDownloadSharpIcon />
                  <span className='align-middle ms-25'>Export</span>
                </Button>
              </Grid>
            </Form>
          </CardContent>
        </Collapse>
      </Card>
      <PriceListConfirmModal
        isLoading={isLoading}
        show={isShowConfirmModal}
        onConfirmClick={handleExportToFile}
        onCloseClick={() => setIsShowConfirmModal(false)}
        isDelete={false}
        setProductTypeSelectedList={setProductTypeSelectedList}
      />
    </>
  )
}

export default PriceListExport

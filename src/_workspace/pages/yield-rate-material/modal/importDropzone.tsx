// React Imports
import { useState } from 'react'
import { read, utils } from 'xlsx'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'

// Third-party Imports
import { useDropzone } from 'react-dropzone'
// utils Imports
import { getUserData } from '@utils/user-profile/userLoginProfile'
// Component Imports
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import { toast } from 'react-toastify'
import { ToastMessageError } from '@/components/ToastMessage'
import { set, useFormContext } from 'react-hook-form'

type FileProp = {
  name: string
  type: string
  size: number
}

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

const ImportDropzone = () => {
  // States
  const [files, setFiles] = useState<File[]>([])
  const [jsonArray, setJsonArray] = useState([])
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()
  const { getRootProps, getInputProps } = useDropzone({
    // maxFiles: 2,
    multiple: false,
    onDrop: acceptedFiles => {
      const reader = new FileReader()
      reader.onload = function () {
        // setJsonArray([])
        const fileData = reader.result
        const wb = read(fileData, { type: 'binary' })

        let sheetName = wb.SheetNames[0]

        let ws = wb.Sheets[sheetName]
        let range = utils.decode_range(ws['!ref'])

        // * Column range vary by data column file
        let rangeSheet = 'A1:I1' + (range.e.r + 1).toString()
        let new_range = utils.decode_range(rangeSheet)
        let jsonSheets = utils.encode_range(new_range)

        const jsonData: any = {
          content: JSON.parse(
            JSON.stringify(
              utils.sheet_to_json(wb.Sheets[sheetName], {
                defval: null,
                range: jsonSheets
              })
            )
          )
          // fileVersion: ws.A1.v
        }
        setValue('fileData', jsonData)
        // setJsonArray(jsonData)

        // wb.SheetNames.forEach(function (sheetName) {
        //   let ws = wb.Sheets[sheetName]
        //   let range = utils.decode_range(ws['!ref'])

        //   // * Column range vary by data column file
        //   let rangeSheet = 'A1:G1' + (range.e.r + 1).toString()
        //   let new_range = utils.decode_range(rangeSheet)
        //   let jsonSheets = utils.encode_range(new_range)

        //   const jsonData: any = {
        //     content: JSON.parse(
        //       JSON.stringify(
        //         utils.sheet_to_json(wb.Sheets[sheetName], {
        //           defval: null,
        //           range: jsonSheets
        //         })
        //       )
        //     )
        //     // fileVersion: ws.A1.v
        //   }
        //   setValue('fileData', jsonData)
        //   // setJsonArray(jsonData)
        // })

        let checkError = []

        // console.log(watch('fileData')['content']?.length)

        for (let i = 0; i < watch('fileData')['content']?.length; i++) {
          const element = watch('fileData')['content'][i]

          if (
            element?.['ITEM_CODE'] == null &&
            element?.['PRODUCT_TYPE_CODE'] == null &&
            element?.['YIELD_RATE_MATERIAL'] == null
          ) {
            return
          } else if (
            element?.['ITEM_CODE'] == null ||
            element?.['PRODUCT_TYPE_CODE'] == null ||
            element?.['YIELD_RATE_MATERIAL'] == null
          ) {
            checkError.push(element)
          }

          if (checkError.length > 0) {
            const message = {
              title: 'Import Yield rate',
              message: 'Please fill data in the required fields',
              type: 'error'
            }
            ToastMessageError(message)
            setValue('fileData', null)
            setFiles([])
            return
          }
        }
      }

      if (acceptedFiles.length && acceptedFiles[0].name.endsWith('xlsx')) {
        if (acceptedFiles[0].name.startsWith('YR-MATERIAL')) {
          reader.readAsBinaryString(acceptedFiles[0])
          setFiles(acceptedFiles.map(file => Object.assign(file)))
        } else {
          toast.error(() => <p className='mb-0'>File Name is not valid!.</p>, {
            style: {
              minWidth: '380px'
            }
          })
          setFiles([])
        }
      } else {
        toast.error(() => <p className='mb-0'>You can only upload .xlsx format Files!.</p>, {
          style: {
            minWidth: '380px'
          }
        })
        setFiles([])
      }
    }
  })

  const renderFilePreview = (file: FileProp) => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />
    } else {
      return <i className='tabler-file-excel' style={{ color: '#07851c9f', fontSize: 30 }} />
    }
  }

  const handleRemoveFile = (file: FileProp) => {
    const uploadedFiles = files
    const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name)

    setFiles([...filtered])
    setValue('fileData', null)
  }

  const fileList = files.map((file: FileProp) => (
    <ListItem key={file.name} className='pis-4 plb-3'>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name font-medium' color='text.primary'>
            {file.name}
          </Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <i style={{ color: 'red' }} className='tabler-x text-xl' />
      </IconButton>
    </ListItem>
  ))

  // const handleRemoveAllFiles = () => {
  //   setFiles([])
  // }

  // const handleImportItem = () => {
  //   let dataItem = []
  //   let checkError = []

  //   for (let i = 0; i < jsonArray['content']?.length; i++) {
  //     const element = jsonArray['content'][i]

  //     if (
  //       element?.['YIELD_RATE'] == null ||
  //       element?.['GO_STRAIGHT_RATE'] == null ||
  //       element?.['COLLECTION_POINT'] == null
  //     ) {
  //       checkError.push(element)
  //     }

  //     if (checkError.length > 0) {
  //       const message = {
  //         title: 'Import Item Price',
  //         message: 'Please fill data in the required fields',
  //         type: 'error'
  //       }
  //       ToastMessageError(message)
  //       return
  //     }

  //     let data = {
  //       // * Add usage Key:Value from excel data : element[column]
  //       MCODE: element['MCODE'],
  //       PURCHASE_UNIT_RATIO: element[' PURCHASE_UNIT_QTY '],
  //       PURCHASE_UNIT: element['PURCHASE_UNIT'],
  //       USAGE_UNIT_RATIO: element[' CONVERT_RATIO '],
  //       USAGE_UNIT: element['USAGE_UNIT'],
  //       PURCHASE_PRICE_UNIT: element[' PURCHASE_UNIT_PRICE '],
  //       CURRENCY: element['CURRENCY'],
  //       ESTIMATE_PRICE_PER_USAGE_UNIT: Number(element[' USAGE_UNIT_PRICE ']),
  //       CREATE_BY: getUserData()?.EMPLOYEE_CODE
  //     }
  //     dataItem.push(data)
  //   }

  //   // const dataArrayListItem = {
  //   //   LIST_ITEM_IMPORT: dataItem,
  //   //   FILE_VERSION: jsonArray['fileVersion'],
  //   //   CREATE_BY: getUserName()
  //   // }
  //   // // ** Check row data in excel Files
  //   // if (dataItem.length > 0) {
  //   //   createImportItemPrice(dataArrayListItem)
  //   // } else {
  //   //   const message = {
  //   //     title: 'Import Item Price',
  //   //     message: 'No data available in file.'
  //   //   }
  //   //   ToastMessageError(message)
  //   //   setFiles([])
  //   //   // setIsShowModel(false);
  //   // }
  // }

  return (
    <Dropzone>
      <Card>
        <CardHeader title='YR-MATERIAL' sx={{ '& .MuiCardHeader-action': { alignSelf: 'center' } }} />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='tabler-upload' />
              </CustomAvatar>
              <Typography variant='h4'>Drop file here or Click to upload.</Typography>
            </div>
          </div>
          {files.length ? (
            <>
              <List>{fileList}</List>
              {/* <div className='buttons'>
                <Button color='error' variant='tonal' onClick={handleRemoveAllFiles}>
                  Remove
                </Button>
                <Button variant='contained' onClick={handleImportItem}>
                  Upload Files
                </Button>
              </div> */}
            </>
          ) : null}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ImportDropzone

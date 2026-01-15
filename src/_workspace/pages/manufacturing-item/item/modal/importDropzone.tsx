// React Imports
import { Dispatch, SetStateAction, useState } from 'react'
import { read, utils } from 'xlsx'
// MUI Imports
import type { BoxProps } from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

// Third-party Imports
import { useDropzone } from 'react-dropzone'
// utils Imports
// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import { ToastMessageError } from '@/components/ToastMessage'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import { useFormContext } from 'react-hook-form'
import { Props } from 'react-select'
import { toast } from 'react-toastify'

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

interface Props {
  isShowImportDataError: boolean
  setIsShowImportDataError: Dispatch<SetStateAction<boolean>>
  isCheckImportFile: boolean
  setIsCheckImportFile: Dispatch<SetStateAction<boolean>>
  setDataError: Dispatch<SetStateAction<any[]>>
}

const ImportPriceDropzone = ({
  isShowImportDataError,
  setIsShowImportDataError,
  isCheckImportFile,
  setIsCheckImportFile,
  setDataError
}: Props) => {
  // States
  const [files, setFiles] = useState<File[]>([])
  const [jsonArray, setJsonArray] = useState([])
  const { control, handleSubmit, getValues, watch, reset, setValue, unregister, trigger } = useFormContext<FormData>()
  const { getRootProps, getInputProps } = useDropzone({
    // maxFiles: 2,
    multiple: false,

    onDrop: acceptedFiles => {
      try {
        setIsCheckImportFile(true)
        // setValue('fileData', null)
        // setFiles([])
        setDataError([])
        const reader = new FileReader()
        reader.onload = function () {
          // setJsonArray([])
          const fileData = reader.result
          const wb = read(fileData, { type: 'binary' })

          wb.SheetNames.forEach(function (sheetName) {
            const ws = wb.Sheets[sheetName]
            const range = utils.decode_range(ws['!ref'])

            // * Column range vary by data column file
            const rangeSheet = 'A2:X2' + (range.e.r + 1).toString()
            const new_range = utils.decode_range(rangeSheet)
            const jsonSheets = utils.encode_range(new_range)

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
          })

          const checkError = []

          for (let i = 0; i < watch('fileData')['content']?.length; i++) {
            const element = watch('fileData')['content'][i]
            if (
              element?.['ITEM CATEGORY NAME'] == null ||
              element?.['ITEM CODE'] == null ||
              element?.['ITEM PURPOSE NAME'] == null ||
              element?.['ITEM GROUP NAME'] == null ||
              element?.['VENDOR NAME'] == null ||
              element?.['MAKER NAME'] == null ||
              element?.['ITEM INTERNAL FULL NAME'] == null ||
              element?.['ITEM INTERNAL SHORT NAME'] == null ||
              element?.['ITEM EXTERNAL CODE (P/N)'] == null ||
              element?.['ITEM EXTERNAL FULL NAME'] == null ||
              element?.['ITEM EXTERNAL SHORT NAME'] == null ||
              element?.['PURCHASE UNIT RATIO'] == null ||
              element?.['PURCHASE UNIT CODE'] == null ||
              element?.['USAGE UNIT RATIO'] == null ||
              element?.['USAGE UNIT CODE'] == null
            ) {
              checkError.push(element)
            }
            if (checkError.length > 0) {
              setIsShowImportDataError(false)
              const message = {
                title: 'Import Item Price',
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
          if (
            acceptedFiles[0].name.startsWith('ManufacturingItem_') &&
            acceptedFiles[0].name.endsWith('_Template.xlsx')
          ) {
            reader.readAsBinaryString(acceptedFiles[0])
            setFiles(acceptedFiles.map(file => Object.assign(file)))
          } else {
            toast.error(
              () => (
                <p className='mb-0'>
                  File Name is not valid!. Start with 'ManufacturingItem_' and End with '_Template'.
                </p>
              ),
              {
                style: {
                  minWidth: '380px'
                }
              }
            )
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
      } finally {
        setIsCheckImportFile(false)
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
    setIsShowImportDataError(false)
    setFiles([...filtered])
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

  return (
    <Dropzone>
      <Card>
        <CardContent>
          <div {...getRootProps({ className: 'dropzone border-2 border-dashed border-primary border-dashed' })}>
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
            </>
          ) : null}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

export default ImportPriceDropzone

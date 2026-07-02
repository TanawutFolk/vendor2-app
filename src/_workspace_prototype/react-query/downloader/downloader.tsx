import React, { useEffect, useState } from 'react'
import '../downloader/downloader.css'
import LinearProgress from '@mui/material/LinearProgress'
import { Icon } from '@iconify/react'
import Axios from 'axios'
import { useEffectOnce, useUpdateEffect } from 'react-use'

interface File {
  name: string
  file: string
  filename: string
  params: any
  downloadId: string
}

interface DownloaderProps {
  files: File[]
  remove: (id: string) => void
}

interface DownloadInfo {
  progress: number
  completed: boolean
  total: number
  loaded: number
}

const Downloader: React.FC<DownloaderProps> = ({ files = [], remove }) => {
  return (
    <div className='downloader'>
      <div className='card'>
        <div className='card-header'>File Downloader</div>
        <ul className='list-group list-group-flush'>
          {files.map((file, idx) => (
            <DownloadItem key={idx} removeFile={() => remove(file.downloadId)} {...file} />
          ))}
        </ul>
      </div>
    </div>
  )
}

const DownloadItem: React.FC<File & { removeFile: () => void }> = ({ name, file, filename, params, removeFile }) => {
  const [downloadInfo, setDownloadInfo] = useState<DownloadInfo>({
    progress: 0,
    completed: false,
    total: 0,
    loaded: 0
  })

  useEffect(() => {
    const options = {
      onDownloadProgress: (progressEvent: ProgressEvent) => {
        const { loaded, total } = progressEvent
        setDownloadInfo({
          progress: Math.floor((loaded * 100) / total),
          loaded,
          total,
          completed: false
        })
      }
    }

    Axios.get(file, {
      params: { data: params },
      responseType: 'blob',
      ...options
    }).then(response => {
      const url = URL.createObjectURL(
        new Blob([response.data], {
          type: response.headers['content-type']
        })
      )

      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()

      setDownloadInfo(info => ({
        ...info,
        completed: true
      }))

      link.remove()

      setTimeout(() => {
        removeFile()
      }, 4000)
    })
  }, [file, filename, params, removeFile])

  const formatBytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`

  return (
    <li className='list-group-item' style={{ zIndex: '100000' }}>
      <div className='row'>
        <div className='col-12 d-flex justify-content-between'>
          <div className='d-inline font-weight-bold text-truncate'>{name}</div>
          <div className='d-inline ml-2'>
            <small>
              {/* {downloadInfo.loaded > 0 && (
                <>
                  <span className='text-success'>{formatBytes(downloadInfo.loaded)}</span>/
                  {formatBytes(downloadInfo.total)}
                </>
              )} */}

              {downloadInfo.loaded === 0 && <>Initializing...</>}
            </small>
          </div>
          <div className='d-inline ml-2 ml-auto'>
            {downloadInfo.completed && (
              <span className='text-success'>
                Completed <Icon icon='fluent-mdl2:completed-solid' color='#34C38F' style={{ fontSize: '18px' }} />
              </span>
            )}
          </div>
        </div>
        <div className='col-12 mt-2'>
          <LinearProgress variant='determinate' value={downloadInfo.progress} />
          <div className='progress-label'>{`${downloadInfo.progress}%`}</div>
        </div>
      </div>
    </li>
  )
}

export default Downloader

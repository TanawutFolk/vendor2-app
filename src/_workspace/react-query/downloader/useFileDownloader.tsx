import Downloader from './downloader.tsx'
import React, { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

interface File {
  name: string
  file: string
  filename: string
  params: any
}

const useFileDownloader = (): [(file: File) => void, JSX.Element | null] => {
  const [files, setFiles] = useState<File & { downloadId: string }[]>([])

  const download = (file: File) => {
    setFiles(fileList => {
      return [...fileList, { ...file, downloadId: uuid() }]
    })
  }

  const remove = (removeId: string) => {
    setFiles(files => files.filter(file => file.downloadId !== removeId))
  }

  return [
    (file: File) => download(file),
    files.length > 0 ? <Downloader files={files} remove={(id: string) => remove(id)} /> : null
  ]
}

export default useFileDownloader

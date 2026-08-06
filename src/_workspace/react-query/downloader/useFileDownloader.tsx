import Downloader from './downloader'
import { useState } from 'react'

interface File {
  name: string
  file: string
  filename: string
  params: any
}

const useFileDownloader = (): [(file: File) => void, JSX.Element | null] => {
  const [files, setFiles] = useState<Array<File & { downloadId: string }>>([])

  const download = (file: File) => {
    setFiles(fileList => {
      return [...fileList, { ...file, downloadId: crypto.randomUUID() }]
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

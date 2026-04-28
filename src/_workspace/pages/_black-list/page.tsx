import Grid from '@mui/material/Grid'
import { AxiosError } from 'axios'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'
import { MENU_NAME, breadcrumbNavigation } from './env'
import type { UploadBlacklistPayload } from './types'
import BlacklistServices from '@_workspace/services/_black-list/BlacklistServices'
import type { BlacklistFormData } from './validateSchema'
import { BlacklistSchema, defaultBlacklistValues } from './validateSchema'

function Page() {
    return (
        <DxProvider>
            <InnerApp />
        </DxProvider>
    )
}

const InnerApp = () => {
    const user = getUserData()
    const { setIsEnableFetching } = useDxContext()
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const reactHookFormMethods = useForm<BlacklistFormData>({
        resolver: zodResolver(BlacklistSchema),
        defaultValues: defaultBlacklistValues,
    })

    useEffect(() => {
        setIsEnableFetching(true)
    }, [setIsEnableFetching])

    const handleUpload = async (payload: UploadBlacklistPayload) => {
        const formData = new FormData()
        formData.append('file', payload.file)
        formData.append('CREATE_BY', String(user?.EMPLOYEE_CODE || 'SYSTEM'))
        formData.append('UPDATE_BY', String(user?.EMPLOYEE_CODE || 'SYSTEM'))

        const importFn = payload.format === 'US'
            ? BlacklistServices.importFileUS
            : BlacklistServices.importFileCN

        setUploading(true)
        setUploadProgress(0)
        try {
            const response = await importFn(formData, (progressEvent) => {
                const total = Number(progressEvent.total || 0)

                if (!total) {
                    return
                }

                const nextProgress = Math.min(100, Math.round((progressEvent.loaded * 100) / total))
                setUploadProgress(nextProgress)
            })

            if (!response.data?.Status) {
                throw new Error(response.data?.Message || 'Blacklist update failed')
            }

            setUploadProgress(100)
            setIsEnableFetching(true)
            ToastMessageSuccess({
                title: 'Blacklist',
                message: response.data?.Message || 'Blacklist updated successfully',
            })
        } catch (error: unknown) {
            const errorMessage = error instanceof AxiosError
                ? (error.response?.data as { Message?: string } | undefined)?.Message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Blacklist update failed'

            ToastMessageError({
                title: 'Blacklist',
                message: errorMessage,
            })
        } finally {
            setUploading(false)
            setTimeout(() => setUploadProgress(0), 200)
        }
    }

    return (
        <Grid container spacing={6}>
            <FormProvider {...reactHookFormMethods}>
                <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                    <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
                </Grid>

                <Grid item xs={12}>
                    <SearchFilter />
                </Grid>

                <Grid item xs={12}>
                    <SearchResult
                        uploading={uploading}
                        uploadProgress={uploadProgress}
                        onUpload={handleUpload}
                    />
                </Grid>
            </FormProvider>
        </Grid>
    )
}

export default Page

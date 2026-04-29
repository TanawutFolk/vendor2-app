import Grid from '@mui/material/Grid'
import type { AxiosProgressEvent } from 'axios'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import { DxProvider, useDxContext } from '@/_template/DxContextProvider'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useUploadBlacklist } from '@_workspace/react-query/hooks/vendor/useBlacklistHooks'
import SearchFilter from './SearchFilter'
import SearchResult from './SearchResult'
import { MENU_NAME, breadcrumbNavigation } from './env'
import type { UploadBlacklistPayload } from './types'
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
    const { setIsEnableFetching } = useDxContext()
    const [uploadProgress, setUploadProgress] = useState(0)

    const reactHookFormMethods = useForm<BlacklistFormData>({
        resolver: zodResolver(BlacklistSchema),
        defaultValues: defaultBlacklistValues,
    })

    useEffect(() => {
        setIsEnableFetching(true)
    }, [setIsEnableFetching])

    const uploadMutation = useUploadBlacklist(() => {
        setUploadProgress(100)
        setIsEnableFetching(true)
        setTimeout(() => setUploadProgress(0), 200)
    })

    const handleUpload = (payload: UploadBlacklistPayload) => {
        const user = getUserData()
        const formData = new FormData()
        const dataItem = {
            CREATE_BY: String(user?.EMPLOYEE_CODE || 'SYSTEM'),
            UPDATE_BY: String(user?.EMPLOYEE_CODE || 'SYSTEM'),
        }

        formData.append('file', payload.file)
        formData.append('dataItem', JSON.stringify(dataItem))

        setUploadProgress(0)
        uploadMutation.mutate({
            payload: {
                format: payload.format,
                formData,
            },
            onProgress: (progressEvent: AxiosProgressEvent) => {
                const total = Number(progressEvent.total || 0)
                if (!total) return
                const nextProgress = Math.min(100, Math.round((progressEvent.loaded * 100) / total))
                setUploadProgress(nextProgress)
            }
        }, {
            onError: () => {
                setTimeout(() => setUploadProgress(0), 200)
            }
        })
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
                        uploading={uploadMutation.isPending}
                        uploadProgress={uploadProgress}
                        onUpload={handleUpload}
                    />
                </Grid>
            </FormProvider>
        </Grid>
    )
}

export default Page

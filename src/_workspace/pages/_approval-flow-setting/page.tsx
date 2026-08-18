import Grid from '@mui/material/Grid'
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import SkeletonCustom from '@components/SkeletonCustom'
import { DxProvider } from '@/_template/DxContextProvider'
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

import ApprovalFlowEditor from './ApprovalFlowEditor'
import { breadcrumbNavigation, MENU_NAME } from './env'
import type { FormDataPage } from './validationSchema'
import { fetchDefaultValues, validationSchemaPage } from './validationSchema'

function Page() {
  return (
    <DxProvider>
      <InnerApp />
    </DxProvider>
  )
}

const InnerApp = () => {
  const reactHookFormMethods = useForm<FormDataPage>({
    resolver: zodResolver(validationSchemaPage),
    defaultValues: fetchDefaultValues
  })
  const { control } = reactHookFormMethods
  const { isLoading } = useFormState({ control })

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? <SkeletonCustom /> : <ApprovalFlowEditor />}
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default Page

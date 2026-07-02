// MUI Imports

import { Grid } from '@mui/material'

// Third-party Imports
import { FormProvider, useForm, useFormState } from 'react-hook-form'
import { number, object } from 'valibot'

import type { Input } from 'valibot'

// Components Imports
import { valibotResolver } from '@hookform/resolvers/valibot'

import { breadcrumbNavigation, MENU_NAME } from './env'

import { useState } from 'react'
import { useUpdateEffect } from 'react-use'

import { requiredFieldMessage, typeFieldMessage } from '@/libs/valibot/error-message/errorMessage'

import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import ManufacturingItemPricePage from './ManufacturingItemPricePage'

export type FormData = Input<typeof schema>

const schema = object({
  searchFilters: object({
    FISCAL_YEAR: object(
      {
        value: number(typeFieldMessage({ fieldName: 'Fiscal Year', typeName: 'Number' })),
        label: number(typeFieldMessage({ fieldName: 'Fiscal Year', typeName: 'Number' }))
      },
      requiredFieldMessage({ fieldName: 'Fiscal Year' })
    )
  })
})

function Page() {
  // react-hook-form
  // AxiosResponseInterface
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema)
  })

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
        </Grid>
        <Grid item xs={12}>
          <ManufacturingItemPricePage setIsEnableFetching={setIsEnableFetching} />
        </Grid>
      </FormProvider>
    </Grid>
  )
}

export default Page

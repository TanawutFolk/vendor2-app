import os
import re

base_dir = r"c:\Users\tanawut.pat\Desktop\VEN-Dev\vendor2-app\src\_workspace\pages"
dirs = ["_check-document", "_md-approval", "_poGm-approval", "_poMgr-approval"]

search_filter_content = """// MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'

// React Hook Form Imports
import { Controller, useFormContext, useFormState } from 'react-hook-form'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'

// React Query Imports
import { useQueryClient } from '@tanstack/react-query'

import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import useRequestStatusOptions from '@_workspace/react-query/useRequestStatusOptions'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@components/react-select/SelectCustom'
import SkeletonCustom from '@components/SkeletonCustom'

// Utils Imports
import { getUserData } from '@/utils/user-profile/userLoginProfile'

// Context
import { useDxContext } from '@/_template/DxContextProvider'

// Types & Schema
import type { RequestRegisterFormData } from './validataeSchema'
import { defaultSearchFilters } from './validataeSchema'
import { MENU_ID } from './env'

const SearchFilter = () => {
  // Context
  const { setIsEnableFetching } = useDxContext()

  // React Hook Form
  const { setValue, getValues, control, handleSubmit } = useFormContext<RequestRegisterFormData>()
  const { isLoading } = useFormState()

  // Status options from DB
  const { data: statusOptions = [] } = useRequestStatusOptions()

  const onHandleClearSearchFilters = () => {
    setValue('searchFilters', defaultSearchFilters)

    setIsEnableFetching(true)
    handleAdd()
  }

  const onSubmit: SubmitHandler<RequestRegisterFormData> = () => {
    setIsEnableFetching(true)
    handleAdd()
  }

  const onError: SubmitErrorHandler<RequestRegisterFormData> = data => {
    console.log(getValues())
    console.log(data)
  }

  const handleAdd = () => {
    const dataItem = {
      USER_ID: getUserData().USER_ID,
      APPLICATION_ID: import.meta.env.VITE_APPLICATION_ID,
      MENU_ID: MENU_ID.toString(),
      USER_PROFILE_SETTING_PROGRAM_DATA: {
        searchFilters: getValues('searchFilters'),
        searchResults: {
          agGridState: getValues('searchResults.agGridState')
        }
      } as RequestRegisterFormData
    }

    mutate(dataItem)
  }

  const onMutateSuccess = () => {}

  const onMutateError = (e: any) => {}

  const { mutate, isError, error } = useCreate(onMutateSuccess, onMutateError)

  return (
    <Card style={{ overflow: 'visible', zIndex: 4 }}>
      <CardHeader
        title='Search filters'
        titleTypographyProps={{ variant: 'h5' }}
        sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
      />

      <CardContent>
        {isError && <div>An error occurred: {error.message}</div>}
        {isLoading ? (
          <>
            <SkeletonCustom />
          </>
        ) : (
          <>
            <Grid container spacing={4}>
              {/* Vendor Name */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.vendor_name'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Vendor Name'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              {/* Submitted By */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.submitted_by'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Submitted By'
                      placeholder='Enter ...'
                      autoComplete='off'
                    />
                  )}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='searchFilters.overall_status'
                  control={control}
                  render={({ field: { ref, ...fieldProps } }) => (
                    <SelectCustom
                      {...fieldProps}
                      options={statusOptions}
                      isClearable
                      label='Status'
                      placeholder='Select ...'
                      classNamePrefix='select'
                    />
                  )}
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} className='flex gap-3'>
                <Button onClick={() => handleSubmit(onSubmit, onError)()} variant='contained' type='button'>
                  Search
                </Button>
                <Button variant='tonal' color='secondary' type='reset' onClick={onHandleClearSearchFilters}>
                  Clear
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default SearchFilter
"""

shared_search_result_path = os.path.join(base_dir, "_shared", "SearchResult.tsx")
with open(shared_search_result_path, "r", encoding="utf-8") as f:
    shared_search_result_content = f.read()

shared_search_result_content = shared_search_result_content.replace(
    "import SearchFilter from './SearchFilter'",
    "import { useFormContext } from 'react-hook-form'\nimport type { RequestRegisterFormData } from './validataeSchema'"
)
shared_search_result_content = shared_search_result_content.replace(
    "import { useDxContext } from '@/_template/DxContextProvider'\n",
    ""
)
shared_search_result_content = shared_search_result_content.replace(
    "import { useMemo, useState, useEffect, useRef, useCallback } from 'react'",
    "import { useMemo, useState, useEffect, useRef, useCallback } from 'react'\nimport { useDxContext } from '@/_template/DxContextProvider'"
)

old_search_filter_states = """    const [collapse, setCollapse] = useState(false)
    const gridApiRef = useRef<any>(null)
    const [vendorNameFilter, setVendorNameFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState<any>(null)
    const [selectedRows, setSelectedRows] = useState<any[]>([])"""

new_search_filter_states = """    const gridApiRef = useRef<any>(null)
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const { getValues } = useFormContext<RequestRegisterFormData>()
    const { isEnableFetching, setIsEnableFetching } = useDxContext()
    
    // Trigger refresh when Search / Clear button sets isEnableFetching = true
    useEffect(() => {
        if (isEnableFetching && gridApiRef.current) {
            setIsEnableFetching(false)
            gridApiRef.current.refreshServerSide({ purge: true })
        }
    }, [isEnableFetching, setIsEnableFetching])"""

shared_search_result_content = shared_search_result_content.replace(old_search_filter_states, new_search_filter_states)

old_get_rows = """                    SearchFilters: [
                        { id: 'company_name', value: vendorNameFilter || null },
                        { id: 'request_status', value: statusFilter?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),"""
new_get_rows = """                    SearchFilters: [
                        { id: 'company_name', value: getValues('searchFilters.vendor_name') || null },
                        { id: 'Request_By_EmployeeCode', value: getValues('searchFilters.submitted_by') || null },
                        { id: 'request_status', value: getValues('searchFilters.overall_status')?.value || null }
                    ].filter((x: any) => x.value !== null && x.value !== ''),"""
shared_search_result_content = shared_search_result_content.replace(old_get_rows, new_get_rows)

shared_search_result_content = re.sub(r'const handleSearch = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\)\s*', '', shared_search_result_content)
shared_search_result_content = re.sub(r'const handleClear = useCallback\(\(\) => \{[\s\S]*?\}, \[\]\)\s*', '', shared_search_result_content)
shared_search_result_content = re.sub(r'const searchFilterDataItem = useMemo\(\(\) => \(\{[\s\S]*?\}\), \[collapse, vendorNameFilter, statusFilter, statusOptions, handleSearch, handleClear\]\)\s*', '', shared_search_result_content)
shared_search_result_content = re.sub(r'<Grid item xs=\{12\}>\s*<SearchFilter \{\.\.\.searchFilterDataItem\} />\s*</Grid>\s*', '', shared_search_result_content)

for d in dirs:
    path = os.path.join(base_dir, d)
    
    page_tsx_path = os.path.join(path, "page.tsx")
    with open(page_tsx_path, "r", encoding="utf-8") as f:
        page_content = f.read()
    
    props_match = re.search(r'<ApprovalPageContent([\s\S]*?)/>', page_content)
    props_str = props_match.group(1) if props_match else ""
    
    new_page_content = f"""// MUI Imports
import {{ Grid }} from '@mui/material'

// React-Hook-Form Imports
import {{ FormProvider, useForm, useFormState }} from 'react-hook-form'
import {{ zodResolver }} from '@hookform/resolvers/zod'

// Third-party Imports
import {{ useUpdateEffect }} from 'react-use'

// Components Imports
import SkeletonCustom from '@components/SkeletonCustom'

// Template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'
import {{ DxProvider, useDxContext }} from '@/_template/DxContextProvider'

// Schema & Env
import type {{ RequestRegisterFormData }} from './validataeSchema'
import {{ RequestRegisterSchema, fetchDefaultValues }} from './validataeSchema'
import {{ MENU_NAME, breadcrumbNavigation }} from './env'

// Component Imports
import SearchFilter from './SearchFilter'
import ApprovalPageContent from './SearchResult'

function Page() {{
    return (
        <DxProvider>
            <InnerApp />
        </DxProvider>
    )
}}

const InnerApp = () => {{
    const {{ setIsEnableFetching }} = useDxContext()

    const reactHookFormMethods = useForm<RequestRegisterFormData>({{
        resolver: zodResolver(RequestRegisterSchema),
        defaultValues: fetchDefaultValues
    }})

    const {{ control }} = reactHookFormMethods
    const {{ isLoading: isLoadingReactHookForm }} = useFormState({{ control }})

    // Trigger initial fetch after async defaultValues finish loading
    useUpdateEffect(() => {{
        setIsEnableFetching(true)
    }}, [isLoadingReactHookForm])

    return (
        <FormProvider {{...reactHookFormMethods}}>
            <Grid container spacing={{6}}>
                <Grid item xs={{12}} sx={{{{ display: 'flex', alignItems: 'center' }}}}>
                    <DxBreadCrumbs menuName={{MENU_NAME}} breadcrumbNavigation={{breadcrumbNavigation}} />
                </Grid>
                <Grid item xs={{12}}>
                    <SearchFilter />
                </Grid>
                <Grid item xs={{12}}>
                    {{isLoadingReactHookForm ? (
                        <SkeletonCustom />
                    ) : (
                        <ApprovalPageContent{props_str}/>
                    )}}
                </Grid>
            </Grid>
        </FormProvider>
    )
}}

export default Page
"""
    with open(page_tsx_path, "w", encoding="utf-8") as f:
        f.write(new_page_content)
        
    sf_path = os.path.join(path, "SearchFilter.tsx")
    with open(sf_path, "w", encoding="utf-8") as f:
        f.write(search_filter_content)
        
    sr_path = os.path.join(path, "SearchResult.tsx")
    with open(sr_path, "w", encoding="utf-8") as f:
        f.write(shared_search_result_content)

print("Migration completed.")

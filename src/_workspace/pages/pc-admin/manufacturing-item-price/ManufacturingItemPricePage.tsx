// React Imports
import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, Tooltip, Typography } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormContext, useFormState } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import UploadIcon from '@mui/icons-material/Upload'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  type MRT_Row,
  type MRT_RowSelectionState
} from 'material-react-table'

import SelectCustom from '@/components/react-select/SelectCustom'
import CustomTextField from '@/components/mui/TextField'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import type { ProductCategoryOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import { fetchProductCategoryByLikeProductCategoryNameAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchProductCategory'
import type { ProductMainOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import {
  fetchProductMainByLikeProductMainNameAndInuse,
  fetchProductMainByLikeProductMainNameAndProductCategoryIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductMain'
import type { ProductSubOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import {
  fetchProductSubByLikeProductSubNameAndInuse,
  fetchProductSubByLikeProductSubNameAndProductCategoryIdAndInuse,
  fetchProductSubByLikeProductSubNameAndProductMainIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductSub'
import type { ProductTypeOption } from '@/_workspace/react-select/async-promise-load-options/fetchProductType'
import {
  fetchProductTypeByLikeProductTypeNameAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductCategoryIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductMainIdAndInuse,
  fetchProductTypeByLikeProductTypeNameAndProductSubIdAndInuse
} from '@/_workspace/react-select/async-promise-load-options/fetchProductType'

import { PREFIX_QUERY_KEY } from '@/_workspace/react-query/hooks/useFiscalYearPeriodData'
import type { ParamApiSearchResultTableI } from '@/libs/material-react-table/types/SearchResultTable'
import type { ProductTypeI } from '@/_workspace/types/productGroup/ProductType'
import { twMerge } from 'tailwind-merge'
import { FiscalYearType } from '@/app/[lang]/(_workspace)/cost-condition/exchange-rate/ExchangeRateSearch'
import {
  fetchSctTagByLikeSctTagNameAndInuse,
  SctTagSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctTag'
import {
  fetchSctReasonByLikeSctReasonNameAndInuse,
  SctReasonSettingOption
} from '@/_workspace/react-select/async-promise-load-options/fetchSctReasonSetting'
import StatusOption from '@/libs/material-react-table/components/StatusOption'
import {
  CustomerInvoiceToOption,
  fetchCustomerInvoiceToByLikeCustomerInvoiceToNameAndInuse
} from '@/_workspace/react-select/async-promise-load-options/customer/fetchCustomerInvoiceTo'
import { useCreate } from '@/libs/react-query/hooks/common-system/useUserProfileSettingProgram'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { MENU_ID } from './env'
import ConfirmModal from '@/components/ConfirmModal'
import TypingConfirmModal from './TypingConfirmModal'
import LoadingModal from './LoadingModal'

const FiscalYearOption: FiscalYearType[] = Array.from({ length: 3 }, (_, i) => {
  const year = new Date().getFullYear() - 1 + i
  return { value: year, label: year }
})

interface Props {
  setIsEnableFetching: Dispatch<SetStateAction<boolean>>
}

const ManufacturingItemPricePage = ({ setIsEnableFetching }: Props) => {
  const { setValue, getValues, control, handleSubmit, watch } = useFormContext<FormData>()

  const { errors } = useFormState({
    control
  })
  const [openLoadingModal, setOpenModalLoading] = useState<boolean>(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [openConfirmTypingModal, setOpenModalConfirmTyping] = useState<boolean>(false)
  const [isFetchData, setIsFetchData] = useState(false)

  const handleClickOpen = () => {
    setOpenModalConfirmTyping(true)
  }

  // Hooks : react-query
  const queryClient = useQueryClient()

  const handleConfirmModal = () => {
    setOpenModalConfirmTyping(true)
  }

  const onSubmit: SubmitHandler<FormData> = () => {
    setConfirmModal(true)
    // setIsEnableFetching(true)
  }

  const onError: SubmitErrorHandler<FormData> = data => {
    console.log(data)
  }

  // Function
  const onResetFormSearch = () => {
    setValue('searchFilters.FISCAL_YEAR', null)
  }

  // react-query

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card style={{ overflow: 'visible', zIndex: 4 }}>
            <Divider color='primary'>
              <Typography className='mt-2 mx-4' color='primary'>
                Header Components
              </Typography>
            </Divider>
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    name='searchFilters.FISCAL_YEAR'
                    control={control}
                    render={({ field: { ...fieldProps } }) => (
                      <SelectCustom
                        {...fieldProps}
                        options={FiscalYearOption}
                        isClearable
                        label='Fiscal Year'
                        classNamePrefix='select'
                        placeholder='Select Fiscal Year'
                        value={watch('searchFilters.FISCAL_YEAR')}
                        {...(errors.searchFilters?.FISCAL_YEAR && {
                          error: true,
                          helperText: errors.searchFilters?.FISCAL_YEAR.message
                        })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4} lg={3}>
                  <Controller
                    defaultValue='P3'
                    control={control}
                    name='SCT_PATTERN'
                    render={({ field: { ...fieldProps } }) => (
                      <CustomTextField
                        label='SCT Pattern'
                        {...fieldProps}
                        fullWidth
                        // placeholder='Enter Manufacturing Item Group Name'
                        autoComplete='off'
                        disabled={true}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container className='mbs-0' spacing={6}>
                <Grid item xs={12} className='flex gap-3'>
                  <Button
                    onClick={() => handleSubmit(onSubmit, onError)()}
                    variant='contained'
                    type='button'
                    startIcon={<UploadIcon />}
                  >
                    {`Create All Standard Price ${watch('searchFilters.FISCAL_YEAR')?.value + 1 || 'XXXX'} P2`}
                  </Button>
                  <Button variant='tonal' color='secondary' type='reset' onClick={onResetFormSearch}>
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <ConfirmModal
        show={confirmModal}
        onConfirmClick={handleConfirmModal}
        onCloseClick={() => setConfirmModal(false)}
        isDelete={false}
      />
      {openConfirmTypingModal ? (
        <TypingConfirmModal
          openAddModal={openConfirmTypingModal}
          setOpenModalAdd={setOpenModalConfirmTyping}
          setIsEnableFetching={setIsEnableFetching}
          fiscalYear={watch('searchFilters.FISCAL_YEAR')?.value}
          setConfirmModal={setConfirmModal}
          setOpenModalLoading={setOpenModalLoading}
        />
      ) : null}

      {openLoadingModal ? (
        <LoadingModal
          openAddModal={openLoadingModal}
          setOpenModalAdd={setOpenModalLoading}
          setIsEnableFetching={setIsEnableFetching}
        />
      ) : null}
    </>
  )
}

export default ManufacturingItemPricePage

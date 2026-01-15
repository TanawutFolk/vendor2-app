// React Imports
import type { Ref, ReactElement, Dispatch, SetStateAction, MutableRefObject, useRef } from 'react'
import { forwardRef, useEffect, useState } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import type { SlideProps } from '@mui/material'
import { Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Slide } from '@mui/material'
import type { SubmitErrorHandler, SubmitHandler } from 'react-hook-form'
import { Controller, useForm, useFormState } from 'react-hook-form'

// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import AddIcon from '@mui/icons-material/Add'

import {
  object,
  string,
  nullable,
  number,
  unknown,
  array,
  boolean,
  picklist,
  optional,
  record,
  minLength,
  maxLength,
  toTrimmed,
  regex,
  pipe,
  nonEmpty
} from 'valibot'

import type { Input } from 'valibot'

import { valibotResolver } from '@hookform/resolvers/valibot'

import type { MRT_Row } from 'material-react-table'

import { useEffectOnce } from 'react-use'

import DialogCloseButton from '@components/dialogs/DialogCloseButton'

import { PREFIX_QUERY_KEY, useUpdateProductCategory } from '@/_workspace/react-query/hooks/useProductCategoryData'
import CustomTextField from '@/@core/components/mui/TextField'
import CustomAutocomplete from '@/@core/components/mui/Autocomplete'
// import AsyncSelectCustom from '@/customize/components/AsyncSelectCustom'
import {
  maxLengthFieldMessage,
  minLengthFieldMessage,
  requiredFieldMessage,
  typeFieldMessage,
  uppercaseFieldMessage
} from '@/libs/valibot/error-message/errorMessage'

import ConfirmModal from '@/components/ConfirmModal'
import data from '@/data/searchData'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { ProductCategoryI } from '@/_workspace/types/productGroup/ProductCategory'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import StatusOption from '@/libs/react-select/option/StatusOption'
import StatusColumn from '@/libs/material-react-table/components/StatusOption'
import { Cell } from 'recharts'
import SelectCustom from '@/components/react-select/SelectCustom'
import StatusOptionForEdit from '@/libs/react-select/option/StatusOptionForEdit'

const ExportForm = ({ setValue }: any) => {
  // useState
  const { control, register } = useForm({
    defaultValues: {
      export: '1'
    }
  })
  return (
    <>
      <Grid container spacing={2} alignItems='center'>
        <Grid xs={12}>
          {' '}
          <br />
        </Grid>

        <Grid item xs={12}>
          <Divider textAlign='left'>
            <Typography variant='h6' color='primary'>
              Export
            </Typography>
          </Divider>
        </Grid>

        <Grid item md={6} sm={12}>
          <Controller
            name='export'
            // defaultValue={1}
            control={control}
            render={({ field }) => (
              <FormControl component='fieldset'>
                {/* Label ด้านบน */}
                {/* <FormLabel component='legend'>Export File (default)</FormLabel> */}

                {/* RadioGroup */}
                <RadioGroup {...field} row>
                  <FormControlLabel value='1' control={<Radio />} label='Export File (default)' />
                  {/* <FormControlLabel value='0' control={<Radio />} label='FG + Semi FG + Sub Assy' /> */}
                </RadioGroup>
              </FormControl>
            )}
          />
          {/* </FormControl> */}
        </Grid>
      </Grid>
    </>
  )
}

export default ExportForm

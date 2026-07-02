// import {
//   ChangeEvent,
//   Dispatch,
//   forwardRef,
//   ReactElement,
//   Ref,
//   SetStateAction,
//   useEffect,
//   useRef,
//   useState
// } from 'react'

// import {
//   Autocomplete,
//   Button,
//   Chip,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Divider,
//   Grid,
//   ListItem,
//   MenuItem,
//   Select,
//   SelectChangeEvent,
//   Slide,
//   SlideProps,
//   Stack,
//   TextField,
//   Typography
// } from '@mui/material'

// import { Controller, SubmitErrorHandler, useForm, useFormState } from 'react-hook-form'
// import { Col, FormFeedback, Label } from 'reactstrap'
// import classNames from 'classnames'
// import CustomTextField from '@/components/mui/TextField'
// import classnames from 'classnames'
// import zIndex from '@mui/material/styles/zIndex'

// // Dialog
// // const Transition = forwardRef(function Transition(
// //   props: SlideProps & { children?: ReactElement<any, any> },
// //   ref: Ref<unknown>
// // ) {
// //   return <Slide direction='up' ref={ref} {...props} />
// // })
// const ITEM_HEIGHT = 48
// const ITEM_PADDING_TOP = 8
// const MenuProps = {
//   PaperProps: {
//     style: {
//       width: 250,
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
//     }
//   }
// }

// const FiscalYearForm = ({ control, setValue, errors }: any) => {
//   const fiscalYearRef = useRef<HTMLDivElement>(null)
//   const currentYear = new Date().getFullYear()
//   const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - i)
//   const [selectedYears, setSelectedYears] = useState<number[]>([])

//   const [year, setYear] = useState<string[]>([])

//   // const handleDelete = (item: any) => () => {
//   //   console.log('handleDelete', item)
//   //   setYear(chips => chips.filter(chip => chip !== item))
//   // }
//   const handleDelete = (chipToDelete: string) => {
//     console.log('Deleting:', chipToDelete)
//     setYear(prevYears => {
//       const updatedYears = prevYears.filter(chip => chip !== chipToDelete)
//       setValue('fiscalYear.year', updatedYears)
//       return updatedYears
//     })
//   }

//   const handleChange = (event: SelectChangeEvent<string[]>) => {
//     setYear(event.target.value as string[])

//     console.log('event', Object.values(event.target.value))

//     let result = Object.values(event.target.value).map((item: any) => {
//       return { FISCAL_YEAR_ID: item, FISCAL_YEAR_NAME: item }
//     })

//     setValue('fiscalYear.year', result)
//   }

//   // const handleChange = (event: SelectChangeEvent<string[]>) => {
//   //   const selectedYears = event.target.value as string[]
//   //   console.log('Selected years:', selectedYears)
//   //   setYear(selectedYears)
//   //   setValue('fiscalYear.year', selectedYears)
//   // }

//   const names = Array.from({ length: 7 }, (_, i) => ({
//     FISCAL_YEAR_ID: new Date().getFullYear() - i + 1,
//     FISCAL_YEAR_NAME: new Date().getFullYear() - i + 1
//   }))

//   useEffect(() => {
//     console.log('Current year state:', year)
//   }, [year])

//   // useEffect(() => {
//   //   console.log('React-hook-form fiscalYear.year:', watch('fiscalYear.year'))
//   // }, [watch('fiscalYear.year')])

//   return (
//     //  { watch('fiscalYear.year')}

//     <Grid container spacing={3}>
//       <Grid xs={12}>
//         {' '}
//         <br />
//       </Grid>
//       <Grid item xs={12}>
//         <Divider textAlign='left'>
//           <Typography variant='h6' color='primary'>
//             Fiscal Year
//           </Typography>
//         </Divider>
//       </Grid>

//       <div className='flex flex-wrap gap-1 mb-2'>
//         {year.map(item => (
//           <Chip
//             key={item}
//             label={item}
//             onDelete={event => {
//               event.stopPropagation()
//               handleDelete(item)
//             }}
//           />
//         ))}
//       </div>

//       <Grid item xs={12} sm={6} md={4}>
//         <div>
//           <Controller
//             name='fiscalYear.year'
//             control={control}
//             rules={{ required: 'This is required.' }}
//             render={({ field: { onChange, ...fieldProps } }) => (
//               <CustomTextField
//                 select
//                 fullWidth
//                 label='Year'
//                 value={year}
//                 id='select-multiple-default'
//                 className={classnames('react-select', {
//                   'is-invalid': errors?.fiscalYear?.year
//                 })}
//                 SelectProps={{
//                   MenuProps: { disablePortal: true },
//                   multiple: true,
//                   onChange: handleChange,
//                   renderValue: selected => {
//                     console.log('Selected values:', selected)
//                     return (
//                       <div className='flex flex-wrap gap-1'>
//                         {(selected as string[]).map(item => (
//                           // <Chip
//                           //   key={item}
//                           //   label={item}
//                           //   size='small'
//                           //   onDelete={() => {
//                           //     console.log('onDelete triggered for item:', item)
//                           //     handleDelete(item)
//                           //   }}
//                           // />

//                           // <div className='flex gap-4'>
//                           <Stack
//                             direction='row'
//                             spacing={1}
//                             style={{
//                               zIndex: 1300,
//                               position: 'relative'
//                             }}
//                           >
//                             <Chip
//                               key={item}
//                               label={item}
//                               onDelete={event => {
//                                 // event.preventDefault()
//                                 event.stopPropagation()
//                                 handleDelete(item)
//                               }}
//                               deleteIcon={<i className='tabler-trash-x' />}
//                             />
//                           </Stack>
//                           // </div>
//                         ))}
//                       </div>
//                     )
//                   }
//                 }}
//                 error={!!errors?.fiscalYear?.year}
//                 helperText={errors?.fiscalYear?.year?.message}
//               >
//                 {names.map(name => (
//                   <MenuItem key={name.FISCAL_YEAR_ID} value={name.FISCAL_YEAR_NAME}>
//                     {name?.FISCAL_YEAR_NAME}
//                   </MenuItem>
//                 ))}
//               </CustomTextField>
//             )}
//             {...(errors?.fiscalYear?.year && (
//               <FormFeedback type='invalid'>{errors.fiscalYear.year.message}</FormFeedback>
//             ))}
//           />
//         </div>
//       </Grid>

//       {/* <form onSubmit={handleSubmit(onSubmit)}>
//         <table>
//           <thead>
//             <tr>
//               <th>Field</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td>
//                 <Controller
//                   name='exampleField'
//                   control={control}
//                   rules={{ required: 'This is required.' }}
//                   render={({ field, fieldState }) => (
//                     <CustomTextField
//                       {...field}
//                       error={!!fieldState.error}
//                       helperText={fieldState.error?.message}
//                       label='Example Field'
//                     />
//                   )}
//                 />
//               </td>
//             </tr>
//           </tbody>
//         </table>
//         <button type='submit'>Submit</button>
//       </form> */}
//     </Grid>
//   )
// }

// export default FiscalYearForm

import { Controller } from 'react-hook-form'

import { Col, FormFeedback, Label } from 'reactstrap'

import Select from 'react-select'
import classnames from 'classnames'
import SelectCustom from '@/components/react-select/SelectCustom'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import { value } from 'valibot'
import { Chip, Stack } from '@mui/material'

// ** Utils
// import { selectThemeColors } from '@utils'

const FiscalYearForm = ({ control, setValue, errors }: any) => {
  return (
    <>
      <div className='divider divider-start divider-color-primary-custom' style={{ marginTop: 0 }}>
        <div className='divider-text text-primary'>Fiscal year</div>
      </div>
      <Col md='3' sm='12'>
        <Label htmlFor='fiscalYear'>Year</Label>
        <Controller
          id='fiscalYear'
          control={control}
          name='fiscalYear.year'
          rules={{ required: 'Fiscal Year is required' }}
          render={({ field: { onChange, onBlur, ref, ...fieldProps } }) => (
            <>
              {/* <AsyncSelectCustom */}
              <SelectCustom
                onChange={e => {
                  let MutiVal = e.map(options => ({
                    value: options.value,
                    label: options.label,
                    FISCAL_YEAR_ID: options.value,
                    FISCAL_YEAR_NAME: options.label
                  }))

                  setValue('fiscalYear.year', MutiVal, {
                    shouldValidate: true,
                    shouldDirty: true
                  })
                }}
                isClearable
                isMulti
                isSearchable={false}
                // loadOptions={() =>
                //   Promise.resolve(
                //     Array.from({ length: 7 }, (_, i) => ({
                //       FISCAL_YEAR_ID: new Date().getFullYear() - i + 1,
                //       FISCAL_YEAR_NAME: new Date().getFullYear() - i + 1
                //     }))
                //   )
                // }
                options={Array.from({ length: 7 }, (_, i) => ({
                  value: new Date().getFullYear() - i + 1,
                  label: new Date().getFullYear() - i + 1
                }))}
                // getOptionLabel={e => e}
                // getOptionValue={e => e}
                className={classnames('react-select', {
                  'is-invalid': errors?.fiscalYear?.year
                })}
                classNamePrefix='select'
                placeholder='Select Year ...'
                styles={{
                  control: base => ({
                    ...base,
                    borderColor: errors?.fiscalYear?.year ? 'red' : base.borderColor,
                    boxShadow: errors?.fiscalYear?.year ? '0 0 0 1px red' : base.boxShadow,
                    width: '300px'
                  })
                }}
                {...fieldProps}
              />

              {errors?.fiscalYear?.year && (
                <div style={{ color: 'red', marginTop: '8px', fontSize: '0.875rem' }}>
                  {/* <FormFeedback type='invalid'> */}
                  {errors.fiscalYear.year.message}
                  {/* </FormFeedback> */}
                </div>
              )}
            </>
          )}
        />
      </Col>
    </>
  )
}

export default FiscalYearForm

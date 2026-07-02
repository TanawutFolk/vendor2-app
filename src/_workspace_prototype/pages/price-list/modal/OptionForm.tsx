// React Imports
import type { Ref, ReactElement, Dispatch, SetStateAction } from 'react'
import { forwardRef, useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'

import type { SlideProps } from '@mui/material'
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Slide
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { Label } from 'recharts'

const Transition = forwardRef(function Transition(
  props: SlideProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

const OptionForm = ({ control, setValue, errors }: any) => {
  // const { control, register } = useForm({
  //   defaultValues: {
  //     option: {
  //       priceListOption: '1',
  //       revision: '1'
  //     }
  //   }
  // })

  // useState

  return (
    <>
      {/* <Grid item xs={12}>
        {' '}
        <br />
      </Grid> */}
      <Grid container spacing={2} alignItems='center'>
        <Grid xs={12}>
          {' '}
          <br />
        </Grid>

        <Grid item xs={12}>
          <Divider textAlign='left'>
            <Typography variant='h6' color='primary'>
              Option
            </Typography>
          </Divider>
        </Grid>

        {/* <Grid item xs={12}>
        {' '}
        <br />
      </Grid> */}

        <Grid item md={6} sm={12}>
          <Controller
            name='option.priceListOption'
            control={control}
            render={({ field }) => (
              <FormControl component='fieldset'>
                {/* Label ด้านบน */}
                <FormLabel component='legend'>Price List Option</FormLabel>

                {/* RadioGroup */}
                <RadioGroup {...field} row>
                  <FormControlLabel value='FG' control={<Radio />} label='FG only' />
                  <FormControlLabel value='FGSum' control={<Radio />} label='FG + Semi FG + Sub Assy' />
                </RadioGroup>
              </FormControl>
            )}
          />
          {/* </FormControl> */}
        </Grid>

        {/* <Grid item xs={12}>
        {' '}
        <br />
      </Grid> */}

        <Grid item md={6} sm={12}>
          {/* <FormControl error={Boolean(errors.option.priceListOption)}> */}
          <Controller
            name='option.revision'
            control={control}
            render={({ field }) => (
              <FormControl component='fieldset'>
                <FormLabel component='legend'>Revision</FormLabel>

                <RadioGroup {...field} row>
                  <FormControlLabel value='newestRevision' control={<Radio />} label='Newest Revision only' />
                  <FormControlLabel value='allRevision' control={<Radio />} label='All Revision' />
                </RadioGroup>
              </FormControl>
            )}
          />
          {/* </FormControl> */}
        </Grid>
      </Grid>
      {/* --------------------------------------table---------------------------------------- */}
    </>
  )
}

export default OptionForm

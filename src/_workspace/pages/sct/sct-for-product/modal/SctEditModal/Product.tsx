import { Divider, Grid, Typography } from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import CustomTextField from '@/components/mui/TextField'
import { FormDataPage } from './validationSchema'

const Product = () => {
  const { control, watch } = useFormContext<FormDataPage>()

  const [
    mode,
    SCT_STATUS_PROGRESS_ID,
    PRODUCT_CATEGORY_NAME,
    PRODUCT_MAIN_NAME,
    PRODUCT_SUB_NAME,
    PRODUCT_TYPE_CODE,
    PRODUCT_TYPE_NAME,
    ITEM_CATEGORY_NAME,
    PRODUCT_SPECIFICATION_TYPE_NAME
  ] = useWatch({
    control,
    name: [
      'mode',
      'header.sctStatusProgress.SCT_STATUS_PROGRESS_ID',
      'product.productCategory.PRODUCT_CATEGORY_NAME',
      'product.productMain.PRODUCT_MAIN_NAME',
      'product.productSub.PRODUCT_SUB_NAME',
      'product.productType.PRODUCT_TYPE_CODE',
      'product.productType.PRODUCT_TYPE_NAME',
      'product.itemCategory.ITEM_CATEGORY_NAME',
      'product.productSpecificationType.PRODUCT_SPECIFICATION_TYPE_NAME'
    ]
  })

  return (
    <>
      <Grid item xs={12}>
        <Divider color='primary'>
          <Typography color='primary' className='font-bold'>
            Product
          </Typography>
        </Divider>
      </Grid>
      <Grid item xs={12} sm={4} lg={4}>
        <CustomTextField
          value={PRODUCT_CATEGORY_NAME}
          fullWidth
          label='Product Category'
          placeholder='Auto'
          autoComplete='off'
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} sm={4} lg={4}>
        <CustomTextField value={PRODUCT_MAIN_NAME} fullWidth label='Product Main' autoComplete='off' disabled={true} />
      </Grid>
      <Grid item xs={12} sm={4} lg={4}>
        <CustomTextField value={PRODUCT_SUB_NAME} fullWidth label='Product Sub' disabled={true} />
      </Grid>
      <Grid item xs={12} sm={4} lg={4}>
        <CustomTextField
          value={PRODUCT_TYPE_CODE}
          fullWidth
          label='Product Type Code'
          placeholder='Auto'
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} sm={8} lg={8}>
        <CustomTextField
          value={PRODUCT_TYPE_NAME}
          fullWidth
          label='Product Type Name'
          placeholder='Auto'
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} sm={4} lg={4}>
        <CustomTextField
          fullWidth
          value={ITEM_CATEGORY_NAME}
          label='Item Category'
          placeholder='Auto'
          autoComplete='off'
          disabled={true}
        />
      </Grid>
      <Grid item xs={12} sm={4} lg={4}>
        <CustomTextField
          value={PRODUCT_SPECIFICATION_TYPE_NAME}
          fullWidth
          label='Product Specification Type'
          placeholder='Auto'
          autoComplete='off'
          disabled={true}
        />
      </Grid>
    </>
  )
}

export default Product

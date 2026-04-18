import { Box, Button, Chip, Divider, Grid, IconButton, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchProductGroups'

import type { EditVendorSchemaType } from '../validateSchema'
import SectionHeader from './SectionHeader'

type ProductsSectionProps = {
    editingMode: 'view' | 'edit'
    productFields: any[]
    removeProduct: (index: number) => void
    appendProduct: (value: any) => void
    productGroupRefreshKey: number
    onOpenAddProductGroup: () => void
}

const ProductsSection = ({
    editingMode,
    productFields,
    removeProduct,
    appendProduct,
    productGroupRefreshKey,
    onOpenAddProductGroup,
}: ProductsSectionProps) => {
    const {
        control,
        getValues,
        setValue,
        formState: { errors },
    } = useFormContext<EditVendorSchemaType>()

    return (
        <Box sx={{ position: 'relative', zIndex: 2 }}>
            <SectionHeader icon='tabler-package' title={`Products / Services (${productFields.length})`} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {productFields.map((product: any, index: number) => (
                    <Box
                        key={product.id}
                        sx={{
                            p: 2.5,
                            borderRadius: 1.5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'primary.main',
                            position: 'relative',
                        }}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Box display='flex' justifyContent='space-between' alignItems='center'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant='caption' fontWeight={700}>
                                                {index + 1}
                                            </Typography>
                                        </Box>
                                        <Typography variant='subtitle2' fontWeight={600}>
                                            Product
                                        </Typography>
                                        {!product.vendor_product_id && (
                                            <Chip label='New' size='small' color='success' sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                                        )}
                                    </Box>
                                    {editingMode === 'edit' && (
                                        <IconButton size='small' color='error' onClick={() => removeProduct(index)}>
                                            <i className='tabler-trash' />
                                        </IconButton>
                                    )}
                                </Box>
                                <Divider sx={{ my: 2 }} />
                            </Grid>

                            <Grid item xs={12} sm={6} md={6} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Controller
                                        name={`products.${index}.product_group_id`}
                                        control={control}
                                        render={({ field }) => (
                                            <AsyncSelectCustom
                                                key={`product-group-${index}-${productGroupRefreshKey}`}
                                                label='Product Group'
                                                {...field}
                                                value={field.value ? { value: field.value, label: getValues(`products.${index}.group_name`) || 'Unknown' } : null}
                                                onChange={(val: any) => {
                                                    field.onChange(val?.value)
                                                    setValue(`products.${index}.group_name`, val?.label)
                                                }}
                                                loadOptions={(inputValue, callback) => {
                                                    fetchProductGroups(inputValue).then(options => callback(options as any))
                                                }}
                                                defaultOptions
                                                cacheOptions={false}
                                                isClearable
                                                isDisabled={editingMode === 'view'}
                                                placeholder='Select group...'
                                                classNamePrefix='select'
                                            />
                                        )}
                                    />
                                </Box>
                                {editingMode === 'edit' && (
                                    <Button
                                        variant='tonal'
                                        color='secondary'
                                        onClick={onOpenAddProductGroup}
                                        sx={{ minWidth: 38, width: 38, height: 38, p: 0, flexShrink: 0, mt: 5.4 }}
                                        title='Add Product Group'
                                    >
                                        <i className='tabler-plus' />
                                    </Button>
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Controller
                                    name={`products.${index}.maker_name`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Maker Name'
                                            value={field.value || ''}
                                            size='small'
                                            disabled={editingMode === 'view'}
                                            InputProps={{ readOnly: editingMode === 'view' }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Controller
                                    name={`products.${index}.product_name`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            label='Product Name'
                                            value={field.value || ''}
                                            size='small'
                                            error={!!errors.products?.[index]?.product_name}
                                            helperText={errors.products?.[index]?.product_name?.message}
                                            disabled={editingMode === 'view'}
                                            InputProps={{ readOnly: editingMode === 'view' }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <Controller
                                    name={`products.${index}.model_list`}
                                    control={control}
                                    render={({ field }) => (
                                        <CustomTextField
                                            {...field}
                                            fullWidth
                                            multiline
                                            label='Model List'
                                            value={field.value || ''}
                                            size='small'
                                            disabled={editingMode === 'view'}
                                            InputProps={{ readOnly: editingMode === 'view' }}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                ))}
                {editingMode === 'edit' && (
                    <Button
                        variant='outlined'
                        startIcon={<i className='tabler-plus' />}
                        onClick={() => appendProduct({ product_name: '' })}
                        fullWidth
                        sx={{ borderStyle: 'dashed' }}
                    >
                        Add Product
                    </Button>
                )}
            </Box>
        </Box>
    )
}

export default ProductsSection

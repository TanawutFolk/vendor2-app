// React Imports
import { useState } from 'react'
import { Controller, useFormContext, useFormState, useFieldArray } from 'react-hook-form'

// MUI Imports
import { Grid, Button, IconButton, Typography, Card, CardContent, Divider, Box } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import AddProductGroupModal from './modal/AddProductGroupModal'

// Fetch functions
import { fetchProductGroups } from '@/_workspace/react-select/async-promise-load-options/find-vendor/fetchFindVendor'

// Types
import type { AddVendorFormData } from './validateSchema'
import { defaultProductValues } from './validateSchema'

interface SectionProductsProps {
    isDisabled: boolean
}

const SectionProducts = ({ isDisabled }: SectionProductsProps) => {
    const [showAddProductGroupModal, setShowAddProductGroupModal] = useState(false)
    const [productGroupRefreshKey, setProductGroupRefreshKey] = useState(0)

    const { control } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })
    const { fields, append, remove } = useFieldArray({ control, name: 'products' })

    const handleAddProduct = () => {
        append({ ...defaultProductValues })
    }

    const handleProductGroupAdded = () => {
        setProductGroupRefreshKey(prev => prev + 1)
    }

    return (
        <>
            <Grid container spacing={4}>
                {fields.map((field, index) => (
                    <Grid item xs={12} key={field.id}>
                        <Card variant='outlined'>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Grid container justifyContent='space-between' alignItems='center'>
                                            <Typography variant='subtitle1' color='primary'>
                                                Product #{index + 1}
                                            </Typography>
                                            {fields.length > 1 && (
                                                <IconButton size='small' color='error' onClick={() => remove(index)} disabled={isDisabled}>
                                                    <i className='tabler-trash text-lg' />
                                                </IconButton>
                                            )}
                                        </Grid>
                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Controller
                                                name={`products.${index}.product_group`}
                                                control={control}
                                                render={({ field }) => (
                                                    <AsyncSelectCustom
                                                        {...field}
                                                        key={`product-group-${index}-${productGroupRefreshKey}`}
                                                        label='Product Group'
                                                        loadOptions={inputValue => fetchProductGroups(inputValue)}
                                                        defaultOptions
                                                        cacheOptions={false}
                                                        isClearable
                                                        isDisabled={isDisabled}
                                                        placeholder='Select group...'
                                                        classNamePrefix='select'
                                                        {...(errors.products?.[index]?.product_group && {
                                                            error: true,
                                                            helperText: 'Product Group is required'
                                                        })}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Button
                                            variant='tonal'
                                            color='secondary'
                                            onClick={() => setShowAddProductGroupModal(true)}
                                            disabled={isDisabled}
                                            sx={{ minWidth: 38, width: 38, height: 38, p: 0, flexShrink: 0 }}
                                            title='Add Product Group'
                                        >
                                            <i className='tabler-plus' />
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Controller
                                            name={`products.${index}.maker_name`}
                                            control={control}
                                            render={({ field }) => (
                                                <CustomTextField
                                                    {...field}
                                                    fullWidth
                                                    label='Maker Name'
                                                    placeholder='Enter maker...'
                                                    autoComplete='off'
                                                    disabled={isDisabled}
                                                    {...(errors.products?.[index]?.maker_name && {
                                                        error: true,
                                                        helperText: errors.products[index]?.maker_name?.message
                                                    })}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Controller
                                            name={`products.${index}.product_name`}
                                            control={control}
                                            render={({ field }) => (
                                                <CustomTextField
                                                    {...field}
                                                    fullWidth
                                                    label='Product Name'
                                                    placeholder='Enter product...'
                                                    autoComplete='off'
                                                    disabled={isDisabled}
                                                    {...(errors.products?.[index]?.product_name && {
                                                        error: true,
                                                        helperText: errors.products[index]?.product_name?.message
                                                    })}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Controller
                                            name={`products.${index}.model_list`}
                                            control={control}
                                            render={({ field }) => (
                                                <CustomTextField
                                                    {...field}
                                                    fullWidth
                                                    multiline
                                                    label='Model List'
                                                    placeholder='Enter each model...'
                                                    autoComplete='off'
                                                    disabled={isDisabled}
                                                    {...(errors.products?.[index]?.model_list && {
                                                        error: true,
                                                        helperText: errors.products[index]?.model_list?.message
                                                    })}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                <Grid item xs={12}>
                    <Button
                        variant='outlined'
                        color='primary'
                        onClick={handleAddProduct}
                        disabled={isDisabled}
                        startIcon={<i className='tabler-plus' />}
                    >
                        Add Product
                    </Button>
                </Grid>
            </Grid>
            <AddProductGroupModal
                open={showAddProductGroupModal}
                onClose={() => setShowAddProductGroupModal(false)}
                onSuccess={handleProductGroupAdded}
            />
        </>
    )
}

export default SectionProducts

// React Imports
import { useState } from 'react'
import { Controller, useFormContext, useFormState, useFieldArray } from 'react-hook-form'

// MUI Imports
import { Grid, Button, IconButton, Typography, Card, CardContent, Divider } from '@mui/material'

// Components Imports
import CustomTextField from '@components/mui/TextField'
import SelectCustom from '@/components/react-select/SelectCustom'
import AddProductGroupModal from './modal/AddProductGroupModal'

// Types
import type { AddVendorFormData } from './validateSchema'
import { defaultProductValues } from './validateSchema'

interface SectionProductsProps {
    isDisabled: boolean
    productGroupOptions: { value: number; label: string }[]
    onProductGroupAdded?: () => void
}

const SectionProducts = ({ isDisabled, productGroupOptions, onProductGroupAdded }: SectionProductsProps) => {
    // States
    const [showAddProductGroupModal, setShowAddProductGroupModal] = useState(false)

    // Hooks : react-hook-form
    const { control, setValue } = useFormContext<AddVendorFormData>()
    const { errors } = useFormState({ control })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'products'
    })

    // Functions
    const handleAddProduct = () => {
        append({ ...defaultProductValues })
    }

    const handleProductGroupAdded = () => {
        onProductGroupAdded?.()
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
                                                <IconButton
                                                    size='small'
                                                    color='error'
                                                    onClick={() => remove(index)}
                                                    disabled={isDisabled}
                                                >
                                                    <i className='tabler-trash text-lg' />
                                                </IconButton>
                                            )}
                                        </Grid>
                                        <Divider sx={{ mt: 1, mb: 2 }} />
                                    </Grid>

                                    <Grid item xs={12} sm={6} md={3}>
                                        <Controller
                                            name={`products.${index}.product_group_id`}
                                            control={control}
                                            render={({ field: fieldCtrl }) => (
                                                <SelectCustom
                                                    label='Product Group'
                                                    value={productGroupOptions.find(opt => opt.value === fieldCtrl.value) || null}
                                                    onChange={(selected: any) => {
                                                        fieldCtrl.onChange(selected?.value || 0)
                                                        setValue(`products.${index}.product_group_name`, selected?.label || '')
                                                    }}
                                                    options={productGroupOptions}
                                                    isClearable
                                                    isDisabled={isDisabled}
                                                    placeholder='Select group...'
                                                    classNamePrefix='select'
                                                    {...(errors.products?.[index]?.product_group_id && {
                                                        error: true,
                                                        helperText: 'Product Group is required'
                                                    })}
                                                />
                                            )}
                                        />
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
                                                    rows={3}
                                                    label='Model List'
                                                    placeholder='Enter each model on a new line...'
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
                                    <Grid item>
                                        <Button
                                            variant='tonal'
                                            color='secondary'
                                            onClick={() => setShowAddProductGroupModal(true)}
                                            disabled={isDisabled}
                                            startIcon={<i className='tabler-folder-plus' />}
                                        >
                                            Add Product Group
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item>
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
                </Grid>
            </Grid>

            {/* Add Product Group Modal */}
            <AddProductGroupModal
                open={showAddProductGroupModal}
                onClose={() => setShowAddProductGroupModal(false)}
                onSuccess={handleProductGroupAdded}
            />
        </>
    )
}

export default SectionProducts

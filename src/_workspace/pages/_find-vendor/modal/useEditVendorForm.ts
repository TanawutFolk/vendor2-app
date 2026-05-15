import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import {
    PREFIX_QUERY_KEY,
    getVendorDetailQueryConfig,
    useGetVendor,
    useUpdateVendor,
} from '@_workspace/react-query/hooks/vendor/useFindVendor'

import type { UpdateVendorParamsI, VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import { editVendorSchema, type EditVendorSchemaType } from './validateSchema'

type UseEditVendorFormArgs = {
    open: boolean
    vendorId: number | null
    rowData?: Partial<VendorComprehensiveI>
    forceRefreshOnEdit?: boolean
    initialMode?: 'view' | 'edit'
    onClose: () => void
    onSaveSuccess?: () => void
}

const emptyDefaultValues: EditVendorSchemaType = {
    company_name: '',
    vendor_type_id: null,
    vendor_type_name: '',
    contacts: [],
    products: [],
}

const normalizeContactAuditFields = (contact: any) => ({
    ...contact,
    CREATE_BY: contact?.CREATE_BY ?? contact?.contact_create_by ?? '',
    UPDATE_BY: contact?.UPDATE_BY ?? contact?.contact_update_by ?? '',
    CREATE_DATE: contact?.CREATE_DATE ?? contact?.contact_create_date ?? '',
    UPDATE_DATE: contact?.UPDATE_DATE ?? contact?.contact_update_date ?? '',
})

const normalizeProductAuditFields = (product: any) => ({
    ...product,
    CREATE_BY: product?.CREATE_BY ?? product?.product_create_by ?? '',
    UPDATE_BY: product?.UPDATE_BY ?? product?.product_update_by ?? '',
    CREATE_DATE: product?.CREATE_DATE ?? product?.product_create_date ?? '',
    UPDATE_DATE: product?.UPDATE_DATE ?? product?.product_update_date ?? '',
})

const toComprehensiveFromRowData = (rowData: Partial<VendorComprehensiveI>): VendorComprehensiveI => ({
    vendor_id: rowData.vendor_id ?? 0,
    fft_vendor_code: rowData.fft_vendor_code,
    fft_status: rowData.fft_status,
    status_check: rowData.status_check,
    reject_reason: rowData.reject_reason,
    company_name: rowData.company_name ?? '',
    vendor_type_id: rowData.vendor_type_id,
    vendor_type_name: rowData.vendor_type_name ?? '',
    province: rowData.province ?? '',
    postal_code: rowData.postal_code ?? '',
    website: rowData.website ?? '',
    address: rowData.address ?? '',
    tel_center: rowData.tel_center ?? '',
    emailmain: rowData.emailmain,
    vendor_region: rowData.vendor_region,
    contacts: Array.isArray(rowData.contacts) ? rowData.contacts.map(normalizeContactAuditFields) : [],
    products: Array.isArray(rowData.products) ? rowData.products.map(normalizeProductAuditFields) : [],
    CREATE_BY: rowData.CREATE_BY ?? '',
    UPDATE_BY: rowData.UPDATE_BY ?? '',
    CREATE_DATE: rowData.CREATE_DATE ?? '',
    UPDATE_DATE: rowData.UPDATE_DATE ?? '',
    INUSE: rowData.INUSE ?? 1,
})

const cloneVendorData = (data: VendorComprehensiveI): VendorComprehensiveI => {
    if (typeof structuredClone === 'function') return structuredClone(data)
    return JSON.parse(JSON.stringify(data))
}

export const useEditVendorForm = ({
    open,
    vendorId,
    rowData,
    forceRefreshOnEdit = false,
    initialMode = 'view',
    onClose,
    onSaveSuccess,
}: UseEditVendorFormArgs) => {
    const [editingMode, setEditingMode] = useState<'view' | 'edit'>(initialMode)
    const [isInitializing, setIsInitializing] = useState(false)
    const [originalData, setOriginalData] = useState<VendorComprehensiveI | null>(null)
    const [showAddProductGroupModal, setShowAddProductGroupModal] = useState(false)
    const [productGroupRefreshKey, setProductGroupRefreshKey] = useState(0)
    const [deletedContactIds, setDeletedContactIds] = useState<number[]>([])
    const [deletedProductIds, setDeletedProductIds] = useState<number[]>([])

    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [vendorFftCode, setVendorFftCode] = useState<string | null | undefined>(null)
    const [vendorStatusCheck, setVendorStatusCheck] = useState<string | undefined>(undefined)

    const isRowDataComprehensive = useMemo(() => {
        if (!rowData) return false

        const hasCollections = Array.isArray(rowData.contacts) && Array.isArray(rowData.products)
        const hasCoreFields =
            typeof rowData.company_name === 'string' &&
            rowData.company_name.trim().length > 0 &&
            rowData.vendor_type_id !== undefined

        return hasCollections && hasCoreFields
    }, [rowData])

    const shouldFetchVendorOnEdit = !!vendorId && (forceRefreshOnEdit || !isRowDataComprehensive)
    const isFetchEnabled = open && editingMode === 'edit' && shouldFetchVendorOnEdit
    const { data: vendorQueryData, isLoading: isLoadingVendor, isFetching: isFetchingVendor } = useGetVendor(vendorId, isFetchEnabled)
    const queryClient = useQueryClient()

    const formMethods = useForm<EditVendorSchemaType>({
        resolver: zodResolver(editVendorSchema),
        defaultValues: emptyDefaultValues,
    })

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        getValues,
        setValue,
        trigger,
    } = formMethods

    const { fields: contactFields, append: appendContact, remove: removeContactField } = useFieldArray({
        control,
        name: 'contacts',
    })

    const { fields: productFields, append: appendProduct, remove: removeProductField } = useFieldArray({
        control,
        name: 'products',
    })

    const updateVendor = useUpdateVendor(
        (_data: unknown, variables: UpdateVendorParamsI) => {
            const hasCollectionStructureChange =
                variables.data.contacts?.some((contact: { vendor_contact_id?: number }) => !contact.vendor_contact_id) ||
                variables.data.products?.some((product: { vendor_product_id?: number }) => !product.vendor_product_id) ||
                variables.deletedContactIds.length > 0 ||
                variables.deletedProductIds.length > 0

            if (hasCollectionStructureChange) {
                queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY, 'DETAIL', variables.vendorId], exact: true })
            } else {
                const savedComprehensive: VendorComprehensiveI = {
                    ...variables.originalData,
                    ...variables.data,
                    vendor_id: variables.vendorId,
                    contacts: variables.data.contacts ?? [],
                    products: variables.data.products ?? [],
                }

                setOriginalData(cloneVendorData(savedComprehensive))
                reset(savedComprehensive)
                queryClient.setQueryData([PREFIX_QUERY_KEY, 'DETAIL', variables.vendorId], (current: unknown) => {
                    if (!current || typeof current !== 'object') return current
                    return { ...current, comprehensive: savedComprehensive }
                })
            }

            setDeletedContactIds([])
            setDeletedProductIds([])

            onSaveSuccess?.()
            setEditingMode(initialMode)
        },
        (_err: Error) => {}
    )

    const loading = editingMode === 'edit' && (
        isInitializing ||
        (!originalData && open && !!vendorId) ||
        (shouldFetchVendorOnEdit && (isLoadingVendor || (!vendorQueryData && isFetchingVendor)))
    )
    const saving = updateVendor.isPending

    useEffect(() => {
        if (!vendorId) return

        reset(emptyDefaultValues)
        setOriginalData(null)
        setVendorFftCode(null)
        setVendorStatusCheck(undefined)
        setDeletedContactIds([])
        setDeletedProductIds([])
        setEditingMode(initialMode)
        setIsInitializing(false)

        if (rowData && !shouldFetchVendorOnEdit) {
            const comprehensive = toComprehensiveFromRowData(rowData)
            setOriginalData(cloneVendorData(comprehensive))
            reset(comprehensive)
            setVendorFftCode(comprehensive.fft_vendor_code)
            setVendorStatusCheck(comprehensive.status_check)
        } else if (rowData) {
            setVendorFftCode(rowData.fft_vendor_code)
            setVendorStatusCheck(rowData.status_check)
        }
    }, [vendorId, rowData, reset, initialMode, shouldFetchVendorOnEdit])

    useEffect(() => {
        if (vendorQueryData && open && editingMode === 'edit' && shouldFetchVendorOnEdit) {
            const { comprehensive } = vendorQueryData

            if (
                originalData &&
                originalData.vendor_id === comprehensive.vendor_id &&
                originalData.UPDATE_DATE === comprehensive.UPDATE_DATE
            ) {
                setIsInitializing(false)
                return
            }

            setOriginalData(cloneVendorData(comprehensive))
            reset(comprehensive)

            setVendorFftCode(comprehensive.fft_vendor_code)
            setVendorStatusCheck(comprehensive.status_check)
            setDeletedContactIds([])
            setDeletedProductIds([])
            setIsInitializing(false)
        }
    }, [vendorQueryData, open, reset, editingMode, originalData, shouldFetchVendorOnEdit])

    useEffect(() => {
        if (editingMode === 'edit' && !shouldFetchVendorOnEdit) {
            setIsInitializing(false)
        }
    }, [editingMode, shouldFetchVendorOnEdit])

    useEffect(() => {
        if (!open || !vendorId || !shouldFetchVendorOnEdit || editingMode === 'edit') {
            return
        }

        queryClient.prefetchQuery(getVendorDetailQueryConfig(vendorId))
    }, [open, vendorId, shouldFetchVendorOnEdit, editingMode, queryClient])

    const onSubmit = useCallback(
        async (data: EditVendorSchemaType) => {
            if (!vendorId || !originalData) return

            const userCode = getUserData()?.EMPLOYEE_CODE || 'SYSTEM'

            updateVendor.mutate({
                vendorId,
                data,
                originalData,
                deletedContactIds,
                deletedProductIds,
                userCode,
            })
        },
        [vendorId, originalData, deletedContactIds, deletedProductIds, updateVendor]
    )

    const toggleEditMode = () => {
        setEditingMode(prev => {
            if (prev === 'view') {
                if (forceRefreshOnEdit && vendorId) {
                    queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY, 'DETAIL', vendorId] })
                }
                setIsInitializing(shouldFetchVendorOnEdit)
                return 'edit'
            }

            setIsInitializing(false)
            return 'view'
        })
    }

    const handleSaveClick = async () => {
        const isValid = await trigger()
        if (isValid) {
            setConfirmModalOpen(true)
        }
    }

    const handleConfirmSave = async () => {
        setConfirmModalOpen(false)
        await handleSubmit(onSubmit)()
    }

    const handleClose = () => {
        reset(emptyDefaultValues)
        setEditingMode(initialMode)
        setIsInitializing(false)
        setDeletedContactIds([])
        setDeletedProductIds([])
        onClose()
    }

    const handleProductGroupAdded = () => {
        setProductGroupRefreshKey(prev => prev + 1)
    }

    const removeContact = (index: number) => {
        const contact = getValues(`contacts.${index}`)
        const contactId = contact?.vendor_contact_id
        if (typeof contactId === 'number') {
            setDeletedContactIds(prev => [...prev, contactId])
        }
        removeContactField(index)
    }

    const removeProduct = (index: number) => {
        const product = getValues(`products.${index}`)
        const productId = product?.vendor_product_id
        if (typeof productId === 'number') {
            setDeletedProductIds(prev => [...prev, productId])
        }
        removeProductField(index)
    }

    return {
        formMethods,
        control,
        errors,
        getValues,
        setValue,

        editingMode,
        isInitializing,
        loading,
        saving,
        originalData,
        vendorFftCode,
        vendorStatusCheck,

        contactFields,
        productFields,
        appendContact,
        appendProduct,
        removeContact,
        removeProduct,

        showAddProductGroupModal,
        setShowAddProductGroupModal,
        productGroupRefreshKey,

        confirmModalOpen,
        setConfirmModalOpen,

        toggleEditMode,
        handleSaveClick,
        handleConfirmSave,
        handleClose,
        handleProductGroupAdded,
    }
}

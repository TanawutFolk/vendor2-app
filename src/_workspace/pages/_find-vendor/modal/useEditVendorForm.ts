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

import type { VendorComprehensiveI } from '@_workspace/types/_find-vendor/FindVendorTypes'
import { editVendorSchema, type EditVendorSchemaType } from './validateSchema'

type UseEditVendorFormArgs = {
    open: boolean
    vendorId: number | null
    rowData?: any
    forceRefreshOnEdit?: boolean
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

const toComprehensiveFromRowData = (rowData: any): VendorComprehensiveI => ({
    vendor_id: rowData.vendor_id,
    fft_vendor_code: rowData.fft_vendor_code,
    fft_status: rowData.fft_status,
    status_check: rowData.status_check,
    reject_reason: rowData.reject_reason,
    company_name: rowData.company_name,
    vendor_type_id: rowData.vendor_type_id,
    vendor_type_name: rowData.vendor_type_name,
    province: rowData.province,
    postal_code: rowData.postal_code,
    website: rowData.website,
    address: rowData.address,
    tel_center: rowData.tel_center,
    emailmain: rowData.emailmain,
    vendor_region: rowData.vendor_region,
    contacts: rowData.contacts || [],
    products: rowData.products || [],
    CREATE_BY: rowData.CREATE_BY,
    UPDATE_BY: rowData.UPDATE_BY,
    CREATE_DATE: rowData.CREATE_DATE,
    UPDATE_DATE: rowData.UPDATE_DATE,
    INUSE: rowData.INUSE,
})

export const useEditVendorForm = ({
    open,
    vendorId,
    rowData,
    forceRefreshOnEdit = false,
    onClose,
    onSaveSuccess,
}: UseEditVendorFormArgs) => {
    const [editingMode, setEditingMode] = useState<'view' | 'edit'>('view')
    const [isInitializing, setIsInitializing] = useState(false)
    const [originalData, setOriginalData] = useState<VendorComprehensiveI | null>(null)
    const [showAddProductGroupModal, setShowAddProductGroupModal] = useState(false)
    const [productGroupRefreshKey, setProductGroupRefreshKey] = useState(0)
    const [deletedContactIds, setDeletedContactIds] = useState<number[]>([])
    const [deletedProductIds, setDeletedProductIds] = useState<number[]>([])

    const [confirmModalOpen, setConfirmModalOpen] = useState(false)
    const [successModalOpen, setSuccessModalOpen] = useState(false)
    const [errorModalOpen, setErrorModalOpen] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState('')
    const [errorDetails, setErrorDetails] = useState<any>(null)
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
    const isFetchEnabled = editingMode === 'edit' && shouldFetchVendorOnEdit
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
        (data: any, variables: any) => {
            queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY, 'DETAIL', variables.vendorId] })
            queryClient.invalidateQueries({ queryKey: [PREFIX_QUERY_KEY] })

            setSuccessData(data)
            setSuccessModalOpen(true)
            onSaveSuccess?.()
            setEditingMode('view')
        },
        (err: any) => {
            setErrorMessage(err?.message || 'Failed to save changes')
            setErrorDetails(err)
            setErrorModalOpen(true)
        }
    )

    const loading = editingMode === 'edit' && (
        isInitializing ||
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
        setEditingMode('view')
        setIsInitializing(false)

        if (rowData) {
            const comprehensive = toComprehensiveFromRowData(rowData)
            setOriginalData(JSON.parse(JSON.stringify(comprehensive)))
            reset(comprehensive)
            setVendorFftCode(comprehensive.fft_vendor_code)
            setVendorStatusCheck(comprehensive.status_check)
        }
    }, [vendorId, rowData, reset])

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

            setOriginalData(JSON.parse(JSON.stringify(comprehensive)))
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

    const handleErrorRetry = () => {
        setErrorModalOpen(false)
        handleSubmit(onSubmit)()
    }

    const handleClose = () => {
        reset(emptyDefaultValues)
        setEditingMode('view')
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
        successModalOpen,
        setSuccessModalOpen,
        errorModalOpen,
        setErrorModalOpen,
        successData,
        errorMessage,
        errorDetails,

        toggleEditMode,
        handleSaveClick,
        handleConfirmSave,
        handleErrorRetry,
        handleClose,
        handleProductGroupAdded,
    }
}

import { useCallback, useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { useUpdateVendor } from '@/_workspace/react-query/hooks/useVendor'

import type { UpdateVendorParamsI, VendorComprehensiveI } from '@/_workspace/types/vendor/VendorTypes'
import { editVendorSchema, type EditVendorSchemaType } from './validateSchema'
import type { UseEditVendorFormArgs } from '@/_workspace/types/vendor/VendorTypes'

const emptyDefaultValues: EditVendorSchemaType = {
  company_name: '',
  vendor_type_id: null,
  vendor_type_name: '',
  country: '',
  contacts: [],
  products: []
}


const cloneVendorData = (data: VendorComprehensiveI): VendorComprehensiveI => {
  if (typeof structuredClone === 'function') return structuredClone(data)
  return JSON.parse(JSON.stringify(data))
}

export const useEditVendorForm = ({
  vendorId,
  rowData,
  updateRequest,
  initialMode = 'view',
  onClose,
  onSaveSuccess
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
  const [vendorStatusLabel, setVendorStatusLabel] = useState<string | undefined>(undefined)


  const formMethods = useForm<EditVendorSchemaType>({
    resolver: zodResolver(editVendorSchema),
    defaultValues: emptyDefaultValues
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
    setValue,
    trigger
  } = formMethods

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContactField
  } = useFieldArray({
    control,
    name: 'contacts'
  })

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProductField
  } = useFieldArray({
    control,
    name: 'products'
  })

  const updateVendor = useUpdateVendor(
    (_data: unknown, variables: UpdateVendorParamsI) => {
      ToastMessageSuccess({ title: 'Edit Vendor', message: 'Vendor updated successfully' })

      const savedComprehensive: VendorComprehensiveI = {
        ...variables.originalData,
        ...variables.data,
        vendor_id: variables.vendorId,
        contacts: variables.data.contacts ?? [],
        products: variables.data.products ?? []
      }

      setOriginalData(cloneVendorData(savedComprehensive))
      reset(savedComprehensive)

      setDeletedContactIds([])
      setDeletedProductIds([])

      onSaveSuccess?.()
      setEditingMode(initialMode)
    },
    (err: Error) => {
      ToastMessageError({ title: 'Edit Vendor', message: err?.message || 'Failed to update vendor' })
    }
  )

  const loading = editingMode === 'edit' && (isInitializing || (!originalData && !!rowData))
  const saving = updateVendor.isPending

  useEffect(() => {
    if (!vendorId) return

    reset(emptyDefaultValues)
    setOriginalData(null)
    setVendorFftCode(null)
    setVendorStatusLabel(undefined)
    setDeletedContactIds([])
    setDeletedProductIds([])
    setEditingMode(initialMode)
    setIsInitializing(false)

    if (rowData) {
      const comprehensive = cloneVendorData(rowData)
      setOriginalData(comprehensive)
      reset(comprehensive)
      setVendorFftCode(comprehensive.fft_vendor_code)
      setVendorStatusLabel(comprehensive.vendor_status_label)
    }
  }, [vendorId, rowData, reset, initialMode])


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
        updateRequest
      })
    },
    [vendorId, originalData, deletedContactIds, deletedProductIds, updateVendor, updateRequest]
  )

  const toggleEditMode = () => {
    setEditingMode(prev => {
      if (prev === 'view') {
        setIsInitializing(false)
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
    vendorStatusLabel,

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
    handleProductGroupAdded
  }
}

// Shared vendor-update orchestration for page-specific service endpoints.
import type {
  VendorComprehensiveI,
  VendorContactI,
  VendorProductI,
  UpdateVendorParamsI
} from '@/_workspace/types/vendor/VendorTypes'

export class EditVendorUtils {

  // Batch update vendor comprehensive data
  static async updateComprehensive({
    vendorId,
    data,
    originalData,
    deletedContactIds,
    deletedProductIds,
    userCode,
    updateRequest
  }: UpdateVendorParamsI): Promise<{
    vendor: any
    contacts: any[]
    products: any[]
    updateSummary: any
    changes: any
  }> {
    let updatedCount = 0

    // Helper: Check if vendor fields have changed
    const hasVendorFieldsChanged = (original: VendorComprehensiveI, current: any): boolean => {
      const vendorFields = [
        'company_name',
        'province',
        'postal_code',
        'country',
        'website',
        'address',
        'tel_center',
        'INUSE'
      ] as const
      if (vendorFields.some(field => (original as any)[field] != (current as any)[field])) return true
      if (original.vendor_type_id !== current.vendor_type_id) return true
      return false
    }

    // Helper: Get changed contacts
    const getChangedContacts = (original: VendorContactI[], current: any[]): VendorContactI[] => {
      if (!current) return []
      const changed: VendorContactI[] = []
      current.forEach(currentContact => {
        if (currentContact.vendor_contact_id) {
          const originalContact = original.find(c => c.vendor_contact_id === currentContact.vendor_contact_id)
          if (originalContact) {
            const hasChanged =
              currentContact.contact_name !== originalContact.contact_name ||
              currentContact.position !== originalContact.position ||
              currentContact.tel_phone !== originalContact.tel_phone ||
              currentContact.email !== originalContact.email
            if (hasChanged) {
              changed.push({ ...originalContact, ...currentContact } as VendorContactI)
            }
          }
        }
      })
      return changed
    }

    // Helper: Get changed products
    const getChangedProducts = (original: VendorProductI[], current: any[]): VendorProductI[] => {
      if (!current) return []
      const changed: VendorProductI[] = []
      current.forEach(currentProduct => {
        if (currentProduct.vendor_product_id) {
          const originalProduct = original.find(p => p.vendor_product_id === currentProduct.vendor_product_id)
          if (originalProduct) {
            const hasChanged =
              currentProduct.product_group_id !== originalProduct.product_group_id ||
              currentProduct.maker_name !== originalProduct.maker_name ||
              currentProduct.product_name !== originalProduct.product_name ||
              currentProduct.model_list !== originalProduct.model_list
            if (hasChanged) {
              changed.push({ ...originalProduct, ...currentProduct } as VendorProductI)
            }
          }
        }
      })
      return changed
    }

    const getNewContacts = (current: any[]) => current?.filter(c => !c.vendor_contact_id) || []
    const getNewProducts = (current: any[]) => current?.filter(p => !p.vendor_product_id) || []

    // Generate Summary Helper
    const generateChangesSummary = (original: VendorComprehensiveI, updated: any) => {
      const changes = {
        added: [] as Array<{ type: string; description: string }>,
        removed: [] as Array<{ type: string; description: string }>,
        modified: [] as Array<{ type: string; description: string; before?: string; after?: string }>
      }

      // 1. Vendor Fields
      const vendorFields = [
        { key: 'company_name', label: 'Company Name' },
        { key: 'vendor_type_name', label: 'Vendor Type' },
        { key: 'province', label: 'Province' },
        { key: 'postal_code', label: 'Postal Code' },
        { key: 'country', label: 'Country' },
        { key: 'website', label: 'Website' },
        { key: 'address', label: 'Address' },
        { key: 'tel_center', label: 'Tel Center' },
        { key: 'INUSE', label: 'Status (Active/Inactive)' } // Handle 1/0 formatting if needed
      ]

      vendorFields.forEach(field => {
        let originalValue = (original as any)[field.key]
        let updatedValue = (updated as any)[field.key]

        // Normalize null/undefined to empty string for comparison
        if (originalValue === null || originalValue === undefined) originalValue = ''
        if (updatedValue === null || updatedValue === undefined) updatedValue = ''

        // Special handling for INUSE
        if (field.key === 'INUSE') {
          originalValue = Number(originalValue) === 1 ? 'Active' : 'Inactive'
          updatedValue = Number(updatedValue) === 1 ? 'Active' : 'Inactive'
        }

        if (originalValue != updatedValue) {
          changes.modified.push({
            type: 'Company',
            description: field.label,
            before: String(originalValue),
            after: String(updatedValue)
          })
        }
      })

      // 2. Contacts
      // Added
      const newContactsList = getNewContacts(updated.contacts)
      newContactsList.forEach(c =>
        changes.added.push({ type: 'Contact', description: c.contact_name || 'New Contact' })
      )

      // Modified
      const modContacts = getChangedContacts(original.contacts, updated.contacts)
      modContacts.forEach(currentContact => {
        const originalContact = original.contacts.find(c => c.vendor_contact_id === currentContact.vendor_contact_id)
        if (originalContact) {
          const contactFields = [
            { key: 'contact_name', label: 'Name' },
            { key: 'position', label: 'Position' },
            { key: 'tel_phone', label: 'Phone' },
            { key: 'email', label: 'Email' }
          ]

          contactFields.forEach(field => {
            let oldValue = (originalContact as any)[field.key]
            let newValue = (currentContact as any)[field.key]

            if (oldValue === null || oldValue === undefined) oldValue = ''
            if (newValue === null || newValue === undefined) newValue = ''

            if (oldValue != newValue) {
              changes.modified.push({
                type: 'Contact',
                description: field.label,
                before: String(oldValue),
                after: String(newValue)
              })
            }
          })
        }
      })

      // Removed
      deletedContactIds.forEach(id => {
        const c = original.contacts.find(x => x.vendor_contact_id === id)
        if (c) changes.removed.push({ type: 'Contact', description: c.contact_name })
      })

      // 3. Products
      // Added
      const newProductsList = getNewProducts(updated.products)
      newProductsList.forEach(p =>
        changes.added.push({ type: 'Product', description: p.product_name || 'New Product' })
      )

      // Modified
      const modProducts = getChangedProducts(original.products, updated.products)
      modProducts.forEach(currentProduct => {
        const originalProduct = original.products.find(p => p.vendor_product_id === currentProduct.vendor_product_id)
        if (originalProduct) {
          const productFields = [
            { key: 'product_group_id', label: 'Product Group' },
            { key: 'maker_name', label: 'Maker' },
            { key: 'product_name', label: 'Product Name' },
            { key: 'model_list', label: 'Model List' }
          ]

          productFields.forEach(field => {
            let oldValue = (originalProduct as any)[field.key]
            let newValue = (currentProduct as any)[field.key]

            if (oldValue === null || oldValue === undefined) oldValue = ''
            if (newValue === null || newValue === undefined) newValue = ''

            if (oldValue != newValue) {
              changes.modified.push({
                type: 'Product',
                description: field.label,
                before: String(oldValue),
                after: String(newValue)
              })
            }
          })
        }
      })

      // Removed
      deletedProductIds.forEach(id => {
        const p = original.products.find(x => x.vendor_product_id === id)
        if (p) changes.removed.push({ type: 'Product', description: p.product_name })
      })

      return changes
    }

    const vendorChanged = hasVendorFieldsChanged(originalData, data)
    const changedContacts = getChangedContacts(originalData.contacts, data.contacts)
    const changedProducts = getChangedProducts(originalData.products, data.products)
    const newContacts = getNewContacts(data.contacts)
    const newProducts = getNewProducts(data.products)
    updatedCount =
      (vendorChanged ? 1 : 0) +
      changedContacts.length +
      changedProducts.length +
      newContacts.length +
      newProducts.length +
      deletedContactIds.length +
      deletedProductIds.length

    if (updatedCount === 0) {
      throw new Error('No changes detected')
    }

    const res = await updateRequest({
      VENDORS_ID: vendorId,
      VENDOR: {
        COMPANY_NAME: data.company_name,
        MASTER_VENDOR_TYPES_ID: data.vendor_type_id ?? null,
        VENDOR_REGION: data.vendor_region ?? null,
        PROVINCE: data.province ?? '',
        POSTAL_CODE: data.postal_code ?? '',
        COUNTRY: data.country ?? '',
        WEBSITE: data.website ?? '',
        ADDRESS: data.address ?? '',
        TEL_CENTER: data.tel_center ?? '',
        EMAILMAIN: data.emailmain ?? '',
        INUSE: data.INUSE !== undefined ? data.INUSE : undefined
      },
      CONTACTS: [...changedContacts, ...newContacts].map(contact => ({
        VENDOR_CONTACTS_ID: contact.vendor_contact_id,
        CONTACT_NAME: contact.contact_name,
        POSITION: contact.position,
        TEL_PHONE: contact.tel_phone,
        EMAIL: contact.email,
        CREATE_BY: contact.CREATE_BY,
        UPDATE_BY: contact.UPDATE_BY,
        CREATE_DATE: contact.CREATE_DATE,
        UPDATE_DATE: contact.UPDATE_DATE
      })),
      PRODUCTS: [...changedProducts, ...newProducts].map(product => ({
        VENDOR_PRODUCTS_ID: product.vendor_product_id,
        MASTER_PRODUCT_GROUPS_ID: product.product_group_id,
        GROUP_NAME: product.group_name,
        MAKER_NAME: product.maker_name,
        PRODUCT_NAME: product.product_name,
        MODEL_LIST: product.model_list,
        CREATE_BY: product.CREATE_BY,
        UPDATE_BY: product.UPDATE_BY,
        CREATE_DATE: product.CREATE_DATE,
        UPDATE_DATE: product.UPDATE_DATE
      })),
      DELETED_CONTACT_IDS: deletedContactIds,
      DELETED_PRODUCT_IDS: deletedProductIds,
      VENDOR_CHANGED: vendorChanged,
      UPDATE_BY: userCode
    })

    if (!res.data.Status) throw new Error(res.data.Message || 'Vendor batch update failed')

    // Prepare success data
    const changes = generateChangesSummary(originalData, data)
    return {
      vendor: data,
      contacts: data.contacts,
      products: data.products,
      updateSummary: {
        vendor: vendorChanged ? 1 : 0,
        contacts: changedContacts.length + newContacts.length,
        products: changedProducts.length + newProducts.length,
        successful: updatedCount,
        total: updatedCount
      },
      changes
    }
  }
}

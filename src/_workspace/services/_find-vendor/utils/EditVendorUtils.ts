import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type {
    VendorComprehensiveI,
    VendorResultI,
    VendorContactI,
    VendorProductI,
    VendorUpdateRequestI,
    UpdateVendorParamsI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

export class EditVendorUtils {

    // Get comprehensive vendor data by searching all records of a company
    static async getComprehensiveByVendorId(vendor_id: number): Promise<{
        vendor: VendorResultI,
        contacts: VendorResultI[],
        products: VendorResultI[],
        comprehensive: VendorComprehensiveI
    }> {
        // Get basic vendor info first
        const vendorResponse = await FindVendorServices.getById(vendor_id)
        if (!vendorResponse.data.Status) {
            throw new Error('Vendor not found')
        }

        const vendorData = vendorResponse.data.ResultOnDb

        // Search for all records with the same company name to get all contacts and products
        const searchResponse = await FindVendorServices.search({
            SearchFilters: [
                { id: 'company_name', value: vendorData.company_name },
                { id: 'vendor_type_id', value: null },
                { id: 'province', value: '' },
                { id: 'group_name', value: '' },
                { id: 'status', value: '' },
                { id: 'product_name', value: '' },
                { id: 'maker_name', value: '' },
                { id: 'model_list', value: '' },
                { id: 'inuseForSearch', value: '' }
            ],
            ColumnFilters: [],
            Limit: 1000, // Get all records
            Order: [{ id: 'company_name', desc: false }],
            Start: 0
        })

        if (!searchResponse.data.Status) {
            throw new Error('Failed to search comprehensive data')
        }

        const allRecords = searchResponse.data.ResultOnDb

        // Extract unique contacts (by contact info)
        const contactsMap = new Map<string, VendorResultI>()
        allRecords.forEach(record => {
            if (record.contact_name || record.tel_phone || record.email) {
                const contactKey = `${record.contact_name || ''}_${record.tel_phone || ''}_${record.email || ''}`
                if (!contactsMap.has(contactKey)) {
                    contactsMap.set(contactKey, record)
                }
            }
        })

        // Extract unique products (by product info)
        const productsMap = new Map<string, VendorResultI>()
        allRecords.forEach(record => {
            if (record.product_name || record.maker_name) {
                const productKey = `${record.product_name || ''}_${record.maker_name || ''}`
                if (!productsMap.has(productKey)) {
                    productsMap.set(productKey, record)
                }
            }
        })

        const contactsList = Array.from(contactsMap.values())
        const productsList = Array.from(productsMap.values())

        // Transform to comprehensive format
        const allContacts: VendorContactI[] = contactsList.map(record => ({
            vendor_contact_id: record.vendor_contact_id,
            contact_name: record.contact_name || '',
            position: record.position || '',
            tel_phone: record.tel_phone || '',
            email: record.email || '',
            CREATE_BY: record.contact_create_by || '',
            UPDATE_BY: record.contact_update_by || '',
            CREATE_DATE: record.contact_create_date || '',
            UPDATE_DATE: record.contact_update_date || ''
        }))

        const allProducts: VendorProductI[] = productsList.map(record => ({
            vendor_product_id: record.vendor_product_id,
            product_group_id: record.product_group_id,
            group_name: record.group_name || '',
            maker_name: record.maker_name || '',
            product_name: record.product_name || '',
            model_list: record.model_list || '',
            UPDATE_BY: record.product_update_by || '',
            UPDATE_DATE: record.product_update_date || ''
        }))

        const comprehensive: VendorComprehensiveI = {
            vendor_id: vendorData.vendor_id,
            fft_vendor_code: vendorData.fft_vendor_code,
            fft_status: vendorData.fft_status,
            company_name: vendorData.company_name,
            vendor_type_id: vendorData.vendor_type_id,
            vendor_type_name: vendorData.vendor_type_name,
            province: vendorData.province,
            postal_code: vendorData.postal_code,
            website: vendorData.website,
            address: vendorData.address,
            tel_center: vendorData.tel_center,
            contacts: allContacts.length > 0 ? allContacts : [{
                vendor_contact_id: vendorData.vendor_contact_id,
                contact_name: vendorData.contact_name || '',
                position: vendorData.position || '',
                tel_phone: vendorData.tel_phone || '',
                email: vendorData.email || ''
            }],
            products: allProducts.length > 0 ? allProducts : [{
                vendor_product_id: vendorData.vendor_product_id,
                product_group_id: vendorData.product_group_id,
                group_name: vendorData.group_name || '',
                maker_name: vendorData.maker_name || '',
                product_name: vendorData.product_name || '',
                model_list: vendorData.model_list || ''
            }],
            CREATE_BY: vendorData.CREATE_BY,
            UPDATE_BY: vendorData.UPDATE_BY,
            CREATE_DATE: vendorData.CREATE_DATE,
            UPDATE_DATE: vendorData.UPDATE_DATE,
            INUSE: vendorData.INUSE
        }

        return {
            vendor: vendorData,
            contacts: contactsList,
            products: productsList,
            comprehensive
        }
    }

    // Batch update vendor comprehensive data
    static async updateComprehensive({ vendorId, data, originalData, deletedContactIds, deletedProductIds, userCode }: UpdateVendorParamsI): Promise<{
        vendor: any
        contacts: any[]
        products: any[]
        updateSummary: any
        changes: any
    }> {
        let updatedCount = 0

        // Helper: Check if vendor fields have changed
        const hasVendorFieldsChanged = (original: VendorComprehensiveI, current: any): boolean => {
            const vendorFields = ['company_name', 'province', 'postal_code', 'website', 'address', 'tel_center', 'INUSE'] as const
            if (vendorFields.some(field => (original as any)[field] != (current as any)[field])) return true
            if (original.vendor_type_id !== ((current.vendor_type_id as any)?.value || null)) return true
            return false
        }

        // Helper: Get changed contacts
        const getChangedContacts = (original: VendorContactI[], current: any[]): VendorContactI[] => {
            if (!current) return []
            const changed: VendorContactI[] = []
            current.forEach((currentContact) => {
                if (currentContact.vendor_contact_id) {
                    const originalContact = original.find(c => c.vendor_contact_id === currentContact.vendor_contact_id)
                    if (originalContact) {
                        const hasChanged = (
                            currentContact.contact_name !== originalContact.contact_name ||
                            currentContact.position !== originalContact.position ||
                            currentContact.tel_phone !== originalContact.tel_phone ||
                            currentContact.email !== originalContact.email
                        )
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
            current.forEach((currentProduct) => {
                if (currentProduct.vendor_product_id) {
                    const originalProduct = original.find(p => p.vendor_product_id === currentProduct.vendor_product_id)
                    if (originalProduct) {
                        const hasChanged = (
                            (currentProduct.product_group_id as any)?.value !== originalProduct.product_group_id ||
                            currentProduct.maker_name !== originalProduct.maker_name ||
                            currentProduct.product_name !== originalProduct.product_name ||
                            currentProduct.model_list !== originalProduct.model_list
                        )
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

            const vendorFields = [
                { key: 'company_name', label: 'Company Name' },
                { key: 'province', label: 'Province' },
                { key: 'postal_code', label: 'Postal Code' },
                { key: 'website', label: 'Website' },
                { key: 'address', label: 'Address' },
                { key: 'tel_center', label: 'Tel Center' }
            ]

            vendorFields.forEach(field => {
                const originalValue = (original as any)[field.key] || ''
                const updatedValue = (updated as any)[field.key] || ''
                if (originalValue != updatedValue) {
                    changes.modified.push({
                        type: 'Company',
                        description: field.label,
                        before: originalValue,
                        after: updatedValue
                    })
                }
            })
            return changes
        }

        // 1. Update vendor fields
        if (hasVendorFieldsChanged(originalData, data)) {
            const vendorUpdateData: VendorUpdateRequestI = {
                vendor_id: vendorId,
                company_name: data.company_name,
                vendor_type_id: (data.vendor_type_id as any)?.value || null,
                province: data.province ?? undefined,
                postal_code: data.postal_code ?? undefined,
                website: data.website ?? undefined,
                address: data.address ?? undefined,
                tel_center: data.tel_center ?? undefined,
                INUSE: data.INUSE ?? undefined,
                UPDATE_BY: userCode
            }
            const res = await FindVendorServices.update(vendorId, vendorUpdateData)
            if (!res.data.Status) throw new Error(`Vendor update failed: ${res.data.Message}`)
            updatedCount++
        }

        // 2. Update changed contacts
        const changedContacts = getChangedContacts(originalData.contacts, data.contacts)
        for (const contact of changedContacts) {
            const updateData: VendorUpdateRequestI = {
                vendor_id: vendorId,
                vendor_contact_id: contact.vendor_contact_id,
                contact_name: contact.contact_name,
                tel_phone: contact.tel_phone ?? undefined,
                email: contact.email ?? undefined,
                position: contact.position ?? undefined,
                UPDATE_BY: userCode
            }
            const res = await FindVendorServices.update(vendorId, updateData)
            if (!res.data.Status) throw new Error(`Contact update failed: ${res.data.Message}`)
            updatedCount++
        }

        // 3. Update changed products
        const changedProducts = getChangedProducts(originalData.products, data.products)
        for (const product of changedProducts) {
            const updateData: VendorUpdateRequestI = {
                vendor_id: vendorId,
                vendor_product_id: product.vendor_product_id,
                product_group_id: product.product_group_id ?? undefined,
                maker_name: product.maker_name ?? undefined,
                product_name: product.product_name,
                model_list: product.model_list ?? undefined,
                UPDATE_BY: userCode
            }
            const res = await FindVendorServices.update(vendorId, updateData)
            if (!res.data.Status) throw new Error(`Product update failed: ${res.data.Message}`)
            updatedCount++
        }

        // 4. Create new contacts
        const newContacts = getNewContacts(data.contacts)
        for (const contact of newContacts) {
            const createData: VendorUpdateRequestI = {
                vendor_id: vendorId,
                contact_name: contact.contact_name,
                tel_phone: contact.tel_phone ?? undefined,
                email: contact.email ?? undefined,
                position: contact.position ?? undefined,
                UPDATE_BY: userCode
            }
            const res = await FindVendorServices.update(vendorId, createData)
            if (!res.data.Status) throw new Error(`New contact failed: ${res.data.Message}`)
            updatedCount++
        }

        // 5. Create new products
        const newProducts = getNewProducts(data.products)
        for (const product of newProducts) {
            const createData: VendorUpdateRequestI = {
                vendor_id: vendorId,
                product_group_id: product.product_group_id ?? undefined,
                maker_name: product.maker_name ?? undefined,
                product_name: product.product_name,
                model_list: product.model_list ?? undefined,
                UPDATE_BY: userCode
            }
            const res = await FindVendorServices.update(vendorId, createData)
            if (!res.data.Status) throw new Error(`New product failed: ${res.data.Message}`)
            updatedCount++
        }

        if (updatedCount === 0) {
            throw new Error('No changes detected')
        }

        // Prepare success data
        const changes = generateChangesSummary(originalData, data)
        return {
            vendor: data,
            contacts: data.contacts,
            products: data.products,
            updateSummary: {
                vendor: hasVendorFieldsChanged(originalData, data) ? 1 : 0,
                contacts: changedContacts.length + newContacts.length,
                products: changedProducts.length + newProducts.length,
                successful: updatedCount,
                total: updatedCount
            },
            changes
        }
    }
}

import FindVendorServices from '@_workspace/services/_find-vendor/FindVendorServices'
import type {
    VendorComprehensiveI,
    VendorResultI,
    VendorContactI,
    VendorProductI,
    UpdateVendorParamsI
} from '@_workspace/types/_find-vendor/FindVendorTypes'

export class EditVendorUtils {
    private static normalizeContact(contact: any): VendorContactI {
        return {
            vendor_contact_id: contact?.VENDOR_CONTACT_ID ?? contact?.VENDOR_CONTACTS_ID,
            contact_name: contact?.CONTACT_NAME ?? '',
            position: contact?.POSITION ?? '',
            tel_phone: contact?.TEL_PHONE ?? '',
            email: contact?.EMAIL ?? '',
            CREATE_BY: contact?.CREATE_BY ?? contact?.CONTACT_CREATE_BY ?? '',
            UPDATE_BY: contact?.UPDATE_BY ?? contact?.CONTACT_UPDATE_BY ?? '',
            CREATE_DATE: contact?.CREATE_DATE ?? contact?.CONTACT_CREATE_DATE ?? '',
            UPDATE_DATE: contact?.UPDATE_DATE ?? contact?.CONTACT_UPDATE_DATE ?? '',
        }
    }

    private static normalizeProduct(product: any): VendorProductI {
        return {
            vendor_product_id: product?.VENDOR_PRODUCT_ID ?? product?.VENDOR_PRODUCTS_ID,
            product_group_id: product?.PRODUCT_GROUP_ID ?? product?.MASTER_PRODUCT_GROUPS_ID,
            group_name: product?.GROUP_NAME ?? '',
            maker_name: product?.MAKER_NAME ?? '',
            product_name: product?.PRODUCT_NAME ?? '',
            model_list: product?.MODEL_LIST ?? '',
            CREATE_BY: product?.CREATE_BY ?? product?.PRODUCT_CREATE_BY ?? '',
            UPDATE_BY: product?.UPDATE_BY ?? product?.PRODUCT_UPDATE_BY ?? '',
            CREATE_DATE: product?.CREATE_DATE ?? product?.PRODUCT_CREATE_DATE ?? '',
            UPDATE_DATE: product?.UPDATE_DATE ?? product?.PRODUCT_UPDATE_DATE ?? '',
        }
    }

    // Get comprehensive vendor data by searching all records of a company
    static async getComprehensiveByVendorId(vendor_id: number): Promise<{
        vendor: VendorResultI,
        contacts: VendorContactI[],
        products: VendorProductI[],
        comprehensive: VendorComprehensiveI
    }> {
        const vendorResponse = await FindVendorServices.getVendorDetails({ VENDORS_ID: vendor_id })
        if (!vendorResponse.data.Status) {
            throw new Error('Vendor not found')
        }

        const vendorData = vendorResponse.data.ResultOnDb
        const contactsList = Array.isArray(vendorData.CONTACTS)
            ? vendorData.CONTACTS.map(contact => this.normalizeContact(contact))
            : []
        const productsList = Array.isArray(vendorData.PRODUCTS)
            ? vendorData.PRODUCTS.map(product => this.normalizeProduct(product))
            : []

        const comprehensive: VendorComprehensiveI = {
            vendor_id: vendorData.VENDORS_ID,
            fft_vendor_code: vendorData.FFT_VENDOR_CODE,
            fft_status: vendorData.FFT_STATUS,
            status_check: vendorData.STATUS_CHECK,
            company_name: vendorData.COMPANY_NAME,
            vendor_type_id: vendorData.MASTER_VENDOR_TYPES_ID,
            vendor_type_name: vendorData.VENDOR_TYPE_NAME,
            province: vendorData.PROVINCE,
            postal_code: vendorData.POSTAL_CODE,
            country: vendorData.COUNTRY,
            website: vendorData.WEBSITE,
            address: vendorData.ADDRESS,
            tel_center: vendorData.TEL_CENTER,
            emailmain: vendorData.EMAILMAIN,
            vendor_region: vendorData.VENDOR_REGION,
            contacts: contactsList.length > 0 ? contactsList : [this.normalizeContact(vendorData)],
            products: productsList.length > 0 ? productsList : [this.normalizeProduct(vendorData)],
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
            const vendorFields = ['company_name', 'province', 'postal_code', 'country', 'website', 'address', 'tel_center', 'INUSE'] as const
            if (vendorFields.some(field => (original as any)[field] != (current as any)[field])) return true
            if (original.vendor_type_id !== current.vendor_type_id) return true
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
                            currentProduct.product_group_id !== originalProduct.product_group_id ||
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
            newContactsList.forEach(c => changes.added.push({ type: 'Contact', description: c.contact_name || 'New Contact' }))

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
            newProductsList.forEach(p => changes.added.push({ type: 'Product', description: p.product_name || 'New Product' }))

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
        updatedCount = (vendorChanged ? 1 : 0)
            + changedContacts.length
            + changedProducts.length
            + newContacts.length
            + newProducts.length
            + deletedContactIds.length
            + deletedProductIds.length

        if (updatedCount === 0) {
            throw new Error('No changes detected')
        }

        const res = await FindVendorServices.updateComprehensive({
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
                INUSE: data.INUSE !== undefined ? data.INUSE : undefined,
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
                UPDATE_DATE: contact.UPDATE_DATE,
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
                UPDATE_DATE: product.UPDATE_DATE,
            })),
            DELETED_CONTACT_IDS: deletedContactIds,
            DELETED_PRODUCT_IDS: deletedProductIds,
            VENDOR_CHANGED: vendorChanged,
            UPDATE_BY: userCode,
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




/**
 * ====================================================================================================
 * ðŸ“˜ MODULE: EditVendorUtils (English Documentation)
 * ====================================================================================================
 *
 * ðŸ“Œ OVERVIEW:
 * This utility class serves as the **Business Logic Facade** for the "Edit Vendor" functionality.
 * It abstracts complex data manipulation, aggregation, and orchestration logic away from the React Component layer (`EditVendorModal.tsx`).
 *
 * ----------------------------------------------------------------------------------------------------
 * ðŸ›  KEY RESPONSIBILITIES:
 * ----------------------------------------------------------------------------------------------------
 *
 * 1. ðŸ“¥ DATA AGGREGATION & NORMALIZATION (`getComprehensiveByVendorId`)
 *    ------------------------------------------------------------
 *    - **Problem**: Vendor data is scattered across multiple tables (Vendor, Contacts, Products).
 *      Fetching them individually requires handling multiple API states in the UI.
 *    - **Solution**: Fetches all related data in parallel (or sequence), normalizes null/undefined values,
 *      and returns a single `VendorComprehensiveI` object ready for Form binding.
 *    - **Key Logic**:
 *      - Fetches basic Vendor info.
 *      - Fetches ALL records via `search` API to find related contacts/products by Company Name.
 *      - Deduplicates contacts/products using Map to ensure uniqueness.
 *
 * 2. ðŸ”„ CHANGE DETECTION & DIFFING ALGORITHM (`updateComprehensive` internals)
 *    ------------------------------------------------------------
 *    - **Problem**: We need to know exactly WHAT changed to send optimized API calls.
 *      Sending everything every time is inefficient and risky.
 *    - **Solution**: Implements a strict diffing strategy:
 *      - **Vendor Fields**: Compares key fields (name, address, etc.) checking for value equality.
 *      - **Contacts/Products**:
 *        - `Added`: Item exists in Current but has no ID.
 *        - `Modified`: Item exists in both, ID matches, but fields differ.
 *        - `Removed`: ID exists in `deletedIds` array passed from UI.
 *
 * 3. ðŸš€ BATCH UPDATE ORCHESTRATION (`updateComprehensive`)
 *    ------------------------------------------------------------
 *    - **Execution Order** (Critical for Data Integrity):
 *      1. Update Vendor Details (Parent)
 *      2. Update Modified Contacts
 *      3. Update Modified Products
 *      4. Create New Contacts
 *      5. Create New Products
 *      6. Delete Removed Contacts (Soft Delete: INUSE=0)
 *      7. Delete Removed Products (Soft Delete: INUSE=0)
 *    - **Transaction-like Behavior**: If any step fails, the process halts and throws an error explaining which step failed.
 *
 * 4. ðŸ“ AUDIT LOG GENERATION (`generateChangesSummary`)
 *    ------------------------------------------------------------
 *    - **Purpose**: Generates a human-readable list of changes for the "Success Modal".
 *    - **Output**: { added: [], removed: [], modified: [{ field, before, after }] }
 *    - **Formatting**: Handles special formatting like `INUSE` (1/0 -> Active/Inactive).
 *
 * ----------------------------------------------------------------------------------------------------
 * âš ï¸ MAINTENANCE NOTES:
 * ----------------------------------------------------------------------------------------------------
 * 1. **Adding New Fields**: When adding a column to the database:
 *    - Add to `VendorComprehensiveI` interface.
 *    - Update `hasVendorFieldsChanged` to include the new field in the comparison array.
 *    - Update `generateChangesSummary` to provide a label for the Success Modal.
 *
 * 2. **Soft Delete**: Deletion logic for Contacts/Products uses `INUSE = 0`.
 *    Ensure the Backend API (`find-vendor/deleteContact`) supports this.
 *
 * 3. **Type Safety**: Avoid using `any` when possible. Maintain strict typing with `FindVendorTypes.ts`.
 *
 * ====================================================================================================
 */

/**
 * ====================================================================================================
 * ðŸ“˜ MODULE: EditVendorUtils (à¹€à¸­à¸à¸ªà¸²à¸£à¸ à¸²à¸©à¸²à¹„à¸—à¸¢)
 * ====================================================================================================
 *
 * ðŸ“Œ à¸ à¸²à¸žà¸£à¸§à¸¡ (Overview):
 * à¸„à¸¥à¸²à¸ªà¸™à¸µà¹‰à¸—à¸³à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¹€à¸›à¹‡à¸™à¸•à¸±à¸§à¸ˆà¸±à¸”à¸à¸²à¸£ Logic à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” (Business Logic Facade) à¸‚à¸­à¸‡à¸à¸²à¸£à¹à¸à¹‰à¹„à¸‚ Vendor
 * à¹‚à¸”à¸¢à¸¡à¸µà¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢à¹€à¸žà¸·à¹ˆà¸­à¹à¸¢à¸à¸„à¸§à¸²à¸¡à¸‹à¸±à¸šà¸‹à¹‰à¸­à¸™à¸‚à¸­à¸‡à¸à¸²à¸£à¸ˆà¸±à¸”à¸à¸²à¸£à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ à¸­à¸­à¸à¸ˆà¸²à¸à¸ªà¹ˆà¸§à¸™à¸à¸²à¸£à¹à¸ªà¸”à¸‡à¸œà¸¥ (UI) à¹ƒà¸™ `EditVendorModal.tsx`
 *
 * ----------------------------------------------------------------------------------------------------
 * ðŸ›  à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸«à¸¥à¸±à¸ (Key Responsibilities):
 * ----------------------------------------------------------------------------------------------------
 *
 * 1. ðŸ“¥ à¸à¸²à¸£à¸£à¸§à¸šà¸£à¸§à¸¡à¹à¸¥à¸°à¸ˆà¸±à¸”à¹€à¸•à¸£à¸µà¸¢à¸¡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ (`getComprehensiveByVendorId`)
 *    ------------------------------------------------------------
 *    - **à¸›à¸±à¸à¸«à¸²**: à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ Vendor à¸–à¸¹à¸à¹€à¸à¹‡à¸šà¹à¸¢à¸à¸«à¸¥à¸²à¸¢à¸•à¸²à¸£à¸²à¸‡ (Vendor, Contacts, Products) à¸—à¸³à¹ƒà¸«à¹‰à¸à¸²à¸£à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸¡à¸²à¹à¸ªà¸”à¸‡à¸œà¸¥à¸¡à¸µà¸„à¸§à¸²à¸¡à¸¢à¸¸à¹ˆà¸‡à¸¢à¸²à¸à¹à¸¥à¸°à¸‹à¸±à¸šà¸‹à¹‰à¸­à¸™à¹ƒà¸™à¸«à¸™à¹‰à¸² UI
 *    - **à¸—à¸²à¸‡à¹à¸à¹‰**: à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸—à¸µà¹ˆà¹€à¸à¸µà¹ˆà¸¢à¸§à¸‚à¹‰à¸­à¸‡à¸¡à¸²à¸£à¸§à¸¡à¸à¸±à¸™ à¸ˆà¸±à¸”à¸à¸²à¸£à¸„à¹ˆà¸²à¸§à¹ˆà¸²à¸‡ (Null/Undefined) à¹à¸¥à¸°à¸ªà¹ˆà¸‡à¸„à¸·à¸™à¹€à¸›à¹‡à¸™ Object à¹€à¸”à¸µà¸¢à¸§ (`VendorComprehensiveI`) à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰ Form à¹ƒà¸Šà¹‰à¸‡à¸²à¸™à¸‡à¹ˆà¸²à¸¢
 *    - **à¸«à¸¥à¸±à¸à¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™**:
 *      - à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ Vendor à¸«à¸¥à¸±à¸
 *      - à¸„à¹‰à¸™à¸«à¸²à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¹€à¸à¸µà¹ˆà¸¢à¸§à¸‚à¹‰à¸­à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸”à¹‰à¸§à¸¢à¸Šà¸·à¹ˆà¸­à¸šà¸£à¸´à¸©à¸±à¸— (à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰à¹„à¸”à¹‰ Contact/Product à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”)
 *      - à¸à¸£à¸­à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸‹à¹‰à¸³à¸­à¸­à¸à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰à¹„à¸”à¹‰à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡à¹à¸¡à¹ˆà¸™à¸¢à¸³à¸—à¸µà¹ˆà¸ªà¸¸à¸”
 *
 * 2. ðŸ”„ à¸£à¸°à¸šà¸šà¸•à¸£à¸§à¸ˆà¸ˆà¸±à¸šà¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡ (`updateComprehensive` internals)
 *    ------------------------------------------------------------
 *    - **à¸›à¸±à¸à¸«à¸²**: à¹€à¸£à¸²à¸•à¹‰à¸­à¸‡à¸£à¸¹à¹‰à¸§à¹ˆà¸² "à¸­à¸°à¹„à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹„à¸›à¸šà¹‰à¸²à¸‡" à¹€à¸žà¸·à¹ˆà¸­à¸—à¸µà¹ˆà¸ˆà¸°à¸ªà¹ˆà¸‡à¹€à¸‰à¸žà¸²à¸°à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¸ˆà¸³à¹€à¸›à¹‡à¸™à¹„à¸›à¸šà¸±à¸™à¸—à¸¶à¸ (à¸”à¸µà¸à¸§à¹ˆà¸²à¸ªà¹ˆà¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸‹à¸¶à¹ˆà¸‡à¸Šà¹‰à¸²à¹à¸¥à¸°à¹€à¸ªà¸µà¹ˆà¸¢à¸‡à¸•à¹ˆà¸­à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸´à¸”à¸žà¸¥à¸²à¸”)
 *    - **à¸—à¸²à¸‡à¹à¸à¹‰**: à¹ƒà¸Šà¹‰à¸£à¸°à¸šà¸šà¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥ (Diffing Strategy):
 *      - **à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸šà¸£à¸´à¸©à¸±à¸—**: à¹€à¸—à¸µà¸¢à¸šà¸„à¹ˆà¸²à¸‚à¸­à¸‡à¹à¸•à¹ˆà¸¥à¸°à¸Ÿà¸´à¸¥à¸”à¹Œà¸§à¹ˆà¸²à¸•à¸£à¸‡à¸à¸±à¸™à¹„à¸«à¸¡
 *      - **Contacts/Products**:
 *        - `à¹€à¸žà¸´à¹ˆà¸¡à¹ƒà¸«à¸¡à¹ˆ (Added)`: à¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸™à¸Šà¸¸à¸”à¹ƒà¸«à¸¡à¹ˆ à¹à¸•à¹ˆà¹„à¸¡à¹ˆà¸¡à¸µ ID
 *        - `à¹à¸à¹‰à¹„à¸‚ (Modified)`: à¸¡à¸µ ID à¸•à¸£à¸‡à¸à¸±à¸™ à¹à¸•à¹ˆà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸‚à¹‰à¸²à¸‡à¹ƒà¸™à¹„à¸¡à¹ˆà¹€à¸«à¸¡à¸·à¸­à¸™à¹€à¸”à¸´à¸¡
 *        - `à¸¥à¸š (Removed)`: ID à¸­à¸¢à¸¹à¹ˆà¹ƒà¸™à¸£à¸²à¸¢à¸à¸²à¸£à¸—à¸µà¹ˆà¸–à¸¹à¸à¸ªà¸±à¹ˆà¸‡à¸¥à¸š (deletedIds)
 *
 * 3. ðŸš€ à¸à¸²à¸£à¸ˆà¸±à¸”à¸à¸²à¸£à¸¥à¸³à¸”à¸±à¸šà¸à¸²à¸£à¸šà¸±à¸™à¸—à¸¶à¸ (`updateComprehensive`)
 *    ------------------------------------------------------------
 *    - **à¸¥à¸³à¸”à¸±à¸šà¸à¸²à¸£à¸—à¸³à¸‡à¸²à¸™** (à¸ªà¸³à¸„à¸±à¸à¸¡à¸²à¸à¹€à¸žà¸·à¹ˆà¸­à¸„à¸§à¸²à¸¡à¸–à¸¹à¸à¸•à¹‰à¸­à¸‡à¸‚à¸­à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥):
 *      1. à¸­à¸±à¸›à¹€à¸”à¸•à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ Vendor à¸«à¸¥à¸±à¸ (Parent)
 *      2. à¸­à¸±à¸›à¹€à¸”à¸• Contact à¸—à¸µà¹ˆà¸¡à¸µà¸à¸²à¸£à¹à¸à¹‰à¹„à¸‚
 *      3. à¸­à¸±à¸›à¹€à¸”à¸• Product à¸—à¸µà¹ˆà¸¡à¸µà¸à¸²à¸£à¹à¸à¹‰à¹„à¸‚
 *      4. à¸ªà¸£à¹‰à¸²à¸‡ Contact à¹ƒà¸«à¸¡à¹ˆ
 *      5. à¸ªà¸£à¹‰à¸²à¸‡ Product à¹ƒà¸«à¸¡à¹ˆ
 *      6. à¸¥à¸š Contact à¸—à¸µà¹ˆà¸ªà¸±à¹ˆà¸‡à¸¥à¸š (Soft Delete: INUSE=0)
 *      7. à¸¥à¸š Product à¸—à¸µà¹ˆà¸ªà¸±à¹ˆà¸‡à¸¥à¸š (Soft Delete: INUSE=0)
 *    - **à¸£à¸°à¸šà¸šà¸›à¹‰à¸­à¸‡à¸à¸±à¸™**: à¸–à¹‰à¸²à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¹„à¸«à¸™à¸žà¸±à¸‡ à¸£à¸°à¸šà¸šà¸ˆà¸°à¸«à¸¢à¸¸à¸”à¸—à¸±à¸™à¸—à¸µà¹à¸¥à¸°à¹à¸ˆà¹‰à¸‡ Error à¸à¸¥à¸±à¸šà¹„à¸›à¸­à¸¢à¹ˆà¸²à¸‡à¸Šà¸±à¸”à¹€à¸ˆà¸™à¸§à¹ˆà¸²à¸žà¸±à¸‡à¸—à¸µà¹ˆà¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¹„à¸«à¸™
 *
 * 4. ðŸ“ à¸à¸²à¸£à¸ªà¸£à¹‰à¸²à¸‡à¸ªà¸£à¸¸à¸›à¸£à¸²à¸¢à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡ (`generateChangesSummary`)
 *    ------------------------------------------------------------
 *    - **à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢**: à¸ªà¸£à¹‰à¸²à¸‡à¸ªà¸£à¸¸à¸›à¸£à¸²à¸¢à¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡à¸—à¸µà¹ˆà¸­à¹ˆà¸²à¸™à¸‡à¹ˆà¸²à¸¢ (à¹€à¸Šà¹ˆà¸™ "à¸Šà¸·à¹ˆà¸­à¸šà¸£à¸´à¸©à¸±à¸— à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸ˆà¸²à¸ A -> B") à¹€à¸žà¸·à¹ˆà¸­à¹à¸ªà¸”à¸‡à¹ƒà¸™ Success Modal à¹ƒà¸«à¹‰ User à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹„à¸”à¹‰
 *    - **à¸à¸²à¸£à¹à¸ªà¸”à¸‡à¸œà¸¥**: à¹à¸¢à¸à¹€à¸›à¹‡à¸™à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ (Added, Removed, Modified) à¹à¸¥à¸°à¹à¸›à¸¥à¸‡à¸„à¹ˆà¸² Code à¹€à¸›à¹‡à¸™à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸‡à¹ˆà¸²à¸¢ (à¹€à¸Šà¹ˆà¸™ INUSE 1/0 -> Active/Inactive)
 *
 * ----------------------------------------------------------------------------------------------------
 * âš ï¸ à¸‚à¹‰à¸­à¸„à¸§à¸£à¸£à¸°à¸§à¸±à¸‡à¸ªà¸³à¸«à¸£à¸±à¸šà¸œà¸¹à¹‰à¸”à¸¹à¹à¸¥ (Maintenance Notes):
 * ----------------------------------------------------------------------------------------------------
 * 1. **à¸à¸²à¸£à¹€à¸žà¸´à¹ˆà¸¡ Field à¹ƒà¸«à¸¡à¹ˆ**: à¸«à¸²à¸à¸¡à¸µà¸à¸²à¸£à¹€à¸žà¸´à¹ˆà¸¡à¸„à¸­à¸¥à¸±à¸¡à¸™à¹Œà¹ƒà¸™ Database à¸•à¹‰à¸­à¸‡à¸—à¸³à¸à¸²à¸£à¸­à¸±à¸›à¹€à¸”à¸• 3 à¸ˆà¸¸à¸”à¸«à¸¥à¸±à¸:
 *    - à¹€à¸žà¸´à¹ˆà¸¡à¹ƒà¸™ Interface `VendorComprehensiveI`
 *    - à¹€à¸žà¸´à¹ˆà¸¡à¹ƒà¸™à¸Ÿà¸±à¸‡à¸à¹Œà¸Šà¸±à¸™à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸à¸²à¸£à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹à¸›à¸¥à¸‡ `hasVendorFieldsChanged`
 *    - à¹€à¸žà¸´à¹ˆà¸¡à¸„à¸³à¸­à¸˜à¸´à¸šà¸²à¸¢à¹ƒà¸™à¸Ÿà¸±à¸‡à¸à¹Œà¸Šà¸±à¸™à¸ªà¸£à¸¸à¸›à¸œà¸¥ `generateChangesSummary` (à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰à¹à¸ªà¸”à¸‡ Label à¸–à¸¹à¸à¸•à¹‰à¸­à¸‡à¹ƒà¸™ Modal)
 *
 * 2. **à¸à¸²à¸£à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥ (Soft Delete)**:
 *    - à¸£à¸°à¸šà¸šà¹ƒà¸Šà¹‰ Soft Delete (à¸­à¸±à¸›à¹€à¸”à¸•à¸„à¹ˆà¸² `INUSE = 0`) à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¸¥à¸š Record à¸ˆà¸£à¸´à¸‡à¸­à¸­à¸à¸ˆà¸²à¸ Database
 *    - à¸•à¹‰à¸­à¸‡à¸¡à¸±à¹ˆà¸™à¹ƒà¸ˆà¸§à¹ˆà¸² API à¸«à¸¥à¸±à¸‡à¸šà¹‰à¸²à¸™ (`find-vendor/deleteContact`) à¸£à¸­à¸‡à¸£à¸±à¸š Logic à¸™à¸µà¹‰
 *
 * 3. **Validation & Typing**:
 *    - à¸žà¸¢à¸²à¸¢à¸²à¸¡à¹€à¸¥à¸µà¹ˆà¸¢à¸‡à¸à¸²à¸£à¹ƒà¸Šà¹‰ `any` à¹à¸¥à¸°à¹ƒà¸Šà¹‰ Type à¸—à¸µà¹ˆà¸à¸³à¸«à¸™à¸”à¹„à¸§à¹‰à¹ƒà¸™ `FindVendorTypes.ts` à¹€à¸ªà¸¡à¸­ à¹€à¸žà¸·à¹ˆà¸­à¸¥à¸” Human Error
 *
 * ====================================================================================================
 */

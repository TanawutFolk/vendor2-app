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
            vendor_contact_id: contact?.vendor_contact_id ?? contact?.VENDOR_CONTACT_ID,
            contact_name: contact?.contact_name ?? contact?.CONTACT_NAME ?? '',
            position: contact?.position ?? contact?.POSITION ?? '',
            tel_phone: contact?.tel_phone ?? contact?.TEL_PHONE ?? '',
            email: contact?.email ?? contact?.EMAIL ?? '',
            CREATE_BY: contact?.CREATE_BY ?? contact?.contact_create_by ?? '',
            UPDATE_BY: contact?.UPDATE_BY ?? contact?.contact_update_by ?? '',
            CREATE_DATE: contact?.CREATE_DATE ?? contact?.contact_create_date ?? '',
            UPDATE_DATE: contact?.UPDATE_DATE ?? contact?.contact_update_date ?? '',
        }
    }

    private static normalizeProduct(product: any): VendorProductI {
        return {
            vendor_product_id: product?.vendor_product_id ?? product?.VENDOR_PRODUCT_ID,
            product_group_id: product?.product_group_id ?? product?.PRODUCT_GROUP_ID,
            group_name: product?.group_name ?? product?.GROUP_NAME ?? '',
            maker_name: product?.maker_name ?? product?.MAKER_NAME ?? '',
            product_name: product?.product_name ?? product?.PRODUCT_NAME ?? '',
            model_list: product?.model_list ?? product?.MODEL_LIST ?? '',
            CREATE_BY: product?.CREATE_BY ?? product?.product_create_by ?? '',
            UPDATE_BY: product?.UPDATE_BY ?? product?.product_update_by ?? '',
            CREATE_DATE: product?.CREATE_DATE ?? product?.product_create_date ?? '',
            UPDATE_DATE: product?.UPDATE_DATE ?? product?.product_update_date ?? '',
        }
    }

    // Get comprehensive vendor data by searching all records of a company
    static async getComprehensiveByVendorId(vendor_id: number): Promise<{
        vendor: VendorResultI,
        contacts: VendorContactI[],
        products: VendorProductI[],
        comprehensive: VendorComprehensiveI
    }> {
        const vendorResponse = await FindVendorServices.getById(vendor_id)
        if (!vendorResponse.data.Status) {
            throw new Error('Vendor not found')
        }

        const vendorData = vendorResponse.data.ResultOnDb
        const contactsList = Array.isArray(vendorData.contacts)
            ? vendorData.contacts.map(contact => this.normalizeContact(contact))
            : []
        const productsList = Array.isArray(vendorData.products)
            ? vendorData.products.map(product => this.normalizeProduct(product))
            : []

        const comprehensive: VendorComprehensiveI = {
            vendor_id: vendorData.vendor_id ?? vendorData.VENDOR_ID,
            fft_vendor_code: vendorData.fft_vendor_code ?? vendorData.FFT_VENDOR_CODE,
            fft_status: vendorData.fft_status ?? vendorData.FFT_STATUS,
            status_check: vendorData.status_check ?? vendorData.STATUS_CHECK,
            company_name: vendorData.company_name ?? vendorData.COMPANY_NAME,
            vendor_type_id: vendorData.vendor_type_id ?? vendorData.VENDOR_TYPE_ID,
            vendor_type_name: vendorData.vendor_type_name ?? vendorData.VENDOR_TYPE_NAME,
            province: vendorData.province ?? vendorData.PROVINCE,
            postal_code: vendorData.postal_code ?? vendorData.POSTAL_CODE,
            website: vendorData.website ?? vendorData.WEBSITE,
            address: vendorData.address ?? vendorData.ADDRESS,
            tel_center: vendorData.tel_center ?? vendorData.TEL_CENTER,
            emailmain: vendorData.emailmain ?? vendorData.EMAILMAIN,
            vendor_region: vendorData.vendor_region ?? vendorData.VENDOR_REGION,
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
            const vendorFields = ['company_name', 'province', 'postal_code', 'website', 'address', 'tel_center', 'INUSE'] as const
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
            vendor_id: vendorId,
            vendor: {
                company_name: data.company_name,
                vendor_type_id: data.vendor_type_id ?? null,
                vendor_region: data.vendor_region ?? null,
                province: data.province ?? '',
                postal_code: data.postal_code ?? '',
                website: data.website ?? '',
                address: data.address ?? '',
                tel_center: data.tel_center ?? '',
                emailmain: data.emailmain ?? '',
                INUSE: data.INUSE !== undefined ? data.INUSE : undefined,
            },
            contacts: [...changedContacts, ...newContacts],
            products: [...changedProducts, ...newProducts],
            deleted_contact_ids: deletedContactIds,
            deleted_product_ids: deletedProductIds,
            vendor_changed: vendorChanged,
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
 * 📘 MODULE: EditVendorUtils (English Documentation)
 * ====================================================================================================
 * 
 * 📌 OVERVIEW:
 * This utility class serves as the **Business Logic Facade** for the "Edit Vendor" functionality.
 * It abstracts complex data manipulation, aggregation, and orchestration logic away from the React Component layer (`EditVendorModal.tsx`).
 * 
 * ----------------------------------------------------------------------------------------------------
 * 🛠 KEY RESPONSIBILITIES:
 * ----------------------------------------------------------------------------------------------------
 * 
 * 1. 📥 DATA AGGREGATION & NORMALIZATION (`getComprehensiveByVendorId`)
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
 * 2. 🔄 CHANGE DETECTION & DIFFING ALGORITHM (`updateComprehensive` internals)
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
 * 3. 🚀 BATCH UPDATE ORCHESTRATION (`updateComprehensive`)
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
 * 4. 📝 AUDIT LOG GENERATION (`generateChangesSummary`)
 *    ------------------------------------------------------------
 *    - **Purpose**: Generates a human-readable list of changes for the "Success Modal".
 *    - **Output**: { added: [], removed: [], modified: [{ field, before, after }] }
 *    - **Formatting**: Handles special formatting like `INUSE` (1/0 -> Active/Inactive).
 * 
 * ----------------------------------------------------------------------------------------------------
 * ⚠️ MAINTENANCE NOTES:
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
 * 📘 MODULE: EditVendorUtils (เอกสารภาษาไทย)
 * ====================================================================================================
 * 
 * 📌 ภาพรวม (Overview):
 * คลาสนี้ทำหน้าที่เป็นตัวจัดการ Logic ทั้งหมด (Business Logic Facade) ของการแก้ไข Vendor 
 * โดยมีเป้าหมายเพื่อแยกความซับซ้อนของการจัดการข้อมูล ออกจากส่วนการแสดงผล (UI) ใน `EditVendorModal.tsx`
 * 
 * ----------------------------------------------------------------------------------------------------
 * 🛠 หน้าที่หลัก (Key Responsibilities):
 * ----------------------------------------------------------------------------------------------------
 * 
 * 1. 📥 การรวบรวมและจัดเตรียมข้อมูล (`getComprehensiveByVendorId`)
 *    ------------------------------------------------------------
 *    - **ปัญหา**: ข้อมูล Vendor ถูกเก็บแยกหลายตาราง (Vendor, Contacts, Products) ทำให้การดึงข้อมูลมาแสดงผลมีความยุ่งยากและซับซ้อนในหน้า UI
 *    - **ทางแก้**: ดึงข้อมูลทั้งหมดที่เกี่ยวข้องมารวมกัน จัดการค่าว่าง (Null/Undefined) และส่งคืนเป็น Object เดียว (`VendorComprehensiveI`) เพื่อให้ Form ใช้งานง่าย
 *    - **หลักการทำงาน**: 
 *      - ดึงข้อมูล Vendor หลัก
 *      - ค้นหาข้อมูลที่เกี่ยวข้องทั้งหมดด้วยชื่อบริษัท (เพื่อให้ได้ Contact/Product ทั้งหมด)
 *      - กรองข้อมูลซ้ำออกเพื่อให้ได้ข้อมูลที่ถูกต้องแม่นยำที่สุด
 * 
 * 2. 🔄 ระบบตรวจจับการเปลี่ยนแปลง (`updateComprehensive` internals)
 *    ------------------------------------------------------------
 *    - **ปัญหา**: เราต้องรู้ว่า "อะไรเปลี่ยนไปบ้าง" เพื่อที่จะส่งเฉพาะข้อมูลที่จำเป็นไปบันทึก (ดีกว่าส่งทั้งหมดซึ่งช้าและเสี่ยงต่อข้อมูลผิดพลาด)
 *    - **ทางแก้**: ใช้ระบบเปรียบเทียบข้อมูล (Diffing Strategy):
 *      - **ข้อมูลบริษัท**: เทียบค่าของแต่ละฟิลด์ว่าตรงกันไหม
 *      - **Contacts/Products**:
 *        - `เพิ่มใหม่ (Added)`: มีข้อมูลในชุดใหม่ แต่ไม่มี ID
 *        - `แก้ไข (Modified)`: มี ID ตรงกัน แต่ข้อมูลข้างในไม่เหมือนเดิม
 *        - `ลบ (Removed)`: ID อยู่ในรายการที่ถูกสั่งลบ (deletedIds)
 * 
 * 3. 🚀 การจัดการลำดับการบันทึก (`updateComprehensive`)
 *    ------------------------------------------------------------
 *    - **ลำดับการทำงาน** (สำคัญมากเพื่อความถูกต้องของข้อมูล):
 *      1. อัปเดตข้อมูล Vendor หลัก (Parent)
 *      2. อัปเดต Contact ที่มีการแก้ไข
 *      3. อัปเดต Product ที่มีการแก้ไข
 *      4. สร้าง Contact ใหม่
 *      5. สร้าง Product ใหม่
 *      6. ลบ Contact ที่สั่งลบ (Soft Delete: INUSE=0)
 *      7. ลบ Product ที่สั่งลบ (Soft Delete: INUSE=0)
 *    - **ระบบป้องกัน**: ถ้าขั้นตอนไหนพัง ระบบจะหยุดทันทีและแจ้ง Error กลับไปอย่างชัดเจนว่าพังที่ขั้นตอนไหน
 * 
 * 4. 📝 การสร้างสรุปรายการเปลี่ยนแปลง (`generateChangesSummary`)
 *    ------------------------------------------------------------
 *    - **เป้าหมาย**: สร้างสรุปรายการเปลี่ยนแปลงที่อ่านง่าย (เช่น "ชื่อบริษัท เปลี่ยนจาก A -> B") เพื่อแสดงใน Success Modal ให้ User ตรวจสอบได้
 *    - **การแสดงผล**: แยกเป็นหมวดหมู่ (Added, Removed, Modified) และแปลงค่า Code เป็นข้อความที่เข้าใจง่าย (เช่น INUSE 1/0 -> Active/Inactive)
 * 
 * ----------------------------------------------------------------------------------------------------
 * ⚠️ ข้อควรระวังสำหรับผู้ดูแล (Maintenance Notes):
 * ----------------------------------------------------------------------------------------------------
 * 1. **การเพิ่ม Field ใหม่**: หากมีการเพิ่มคอลัมน์ใน Database ต้องทำการอัปเดต 3 จุดหลัก:
 *    - เพิ่มใน Interface `VendorComprehensiveI`
 *    - เพิ่มในฟังก์ชันตรวจสอบการเปลี่ยนแปลง `hasVendorFieldsChanged`
 *    - เพิ่มคำอธิบายในฟังก์ชันสรุปผล `generateChangesSummary` (เพื่อให้แสดง Label ถูกต้องใน Modal)
 * 
 * 2. **การลบข้อมูล (Soft Delete)**: 
 *    - ระบบใช้ Soft Delete (อัปเดตค่า `INUSE = 0`) ไม่ได้ลบ Record จริงออกจาก Database
 *    - ต้องมั่นใจว่า API หลังบ้าน (`find-vendor/deleteContact`) รองรับ Logic นี้
 * 
 * 3. **Validation & Typing**: 
 *    - พยายามเลี่ยงการใช้ `any` และใช้ Type ที่กำหนดไว้ใน `FindVendorTypes.ts` เสมอ เพื่อลด Human Error
 * 
 * ====================================================================================================
 */

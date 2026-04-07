// GPR Form A — Supplier / Outsourcing Selection Sheet (PDF template)
// Rendered with @react-pdf/renderer (client-side only, via Vite)
//
// Thai font: place Sarabun-Regular.ttf + Sarabun-Bold.ttf in /public/fonts/
// then uncomment the Font.register block below.

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { GprFormData } from './GprFormDialog'

// ─── Optional Thai font registration ────────────────────────────────────────
// import { Font } from '@react-pdf/renderer'
// Font.register({
//   family: 'Sarabun',
//   fonts: [
//     { src: '/fonts/Sarabun-Regular.ttf' },
//     { src: '/fonts/Sarabun-Bold.ttf', fontWeight: 'bold' },
//   ]
// })

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        fontSize: 8.5,
        fontFamily: 'Helvetica',
        paddingTop: 28,
        paddingBottom: 36,
        paddingHorizontal: 32,
        color: '#111',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingBottom: 5,
        marginBottom: 6,
    },
    title: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    sNum: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        marginTop: 8,
        marginBottom: 4,
    },
    // ── Company info rows ──
    infoRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
    infoLbl: { fontFamily: 'Helvetica-Bold', fontSize: 8, width: 90 },
    infoVal: {
        fontSize: 8,
        flex: 1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#666',
        borderBottomStyle: 'solid',
        paddingBottom: 1,
    },
    // ── Table ──
    tbl: {
        borderWidth: 0.5,
        borderColor: '#888',
        borderStyle: 'solid',
        marginBottom: 6,
    },
    tblRow: { flexDirection: 'row' },
    // Header cell (with right + bottom border)
    th: {
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#f0f0f0',
        fontSize: 7.5,
        padding: '3 4',
        borderRightWidth: 0.5,
        borderRightColor: '#888',
        borderRightStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#888',
        borderBottomStyle: 'solid',
    },
    // Last header cell (no right border)
    thl: {
        fontFamily: 'Helvetica-Bold',
        backgroundColor: '#f0f0f0',
        fontSize: 7.5,
        padding: '3 4',
        borderBottomWidth: 0.5,
        borderBottomColor: '#888',
        borderBottomStyle: 'solid',
    },
    // Data cell (right + bottom border)
    td: {
        fontSize: 7.5,
        padding: '3 4',
        borderRightWidth: 0.5,
        borderRightColor: '#aaa',
        borderRightStyle: 'solid',
        borderBottomWidth: 0.5,
        borderBottomColor: '#aaa',
        borderBottomStyle: 'solid',
    },
    // Last data cell in row (no right border)
    tdl: {
        fontSize: 7.5,
        padding: '3 4',
        borderBottomWidth: 0.5,
        borderBottomColor: '#aaa',
        borderBottomStyle: 'solid',
    },
    // Last row data cell (no bottom border)
    tdr: {
        fontSize: 7.5,
        padding: '3 4',
        borderRightWidth: 0.5,
        borderRightColor: '#aaa',
        borderRightStyle: 'solid',
    },
    // Last row + last col
    tdrl: {
        fontSize: 7.5,
        padding: '3 4',
    },
    // ── Checkbox ──
    chkRow: { flexDirection: 'row', alignItems: 'center', marginRight: 28 },
    chkBox: {
        width: 9,
        height: 9,
        borderWidth: 0.75,
        borderColor: '#333',
        borderStyle: 'solid',
        marginRight: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // ── Signature ──
    sigRow: { flexDirection: 'row' },
    sigCell: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRightWidth: 0.5,
        borderRightColor: '#888',
        borderRightStyle: 'solid',
        alignItems: 'center',
        minHeight: 48,
    },
    sigCellLast: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
        minHeight: 48,
    },
    sigLbl: { fontFamily: 'Helvetica-Bold', fontSize: 8.5, textAlign: 'center' },
    sigDate: { fontSize: 7, color: '#777', marginTop: 12 },
    sigRoleRow: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#888',
        borderTopStyle: 'solid',
    },
    sigRoleCell: {
        flex: 1,
        paddingVertical: 3,
        borderRightWidth: 0.5,
        borderRightColor: '#888',
        borderRightStyle: 'solid',
        alignItems: 'center',
    },
    sigRoleCellLast: { flex: 1, paddingVertical: 3, alignItems: 'center' },
    // ── Remarks ──
    rmkLine: { fontSize: 7.5, marginBottom: 3, paddingLeft: 10 },
    rmkBold: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', marginBottom: 2, paddingLeft: 18 },
    rmkItalic: { fontSize: 7, color: '#555', marginBottom: 2, paddingLeft: 18 },
})

// ─────────────────────────────────────────────────────────────────────────────
// PDF Document Component
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
    form: GprFormData
    rowData: any
}

export function GprPdfDocument({ form, rowData }: Props) {

    const needUploaded    = form.criteria.filter(c => c.criteria === 'Need' && c.uploaded_file).length
    const optionalUploaded = form.criteria.filter(c => c.criteria === 'Optional' && c.no !== '3.14' && c.uploaded_file).length

    return (
        <Document>
            <Page size='A4' style={s.page}>

                {/* ── Header ─────────────────────────────────────────────── */}
                <View style={s.headerRow}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>
                        Furukawa Fitel (Thailand) Co.,Ltd.
                    </Text>
                    <Text style={{ fontSize: 8, color: '#666' }}>No. {rowData?.request_id || ''}</Text>
                </View>

                <Text style={s.title}>Supplier / Outsourcing Selection Sheet</Text>

                {/* ── Section 1: Company Name ──────────────────────────── */}
                <Text style={s.sNum}>1.</Text>
                <View style={{ paddingLeft: 10, marginBottom: 6 }}>
                    <View style={s.infoRow}>
                        <Text style={s.infoLbl}>Company Name :</Text>
                        <Text style={s.infoVal}>{form.company_name || ''}</Text>
                    </View>
                    <View style={[s.infoRow, { marginBottom: 0 }]}>
                        <Text style={[s.infoLbl, { width: 30 }]}>PIC :</Text>
                        <Text style={[s.infoVal, { marginRight: 10 }]}>{form.pic_name || ''}</Text>
                        <Text style={[s.infoLbl, { width: 25 }]}>Tel :</Text>
                        <Text style={s.infoVal}>{form.tel || ''}</Text>
                    </View>
                    <View style={s.infoRow}>
                        <Text style={[s.infoLbl, { width: 45 }]}>Email :</Text>
                        <Text style={s.infoVal}>{form.email || ''}</Text>
                    </View>
                </View>

                {/* ── Section 2: Sanctions ─────────────────────────────── */}
                <Text style={s.sNum}>2.  List of two political parties subject to sanctions</Text>
                <View style={{ flexDirection: 'row', paddingLeft: 16, marginBottom: 7 }}>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.sanctions === 'non-concerned' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 8 }}>####  Non-concerned</Text>
                    </View>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.sanctions === 'concerned' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 8 }}>###  Concerned</Text>
                    </View>
                </View>

                {/* ── Section 3: General Information ───────────────────── */}
                <Text style={s.sNum}>3.  Company general information</Text>
                <View style={s.tbl}>
                    {/* Address */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Address</Text>
                        <Text style={[s.tdl, { flex: 1 }]}>{form.address}</Text>
                    </View>
                    {/* Business Category + Start Year */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Business Category</Text>
                        <Text style={[s.td, { flex: 1 }]}>{form.business_category}</Text>
                        <Text style={[s.td, { width: 80, fontFamily: 'Helvetica-Bold' }]}>Start Year</Text>
                        <Text style={[s.tdl, { width: 80 }]}>{form.start_year}</Text>
                    </View>
                    {/* Authorized Capital + Establish */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Authorized Capital</Text>
                        <Text style={[s.td, { flex: 1 }]}>{form.authorized_capital}</Text>
                        <Text style={[s.td, { width: 80, fontFamily: 'Helvetica-Bold' }]}>Establish</Text>
                        <Text style={[s.tdl, { width: 80 }]}>{form.establish}</Text>
                    </View>
                    {/* Number of Employees + Manufactured Country */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Number of Employees</Text>
                        <Text style={[s.td, { flex: 1 }]}>{form.number_of_employees}</Text>
                        <Text style={[s.td, { width: 80, fontFamily: 'Helvetica-Bold' }]}>Manufactured Country</Text>
                        <Text style={[s.tdl, { width: 80 }]}>{form.manufactured_country}</Text>
                    </View>
                    {/* Main Product */}
                    <View style={s.tblRow}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Main Product</Text>
                        <Text style={[s.tdl, { flex: 1 }]}>{form.main_product}</Text>
                    </View>
                    {/* Sales & Profit 5 Years (inline sub-table) */}
                    <View style={[s.tblRow, { alignItems: 'flex-start' }]}>
                        <Text style={[s.td, { width: 130, fontFamily: 'Helvetica-Bold' }]}>
                            {'Sales and Operational Profit\n(Last 5 Years)'}
                        </Text>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#aaa', borderBottomStyle: 'solid' }}>
                                {['Year', 'Sales (MB)', 'Operational Profit (MB)'].map((h, i) => (
                                    <Text key={i} style={{
                                        flex: i === 0 ? 1 : 2,
                                        fontSize: 7,
                                        fontFamily: 'Helvetica-Bold',
                                        padding: '2 4',
                                        borderRightWidth: i < 2 ? 0.5 : 0,
                                        borderRightColor: '#ccc',
                                        borderRightStyle: 'solid',
                                    }}>{h}</Text>
                                ))}
                            </View>
                            {form.sales_profit.map((sp, i) => (
                                <View key={i} style={{
                                    flexDirection: 'row',
                                    borderBottomWidth: i < form.sales_profit.length - 1 ? 0.5 : 0,
                                    borderBottomColor: '#ccc',
                                    borderBottomStyle: 'solid',
                                }}>
                                    <Text style={{ flex: 1, fontSize: 7.5, padding: '2 4', borderRightWidth: 0.5, borderRightColor: '#ccc', borderRightStyle: 'solid' }}>{sp.year}</Text>
                                    <Text style={{ flex: 2, fontSize: 7.5, padding: '2 4', borderRightWidth: 0.5, borderRightColor: '#ccc', borderRightStyle: 'solid' }}>{sp.total_revenue}</Text>
                                    <Text style={{ flex: 2, fontSize: 7.5, padding: '2 4' }}>{sp.net_profit}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    {/* Vendor's Original Country — last row, no bottom border */}
                    <View style={[s.tblRow, { borderBottomWidth: 0 }]}>
                        <Text style={[s.tdr, { width: 130, fontFamily: 'Helvetica-Bold' }]}>Vendor's Original Country</Text>
                        <Text style={[s.tdrl, { flex: 1 }]}>{form.vendor_original_country}</Text>
                    </View>
                </View>

                {/* ── Section 4: Criteria ───────────────────────────────── */}
                <Text style={s.sNum}>4.  Criteria for selection</Text>
                <View style={s.tbl}>
                    <View style={s.tblRow}>
                        <Text style={[s.th, { width: 35 }]}>No.</Text>
                        <Text style={[s.th, { flex: 3 }]}>Detail</Text>
                        <Text style={[s.th, { width: 60 }]}>Criteria</Text>
                        <Text style={[s.th, { flex: 2 }]}>Remark</Text>
                        <Text style={[s.thl, { width: 55 }]}>Document</Text>
                    </View>
                    {form.criteria.map((c, i) => {
                        const isLast = i === form.criteria.length - 1
                        const Td = isLast ? s.tdr : s.td
                        const Tdl = isLast ? s.tdrl : s.tdl
                        return (
                            <View key={c.no} style={s.tblRow}>
                                <Text style={[Td, { width: 35 }]}>{c.no}</Text>
                                <Text style={[Td, { flex: 3 }]}>{c.detail}</Text>
                                <Text style={[Td, { width: 60 }]}>{c.criteria}</Text>
                                <Text style={[Td, { flex: 2 }]}>{c.remark}</Text>
                                <Text style={[Tdl, { width: 55 }]}>
                                    {c.uploaded_file ? `\u2713 ${c.uploaded_name || 'Uploaded'}` : '-'}
                                </Text>
                            </View>
                        )
                    })}
                </View>

                {/* ── Section 5: Suggestion ─────────────────────────────── */}
                <Text style={s.sNum}>5.  Suggestion :</Text>
                <View style={{
                    borderBottomWidth: 0.5, borderBottomColor: '#777', borderBottomStyle: 'solid',
                    minHeight: 24, marginBottom: 8, paddingBottom: 4, paddingLeft: 4,
                }}>
                    <Text style={{ fontSize: 8 }}>{form.suggestion}</Text>
                </View>

                {/* Remark block */}
                <View style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Remark :</Text>
                    <Text style={s.rmkLine}>
                        {`1. Criteria for evaluation criteria in item 3.1 to 3.5, Which are all selected   =   ${needUploaded}   items`}
                    </Text>
                    <Text style={s.rmkLine}>
                        {`2. Item 3.6 to 3.13 as a criterion independent, Which must choose at least three items, Which are all selected   =   ${optionalUploaded}   items`}
                    </Text>
                    <Text style={s.rmkBold}>
                        {'- Manufacturer shall be authorized capital is at least 1MTHB, Establish is at least 3 years and if the goods are raw materials, item no. 3.6-3.7 is recommended.'}
                    </Text>
                    <Text style={s.rmkItalic}>
                        {'- Other business category shall be authorized capital is at least 0.5 MTHB, Establish is at least 1 year.'}
                    </Text>
                </View>

                {/* Approval / Disapproval */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingLeft: 8 }}>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.result === 'approval' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Approval</Text>
                    </View>
                    <View style={s.chkRow}>
                        <View style={s.chkBox}>
                            <Text style={{ fontSize: 7 }}>{form.result === 'disapproval' ? 'X' : ' '}</Text>
                        </View>
                        <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Disapproval</Text>
                    </View>
                </View>

                {/* Signature Table */}
                <View style={{ borderWidth: 0.5, borderColor: '#888', borderStyle: 'solid', marginBottom: 6 }}>
                    <View style={s.sigRow}>
                        {['Selector', 'Checker', 'Checker', 'Approve by'].map((lbl, i) => (
                            <View key={i} style={i < 3 ? s.sigCell : s.sigCellLast}>
                                <Text style={s.sigLbl}>{lbl}</Text>
                                <Text style={s.sigDate}>{'........../........../..........  '}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={s.sigRoleRow}>
                        {['Issuer', 'Manager', 'General Manager', 'Managing Director'].map((lbl, i) => (
                            <View key={i} style={i < 3 ? s.sigRoleCell : s.sigRoleCellLast}>
                                <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', textAlign: 'center' }}>{lbl}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Path */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 }}>
                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginRight: 6 }}>Path :</Text>
                    <Text style={{
                        fontSize: 8, flex: 1,
                        borderBottomWidth: 0.5, borderBottomColor: '#666', borderBottomStyle: 'solid',
                        paddingBottom: 1,
                    }}>{form.path}</Text>
                </View>

                {/* For Selector */}
                <View style={{ borderTopWidth: 1, borderTopColor: '#000', borderTopStyle: 'solid', paddingTop: 6 }}>
                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginBottom: 2 }}>For Selector :</Text>
                    <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Oblique', marginBottom: 8 }}>
                        After completing the Supplier/Outsourcing registration, please specify.
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        {/* Vendor Code */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 24 }}>
                            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginRight: 4 }}>Vendor Code :</Text>
                            <Text style={{
                                fontSize: 8, minWidth: 100,
                                borderBottomWidth: 0.5, borderBottomColor: '#666', borderBottomStyle: 'solid',
                                paddingBottom: 1,
                            }}>{form.vendor_code_selector || '  '}</Text>
                        </View>
                        {/* PM Manager */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 24 }}>
                            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginRight: 4 }}>PM Manager :</Text>
                            <Text style={{
                                fontSize: 8, minWidth: 100,
                                borderBottomWidth: 0.5, borderBottomColor: '#666', borderBottomStyle: 'solid',
                                paddingBottom: 1,
                            }}>{form.pm_manager || '  '}</Text>
                        </View>
                        {/* Date */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginRight: 4 }}>Date :</Text>
                            <Text style={{
                                fontSize: 8, minWidth: 70,
                                borderBottomWidth: 0.5, borderBottomColor: '#666', borderBottomStyle: 'solid',
                                paddingBottom: 1,
                            }}>{form.completion_date || '  /  /  '}</Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    )
}

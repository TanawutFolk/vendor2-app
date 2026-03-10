// ─────────────────────────────────────────────────────────────────────────────
// Status Icon Map — icons are defined in code, everything else from DB
// ─────────────────────────────────────────────────────────────────────────────

/** Map status_value → tabler icon class. Fallback: 'tabler-file' */
export const STATUS_ICON_MAP: Record<string, string> = {
    'Sent To PO & SCM(PIC)':       'tabler-send',
    'PO & SCM approve(PIC)':       'tabler-user-check',
    'Pending Agreement To Vendor':  'tabler-mail',
    'Agreement Reached':            'tabler-handshake',
    'PO & SCM Check All Document':  'tabler-file-check',
    'PO Mgr Approve':               'tabler-user-star',
    'MD Approval':                   'tabler-award',
    'Rejected':                      'tabler-circle-x',
}

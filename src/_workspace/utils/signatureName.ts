const HONORIFIC_PREFIX_REGEX = /^(?:(?:MRS|MR|MS)(?:\.|\s)+\s*)+/i

const stripSignatureHonorific = (value: unknown) =>
    String(value ?? '')
        .trim()
        .replace(HONORIFIC_PREFIX_REGEX, '')
        .trim()

const isJapaneseStyleEmpcode = (value: unknown) => /^[JD]/i.test(String(value ?? '').trim())
const normalizeNamePart = (value: string) => value.trim().toUpperCase()
const nameInitial = (value: string) => normalizeNamePart(value).charAt(0)

export const formatSelectionSheetSignatureName = (fullName?: unknown, fallbackCode?: unknown) => {
    const code = String(fallbackCode ?? '').trim()
    const source = stripSignatureHonorific(fullName)

    if (!source) return code

    const parts = source.split(/\s+/).filter(Boolean)
    if (parts.length < 2) return normalizeNamePart(parts[0])

    const firstName = parts[0]
    const lastName = parts[parts.length - 1]

    if (isJapaneseStyleEmpcode(code)) {
        return `${normalizeNamePart(lastName)} ${nameInitial(firstName)}.`
    }

    return `${normalizeNamePart(firstName)} ${nameInitial(lastName)}.`
}
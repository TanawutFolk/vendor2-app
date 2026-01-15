// utils/errorHelpers.ts
export const isAbortError = (error: unknown): boolean => {
  return error instanceof Error && error.name === 'AbortError'
}

export const handleApiError = (error: unknown, context: string): string => {
  if (isAbortError(error)) {
    console.log(`${context} request aborted`)
    return 'Request aborted'
  }
  return getErrorMessage(error)
}

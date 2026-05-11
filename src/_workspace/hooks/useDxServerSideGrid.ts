import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { GridApi, GridReadyEvent, StateUpdatedEvent } from 'ag-grid-community'
import type { FieldPath, FieldPathValue, FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form'

type UseDxServerSideGridArgs<TFieldValues extends FieldValues> = {
  getValues: UseFormGetValues<TFieldValues>
  setValue: UseFormSetValue<TFieldValues>
  isEnableFetching: boolean
  setIsEnableFetching: (value: boolean) => void
  statePath?: FieldPath<TFieldValues>
}

const DEFAULT_STATE_PATH = 'searchResults.agGridState'

export const useDxServerSideGrid = <TFieldValues extends FieldValues>({
  getValues,
  setValue,
  isEnableFetching,
  setIsEnableFetching,
  statePath = DEFAULT_STATE_PATH as FieldPath<TFieldValues>
}: UseDxServerSideGridArgs<TFieldValues>) => {
  const gridApiRef = useRef<GridApi | null>(null)

  const refreshServerSide = useCallback(() => {
    gridApiRef.current?.refreshServerSide?.({ purge: true })
  }, [])

  useEffect(() => {
    if (isEnableFetching && gridApiRef.current) {
      setIsEnableFetching(false)
      refreshServerSide()
    }
  }, [isEnableFetching, refreshServerSide, setIsEnableFetching])

  const savedGridState = useMemo(() => getValues(statePath), []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateUpdated = useCallback(
    (event: StateUpdatedEvent) => {
      setValue(statePath, event.state as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>, { shouldDirty: false })
    },
    [setValue, statePath]
  )

  const handleGridReady = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api
  }, [])

  return {
    gridApiRef,
    savedGridState,
    handleGridReady,
    handleStateUpdated,
    refreshServerSide
  }
}

export default useDxServerSideGrid

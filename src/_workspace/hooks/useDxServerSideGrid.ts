import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { GridApi, GridReadyEvent, StateUpdatedEvent } from 'ag-grid-community'
import type { FieldPath, FieldPathValue, FieldValues, UseFormGetValues, UseFormSetValue } from 'react-hook-form'

type UseDxServerSideGridArgs<TFieldValues extends FieldValues> = {
  getValues: UseFormGetValues<TFieldValues>
  setValue: UseFormSetValue<TFieldValues>
  isEnableFetching: boolean
  setIsEnableFetching: (value: boolean) => void
  statePath?: FieldPath<TFieldValues>
  lockedLeftColIds?: string[]
}

const DEFAULT_STATE_PATH = 'searchResults.agGridState'

const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean)))

export const enforceLockedLeftColumns = (state: any, lockedLeftColIds: string[] = []) => {
  const locked = unique(lockedLeftColIds)
  if (!state || locked.length === 0) return state

  const columnPinning = state.columnPinning || {}
  const leftColIds = Array.isArray(columnPinning.leftColIds) ? columnPinning.leftColIds : []
  const rightColIds = Array.isArray(columnPinning.rightColIds) ? columnPinning.rightColIds : []
  const columnVisibility = state.columnVisibility || {}
  const hiddenColIds = Array.isArray(columnVisibility.hiddenColIds) ? columnVisibility.hiddenColIds : []
  const nextState = {
    ...state,
    columnPinning: {
      ...columnPinning,
      leftColIds: unique([...locked, ...leftColIds.filter((colId: string) => !locked.includes(colId))]),
      rightColIds: rightColIds.filter((colId: string) => !locked.includes(colId))
    },
    columnVisibility: {
      ...columnVisibility,
      hiddenColIds: hiddenColIds.filter((colId: string) => !locked.includes(colId))
    }
  }

  const orderedColIds = nextState.columnOrder?.orderedColIds
  if (Array.isArray(orderedColIds)) {
    nextState.columnOrder = {
      ...nextState.columnOrder,
      orderedColIds: unique([...locked, ...orderedColIds.filter((colId: string) => !locked.includes(colId))])
    }
  }

  return nextState
}

export const useDxServerSideGrid = <TFieldValues extends FieldValues>({
  getValues,
  setValue,
  isEnableFetching,
  setIsEnableFetching,
  statePath = DEFAULT_STATE_PATH as FieldPath<TFieldValues>,
  lockedLeftColIds = []
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

  const savedGridState = useMemo(
    () => enforceLockedLeftColumns(getValues(statePath), lockedLeftColIds),
    []
  ) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateUpdated = useCallback(
    (event: StateUpdatedEvent) => {
      setValue(
        statePath,
        enforceLockedLeftColumns(event.state, lockedLeftColIds) as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
        { shouldDirty: false }
      )
    },
    [lockedLeftColIds, setValue, statePath]
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

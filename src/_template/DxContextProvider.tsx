import type { ReactNode } from 'react'
import React, { createContext, useContext, useState } from 'react'

// Structurally identical to MRT_PaginationState — kept local so this provider has
// no material-react-table dependency (AG Grid pages don't use pagination at all,
// but the prototype's MRT pages still read it from context).
type DxPaginationState = { pageIndex: number; pageSize: number }

type DxContextType = {
  isEnableFetching: boolean
  setIsEnableFetching: React.Dispatch<React.SetStateAction<boolean>>
  pagination: DxPaginationState
  setPagination: React.Dispatch<React.SetStateAction<DxPaginationState>>
}
const DxContext = createContext<DxContextType | undefined>(undefined)

const DxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  const [pagination, setPagination] = useState<DxPaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  return (
    <DxContext.Provider value={{ isEnableFetching, setIsEnableFetching, pagination, setPagination }}>
      {children}
    </DxContext.Provider>
  )
}

const useDxContext = () => {
  const context = useContext(DxContext)

  if (!context) {
    throw new Error('useDxContext must be used within a DxProvider')
  }

  return context
}

export { DxProvider, useDxContext }

import type { ReactNode } from 'react'
import React, { createContext, useContext, useState } from 'react'

type DxContextType = {
  isEnableFetching: boolean
  setIsEnableFetching: React.Dispatch<React.SetStateAction<boolean>>
}
const DxContext = createContext<DxContextType | undefined>(undefined)

const DxProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isEnableFetching, setIsEnableFetching] = useState(false)

  return <DxContext.Provider value={{ isEnableFetching, setIsEnableFetching }}>{children}</DxContext.Provider>
}

const useDxContext = () => {
  const context = useContext(DxContext)

  if (!context) {
    throw new Error('useDxContext must be used within a DxProvider')
  }

  return context
}

export { DxProvider, useDxContext }

// React Imports
import type { Dispatch, SetStateAction } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import type { MRT_Row, MRT_RowData } from 'material-react-table'

interface ActionsMenuProps<T extends MRT_RowData> {
  row: MRT_Row<T>
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<T> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<T> | null>>
  MENU_ID: number
}

const ActionsMenu = <T extends MRT_RowData>({ row, setRowSelected, setOpenModalView }: ActionsMenuProps<T>) => {
  return (
    <>
      <IconButton
        onClick={() => {
          setRowSelected(row)
          setOpenModalView(true)
        }}
      >
        <i className='tabler-eye text-[22px] text-textSecondary' />
      </IconButton>
    </>
  )
}

export default ActionsMenu

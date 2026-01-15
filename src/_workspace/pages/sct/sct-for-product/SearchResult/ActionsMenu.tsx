// React Imports
import { useState } from 'react'
import type { Dispatch, MouseEvent, SetStateAction } from 'react'

// MUI Imports
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import { Divider, ListItemIcon, ListItemText } from '@mui/material'

import type { MRT_Row, MRT_RowData } from 'material-react-table'
import { useCheckPermission } from '@/_template/CheckPermission'

const ITEM_HEIGHT = 48

interface ActionsMenuProps<T extends MRT_RowData> {
  row: MRT_Row<T>
  setOpenModalEdit: Dispatch<SetStateAction<boolean>>
  setOpenModalDelete: Dispatch<SetStateAction<boolean>>
  setOpenModalView: Dispatch<SetStateAction<boolean>>
  rowSelected: MRT_Row<T> | null
  setRowSelected: Dispatch<SetStateAction<MRT_Row<T> | null>>
  MENU_ID: number
}

const ActionsMenu = <T extends MRT_RowData>({
  row,
  setOpenModalEdit,
  setRowSelected,
  setOpenModalDelete,
  setOpenModalView,
  MENU_ID
}: ActionsMenuProps<T>) => {
  // States
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setRowSelected(null)
    setAnchorEl(null)
  }

  const onClickEdit = () => {
    setRowSelected(row)
    setOpenModalEdit(true)
    setAnchorEl(null)
  }

  const onClickDelete = () => {
    setRowSelected(row)
    setOpenModalDelete(true)
    setAnchorEl(null)
  }

  const checkPermission = useCheckPermission()

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

      <IconButton
        aria-label='more'
        aria-controls='long-menu'
        aria-haspopup='true'
        onClick={handleClick}
        hidden={row.original.INUSE !== 1}
      >
        <i className='tabler-dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        id='long-menu'
        anchorEl={anchorEl}
        onClose={handleClose}
        open={Boolean(anchorEl)}
        slotProps={{ paper: { style: { maxHeight: ITEM_HEIGHT * 4.5 } } }}
      >
        <MenuItem
          onClick={() => {
            if (checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_UPDATE')) {
              onClickEdit()
            }
          }}
        >
          <ListItemIcon>
            <i className='tabler-edit text-xl' />
          </ListItemIcon>
          <ListItemText primary='Edit' />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (checkPermission(Number(import.meta.env.VITE_APPLICATION_ID), MENU_ID, 'IS_UPDATE')) {
              onClickDelete()
            }
          }}
        >
          <ListItemIcon>
            <i className='tabler-trash text-xl' color='red' />
          </ListItemIcon>
          <ListItemText primary='Delete' />
        </MenuItem>
      </Menu>
    </>
  )
}

export default ActionsMenu

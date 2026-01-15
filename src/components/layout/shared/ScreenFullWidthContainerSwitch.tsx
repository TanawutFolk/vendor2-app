// React Imports
import { useRef, useState } from 'react'

// Third-party Imports
import classnames from 'classnames'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import ContentCompact from '@core/svg/ContentCompact'
import ContentWide from '@core/svg/ContentWide'
// Type Imports
import type { Mode } from '@core/types'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeScreenFullWidth = () => {
  // States
  const [open, setOpen] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  // Hooks
  const { settings, updateSettings } = useSettings()

  const handleClose = () => {
    setOpen(false)
    setTooltipOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const getModeIcon = () => {
    if (settings.contentWidth === 'compact') {
      return 'tabler-align-center'
    } else {
      return 'tabler-arrow-autofit-width'
    }
  }

  const ScreenMode = () => {
    if (settings.contentWidth === 'compact') {
      return (
        <Tooltip title={'Wide Mode'}>
          <IconButton
            ref={anchorRef}
            onClick={() =>
              updateSettings({
                navbarContentWidth: 'wide',
                contentWidth: 'wide',
                footerContentWidth: 'wide'
              })
            }
            className='text-textPrimary'
          >
            <i className='tabler-arrow-autofit-width text-[22px]' />
          </IconButton>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip title={'Compact Mode'}>
          <IconButton
            ref={anchorRef}
            onClick={() =>
              updateSettings({ navbarContentWidth: 'compact', contentWidth: 'compact', footerContentWidth: 'compact' })
            }
            className='text-textPrimary'
          >
            <i className='tabler-align-center  text-[22px]' />
          </IconButton>
        </Tooltip>
      )
    }
  }

  return (
    <>
      <ScreenMode />
    </>
  )
}

export default ModeScreenFullWidth

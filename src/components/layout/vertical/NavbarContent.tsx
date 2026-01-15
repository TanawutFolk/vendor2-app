// Third-party Imports
import classnames from 'classnames'

// Type Imports

// Component Imports
import { Divider, IconButton, Tooltip, Typography } from '@mui/material'

import useMediaQuery from '@mui/material/useMediaQuery'

import { useTheme } from '@mui/material/styles'

import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import NavToggle from './NavToggle'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import ColorMode from '../shared/ColorMode'
import ModeScreenFullWidth from '../shared/ScreenFullWidthContainerSwitch'

import { CoolMode } from '@/components/magicui/cool-mode'
import { ModeDropdownToggler } from '../shared/ModeDropdownSwitch'

const NavbarContent = () => {
  // Hooks
  const theme = useTheme()
  const belowMdScreen = useMediaQuery(theme.breakpoints.down('md'))
  const belowSmScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        {belowMdScreen === false &&
        (import.meta.env.VITE_ENV_NAME === 'DEV' || import.meta.env.VITE_ENV_NAME === 'SIT') ? (
          <div className='flex items-center gap-4'>
            <div className='flex justify-between items-center gap-4 is-full flex-wrap'>
              <Typography color='error.main'>{`Status : Testing (ใช้สำหรับ ทดสอบการใช้งาน เท่านั้น)`}</Typography>
            </div>
          </div>
        ) : null}
      </div>
      <div className='flex items-center'>
        <CoolMode>
          <Tooltip title={'Cool Mode'}>
            <IconButton className='text-textPrimary'>
              <i className='tabler-pacman text-[22px]' />
            </IconButton>
          </Tooltip>
        </CoolMode>
        <Divider className='mr-2' orientation='vertical' flexItem />
        <LanguageDropdown />
        <ModeDropdownToggler />
        {belowSmScreen ? null : (
          <>
            <ModeScreenFullWidth />
            <Divider className='mr-2' orientation='vertical' flexItem />
          </>
        )}
        <ColorMode isShowPrimaryPalette={!belowSmScreen} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent

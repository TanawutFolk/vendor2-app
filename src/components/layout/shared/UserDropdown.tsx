// React Imports
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useParams } from 'react-router'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Third-party Imports

// Type Imports
import type { Locale } from '@configs/i18n'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'
import { deleteUserDataInCookies, getUserData } from '@/utils/user-profile/userLoginProfile'
import { UserProps } from '@/utils/types/UserType'
import { ImageEmployeeFromURL } from '@/libs/react-query/hooks/common-system/useImageData'
import { useNavigate } from 'react-router'

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [userData, setUserData] = useState<UserProps>()
  const [small, setSmall] = useState('')
  const [large, setLarge] = useState('')
  const [isOpenModel, setIsOpenModel] = useState(false)

  // Effect
  useEffect(() => {}, [])

  useEffect(() => {
    const dataItem = getUserData()
    setUserData(dataItem)
    ImageEmployeeFromURL(dataItem?.EMPLOYEE_CODE ?? '', setSmall, setLarge)
  }, [])

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  //const router = useRouter()
  const navigate = useNavigate()

  // const { data: session } = useSession()
  const { settings } = useSettings()
  const params = useParams()
  const locale = params?.lang ?? 'en'

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      navigate(getLocalizedUrl(url, locale as Locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      // Sign out from the app
      deleteUserDataInCookies()
      navigate(import.meta.env.VITE_BASE_WEB_APP_LOGIN_URL + '?continue=' + import.meta.env.VITE_BASE_WEB_APP_URL)
    } catch (error) {
      console.error(error)

      // Show above error in a toast like following
      // toastService.error((err as Error).message)
    }
  }

  return (
    <>
      <div className='flex flex-col mr-2 ml-2' onClick={handleDropdownOpen} style={{ cursor: 'pointer' }}>
        <Typography textAlign='right' color={'var(--primary-color)'} variant='body1'>
          {userData?.EMPLOYEE_CODE ?? ''}
        </Typography>
        <Typography variant='caption'>
          {userData?.FIRST_NAME ?? ''} {userData?.LAST_NAME.substring(0, 3) ?? ''}
        </Typography>
      </div>
      <Avatar
        ref={anchorRef}
        alt={userData?.EMPLOYEE_CODE ?? ''}
        src={small || ''}
        onClick={handleDropdownOpen}
        className='cursor-pointer'
        sx={{
          // width: 56,
          // height: 56,
          img: { objectFit: 'cover' } // ป้องกันการยืด/บีบ
        }}
      />
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    {/* <Avatar /> */}
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {userData?.FIRST_NAME ?? ''} {userData?.LAST_NAME ?? ''.substring(0, 3)}
                      </Typography>
                      <Typography variant='caption'>
                        {userData?.SECTION_NAME +
                          '' +
                          ' - ' +
                          userData?.JOB_GRADE +
                          '' +
                          ' (' +
                          userData?.POSITION_NAME +
                          '' +
                          ')'}
                      </Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='mli-2 gap-3'>
                    <i className='tabler-user' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3'>
                    <i className='tabler-settings' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown

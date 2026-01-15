// Next Imports
import { useParams } from 'react-router'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu } from '@menu/vertical-menu'

import { GenerateVerticalMenu } from '@components/GenerateMenu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
// import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
import menuItemStyles from '@/components/styles/styles/vertical/menuItemStyles'
import { useGetMenuMergeUserGroupByUserNameAndApplicationId } from '@/libs/react-query/hooks/security-center-system/useGetMenu'
import { VerticalMenuDataType } from '@/types/menuTypes'
import { MenuI } from '@/types/security-center-system/MenuTypes'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import menuData from '@_workspace/navigation/verticalMenuData'
import { useEffect, useState } from 'react'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const getUrlParamSearch = () => {
  let params = ``

  params += `"APPLICATION_ID": "${import.meta.env.VITE_APPLICATION_ID}"`
  params += `, "USER_NAME":"${getUserData().USER_NAME}"`
  params = `{${params}}`

  return params
}

export interface PermissionInterface {
  header?: string
  text?: string
  icon?: string
  id?: string
  link?: string
  initiallyOpened?: boolean
  children?: { text: string; link: string; id?: string }[]
}

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // States
  const [sidebarMenuData, setSidebarMenuData] = useState<MenuI[]>([])
  const { data, isSuccess, isLoading } = useGetMenuMergeUserGroupByUserNameAndApplicationId(getUrlParamSearch(), true)

  useEffect(() => {
    if (isSuccess) {
      setSidebarMenuData(data?.data?.ResultOnDb)
      // localStorage.setItem('menu', JSON.stringify(data.data.ResultOnDbRawData))
      //setMenuInCookies(data?.data?.ResultOnDbRawData)
    } else {
      setSidebarMenuData([])
      //setMenuInCookies([])
    }
  }, [isSuccess])

  // get Menu from Permission
  const menu: VerticalMenuDataType[] = []

  let menuPermission: any[] = []

  menuPermission = menuData(dictionary)

  const getMenuIntersection = (
    ObjOne: PermissionInterface['children'] = [],
    ObjTwo: PermissionInterface['children'] = []
  ) => {
    return ObjOne.filter(item1 => ObjTwo.some(item2 => Number(item1.id) === Number(item2.id)))
  }

  const getMenu = (arrPermission: any) => {
    let elements = []
    const menuInside = []

    for (let i = 0; i < (sidebarMenuData?.length ?? 0); i++) {
      const elementComp = sidebarMenuData?.[i]

      if (elementComp?.id == arrPermission?.id) {
        if (elementComp?.children && arrPermission.children) {
          elements = getMenuIntersection(arrPermission.children, elementComp?.children)
          arrPermission.children = elements
          menuInside.push(arrPermission)
        } else {
          menu.push(arrPermission)
        }
      }
    }

    if (menuInside.length > 0) {
      menu.push(arrPermission)
    }
  }

  // ?? Menu application from permission

  // Set default home menu
  for (let i = 0; i < 1; i++) {
    const element = menuPermission?.[i]

    menu.push(element)
  }

  for (let i = 1; i < (menuPermission?.length || 0); i++) {
    const element = menuPermission?.[i]
    if (element.isSection == true) {
      menu.push(element)
    } else {
      getMenu(element)
    }
  }

  const removeMenu = (i: any) => {
    menu.splice(i, 1)
  }

  for (let i = 0; i < menu.length; i++) {
    const firstItemMenu: any = menu[i]
    const secondItemMenu: any = menu[i + 1] ? menu[i + 1] : menu[i]

    if (firstItemMenu?.isSection && secondItemMenu?.isSection) {
      removeMenu(i)
    }
  }

  if (menu[menu.length - 1]?.isSection !== undefined) menu.pop()

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {isLoading ? (
        <div className='p-4'>Loading...</div>
      ) : (
        <Menu
          popoutMenuOffset={{ mainAxis: 23 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menu} />
        </Menu>
      )}
    </ScrollWrapper>
  )
}

export default VerticalMenu

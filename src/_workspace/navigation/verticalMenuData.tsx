// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation'].home,
    icon: 'tabler-home',
    href: '/home'
  },
  {
    label: dictionary['navigation'].menu1,
    isSection: true
  },
  {
    label: dictionary['navigation'].findVendor,
    icon: 'tabler-search',
    id: 528,
    href: '/find-vendor'
  },
  {
    label: dictionary['navigation'].addVendor,
    icon: 'tabler-circle-plus',
    id: 527,
    href: '/add-vendor'
  },
  {
    label: dictionary['navigation'].requestHistory,
    icon: 'tabler-history',
    id: 534,
    href: '/request-register-history'
  },
  {
    label: dictionary['navigation'].reRegister,
    icon: 'tabler-refresh',
    id: 546,
    href: '/re-register'
  },
  {
    label: dictionary['navigation'].approvalGprC,
    icon: 'tabler-file-check',
    id: 544,
    href: '/approval-gpr-c'
  },
  {
    label: dictionary['navigation'].menu2,
    isSection: true
  },
  {
    label: dictionary['navigation'].requestRegister,
    icon: 'tabler-checklist',
    id: 539,
    href: '/request-register'
  },
  {
    label: dictionary['navigation'].accRegister,
    icon: 'tabler-checklist',
    id: 543,
    href: '/acc-register'
  },
  {
    label: dictionary['navigation'].menu4,
    isSection: true
  },
  {
    label: dictionary['navigation'].documentCheck,
    icon: 'tabler-file-description',
    id: 541,
    href: '/check-document'
  },
  {
    id: 538,
    label: dictionary['navigation'].poMgrApproval,
    icon: 'tabler-user-star',
    href: '/po-mgr-approval'
  },
  {
    id: 542,
    label: dictionary['navigation'].poGmApproval,
    icon: 'tabler-user-check',
    href: '/po-gm-approval'
  },
  {
    label: dictionary['navigation'].mdApproval,
    icon: 'tabler-award',
    id: 540,
    href: '/md-approval'
  },
  {
    label: dictionary['navigation'].menu3,
    isSection: true
  },
  {
    label: dictionary['navigation'].setting,
    icon: 'tabler-device-desktop-cog',
    id: 535,
    children: [
      {
        id: 536,
        label: dictionary['navigation'].taskManager,
        icon: 'tabler-clipboard-copy',
        href: '/task-manager'
      },
      {
        id: 537,
        label: dictionary['navigation'].employeeManager,
        icon: 'tabler-users',
        href: '/employee-manager'
      },
      {
        id: 545,
        label: dictionary['navigation'].blackList,
        icon: 'tabler-user-x',
        href: '/blacklist'
      }
    ]
  }
]

export default verticalMenuData


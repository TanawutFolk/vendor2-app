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
    id: 756,
    href: '/find-vendor'
  },
  {
    label: dictionary['navigation'].addVendor,
    icon: 'tabler-circle-plus',
    id: 757,
    href: '/add-vendor'
  },
  {
    label: dictionary['navigation'].myrequestHistory,
    icon: 'tabler-history',
    id: 758,
    href: '/request-register-history'
  },
  {
    label: dictionary['navigation'].allRequestHistory,
    icon: 'tabler-list-details',
    id: 759,
    href: '/all-request-history'
  },
  {
    label: dictionary['navigation'].reRegister,
    icon: 'tabler-refresh',
    id: 765,
    href: '/re-register'
  },
  {
    label: dictionary['navigation'].approvalGprC,
    icon: 'tabler-file-check',
    id: 767,
    href: '/approval-gpr-c'
  },
  {
    label: dictionary['navigation'].menu2,
    isSection: true
  },
  {
    label: dictionary['navigation'].requestRegister,
    icon: 'tabler-checklist',
    id: 768,
    href: '/request-register'
  },
  {
    label: dictionary['navigation'].accRegister,
    icon: 'tabler-checklist',
    id: 769,
    href: '/acc-register'
  },
  {
    label: dictionary['navigation'].menu4,
    isSection: true
  },
  {
    label: dictionary['navigation'].documentCheck,
    icon: 'tabler-file-description',
    id: 770,
    href: '/check-document'
  },
  {
    id: 771,
    label: dictionary['navigation'].poMgrApproval,
    icon: 'tabler-user-star',
    href: '/po-mgr-approval'
  },
  {
    id: 772,
    label: dictionary['navigation'].poGmApproval,
    icon: 'tabler-user-check',
    href: '/po-gm-approval'
  },
  {
    label: dictionary['navigation'].mdApproval,
    icon: 'tabler-award',
    id: 773,
    href: '/md-approval'
  },
  {
    label: dictionary['navigation'].menu3,
    isSection: true
  },
  {
    label: dictionary['navigation'].setting,
    icon: 'tabler-device-desktop-cog',
    id: 761,
    children: [
      {
        id: 760,
        label: dictionary['navigation'].taskManager,
        icon: 'tabler-clipboard-copy',
        href: '/task-manager'
      },
      {
        id: 762,
        label: dictionary['navigation'].employeeManager,
        icon: 'tabler-users',
        href: '/employee-manager'
      },
      {
        id: 763,
        label: dictionary['navigation'].blackList,
        icon: 'tabler-user-x',
        href: '/blacklist'
      },
      {
        id: 764,
        label: dictionary['navigation'].approvalFlow,
        icon: 'tabler-arrows-right-left',
        href: '/approval-flow'
      }
    ]
  }
]

export default verticalMenuData


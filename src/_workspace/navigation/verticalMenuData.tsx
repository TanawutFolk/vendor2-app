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

  // !!! This is show Permission menu,
  {
    label: dictionary['navigation'].productGroup,
    icon: 'tabler-packages',
    id: 100,
    children: [
      {
        id: 101,
        label: dictionary['navigation'].productCategory,
        icon: 'tabler-circle',
        href: '/product-category'
      },
      {
        id: 102,
        label: dictionary['navigation'].productMain,
        icon: 'tabler-circle',
        href: '/product-main'
      },
      {
        id: 103,
        label: dictionary['navigation'].productSub,
        icon: 'tabler-circle',
        href: '/product-sub'
      },
      {
        id: 104,
        label: dictionary['navigation'].productType,
        icon: 'tabler-circle',
        href: '/product-type'
      }
    ]
  },
  // {
  //   label: dictionary['navigation'].specificationSetting,
  //   id: 382,
  //   icon: 'tabler-license',
  //   href: '/specification-setting'
  // },
  {
    label: dictionary['navigation'].boi,
    icon: 'tabler-scale',
    id: 340,
    defaultOpen: true,
    children: [
      {
        id: 341,
        label: dictionary['navigation'].boiProject,
        icon: 'tabler-circle',
        href: '/boi-project'
      },
      {
        id: 358,
        label: dictionary['navigation'].boiUnit,
        icon: 'tabler-circle',
        href: '/boi-unit'
      },
      {
        label: dictionary['navigation'].boiCategory,
        icon: 'tabler-square',
        id: 359,
        defaultOpen: true,
        children: [
          {
            id: 342,
            label: dictionary['navigation'].boiNameForMaterialConsumable,
            icon: 'tabler-circle',
            href: '/boi-name-for-material-consumable'
          }
        ]
      }
    ]
  },
  {
    label: dictionary['navigation'].account,
    icon: 'tabler-wallet',
    id: 343,
    children: [
      {
        id: 344,
        label: dictionary['navigation'].departmentCode,
        icon: 'tabler-circle',
        href: '/account-department-code'
      }
    ]
  },
  {
    label: dictionary['navigation'].units,
    icon: 'tabler-ruler',
    id: 124,
    children: [
      {
        id: 125,
        label: dictionary['navigation'].measurement,
        icon: 'tabler-circle',
        href: '/unit-of-measurement'
      }
    ]
  },
  {
    label: dictionary['navigation'].productionControl,
    icon: 'tabler-settings-automation',
    id: 136,
    children: [
      {
        id: 142,
        label: dictionary['navigation'].orderType,
        icon: 'tabler-circle',
        href: '/production-control/order-type'
      }
    ]
  },
  {
    label: dictionary['navigation'].customer,
    icon: 'tabler-user',
    id: 143,
    children: [
      {
        id: 146,
        label: dictionary['navigation'].customerOrderFrom,
        icon: 'tabler-circle',
        href: '/customer-order-from'
      },
      {
        id: 147,
        label: dictionary['navigation'].customerShipTo,
        icon: 'tabler-circle',
        href: '/customer-ship-to'
      },
      {
        id: 144,
        label: dictionary['navigation'].customerInvoiceTo,
        icon: 'tabler-circle',
        href: '/customer-invoice-to'
      }
    ]
  },
  {
    label: dictionary['navigation'].itemMaster,
    icon: 'tabler-list-details',
    id: 105,
    children: [
      {
        id: 129,
        label: dictionary['navigation'].itemCategory,
        icon: 'tabler-circle',
        href: '/item-master/item-category'
      },
      {
        id: 108,
        label: dictionary['navigation'].vendor,
        icon: 'tabler-circle',
        href: '/item-master/vendor'
      },
      {
        id: 109,
        label: dictionary['navigation'].maker,
        icon: 'tabler-circle',
        href: '/item-master/maker'
      },
      {
        label: dictionary['navigation'].itemProperty,
        icon: 'tabler-square',
        id: 114,
        children: [
          {
            id: 132,
            label: dictionary['navigation'].color,
            icon: 'tabler-circle',
            href: '/item-master/item-property/color'
          },
          {
            id: 134,
            label: dictionary['navigation'].shape,
            icon: 'tabler-circle',
            href: '/item-master/item-property/shape'
          }
        ]
      }
    ]
  },

  {
    label: dictionary['navigation'].manufacturingItem,
    icon: 'tabler-puzzle',
    id: 418,
    children: [
      {
        id: 438,
        label: dictionary['navigation'].manufacturingItem,
        icon: 'tabler-circle',
        href: '/manufacturing-item/item'
      },

      {
        id: 481,
        label: dictionary['navigation'].manufacturingItemGroup,
        icon: 'tabler-circle',
        href: '/manufacturing-item/manufacturing-item-group'
      },

      {
        id: 419,
        label: dictionary['navigation'].standardPrice,
        icon: 'tabler-circle',
        href: '/manufacturing-item/standard-price'
      }
    ]
  },
  // {
  //   label: dictionary['navigation'].billOfMaterial,
  //   icon: 'tabler-layers-subtract',
  //   id: 118,
  //   children: [
  //     {
  //       id: 520,
  //       label: dictionary['navigation'].billOfMaterial,
  //       icon: 'tabler-circle',
  //       href: '/bill-of-material'
  //     },
  //     {
  //       label: dictionary['navigation'].yieldRateMaterial,
  //       id: 446,
  //       icon: 'tabler-circle',
  //       href: '/yield-rate-material'
  //     }
  //   ]
  // },
  // {
  //   label: dictionary['navigation'].process,
  //   id: 115,
  //   icon: 'tabler-file-description',
  //   href: '/process'
  // },
  // {
  //   label: dictionary['navigation'].flow,
  //   icon: 'tabler-git-branch',
  //   id: 126,
  //   children: [
  //     {
  //       id: 127,
  //       label: dictionary['navigation'].flowType,
  //       icon: 'tabler-circle',
  //       href: '/flow/flow-type'
  //     },
  //     {
  //       id: 128,
  //       label: dictionary['navigation'].flowProcess,
  //       icon: 'tabler-circle',
  //       href: '/flow/flow-process'
  //     }
  //   ]
  // },
  {
    label: dictionary['navigation'].costCondition,
    icon: 'tabler-chart-pie',
    id: 400,
    children: [
      {
        id: 401,
        label: dictionary['navigation'].exchangeRate,
        icon: 'tabler-circle',
        href: '/cost-condition/exchange-rate'
      },
      {
        id: 421,
        label: dictionary['navigation'].importFee,
        icon: 'tabler-circle',
        href: '/cost-condition/import-fee'
      },
      {
        id: 413,
        label: dictionary['navigation'].directCostCondition,
        icon: 'tabler-circle',
        href: '/cost-condition/direct-cost-condition'
      },
      {
        id: 414,
        label: dictionary['navigation'].indirectCostCondition,
        icon: 'tabler-circle',
        href: '/cost-condition/indirect-cost-condition'
      },
      {
        id: 415,
        label: dictionary['navigation'].otherCostCondition,
        icon: 'tabler-circle',
        href: '/cost-condition/other-cost-condition'
      },
      {
        id: 416,
        label: dictionary['navigation'].specialCostCondition,
        icon: 'tabler-circle',
        href: '/cost-condition/special-cost-condition'
      }
    ]
  },
  // {
  //   label: dictionary['navigation'].envCer,
  //   icon: 'tabler-certificate',
  //   id: 390,
  //   defaultOpen: true,
  //   children: [
  //     {
  //       id: 391,
  //       label: dictionary['navigation'].materialList,
  //       icon: 'tabler-ad-2',
  //       href: '/environment-certification/material-list'
  //     }
  //   ]
  // },
  // {
  //   label: dictionary['navigation'].bom,
  //   id: 118,
  //   icon: 'tabler-template',
  //   href: '/bill-of-material'
  // },
  {
    label: dictionary['navigation'].yieldRate,
    id: 440,
    icon: 'tabler-arrows-shuffle',
    href: '/yield-rate-and-go-straight-rate'
  },
  {
    label: dictionary['navigation'].standardCost,
    icon: 'tabler-calculator',
    id: 148,
    children: [
      {
        id: 151,
        label: dictionary['navigation'].fiscalYearPeriod,
        icon: 'tabler-circle',
        href: '/sct/fiscal-year-period'
      },
      {
        id: 412,
        label: dictionary['navigation'].standardCostForProduct,
        icon: 'tabler-circle',
        href: '/sct/sct-for-product'
      },
      {
        id: 541,
        label: dictionary['navigation'].sctBomExplosion,
        icon: 'tabler-circle',
        href: '/sct/sct-bom-explosion'
      },
      // {
      //   id: 445,
      //   label: dictionary['navigation'].reCalStandardCostBudget,
      //   icon: 'tabler-circle',
      //   href: '/sct/re-cal'
      // }
    ]
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
    ]
  },
  // {
  //   label: dictionary['navigation'].priceList,
  //   id: 375,
  //   icon: 'tabler-tags',
  //   href: '/price-list'
  // }
  // {
  //   label: dictionary['navigation'].pcAdmin,
  //   icon: 'tabler-device-imac',
  //   id: 484,
  //   children: [
  //     {
  //       id: 485,
  //       label: dictionary['navigation'].manufacturingItemPrice,
  //       icon: 'tabler-circle',
  //       href: '/pc-admin/manufacturing-item-price'
  //     }
  //   ]
  // }
]

export default verticalMenuData

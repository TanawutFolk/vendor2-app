import { lazy } from 'react'
import { Route } from 'react-router'

/* Product */
const ProductCategoryPage = lazy(() => import('@/_workspace/pages/(productGroup)/product-category/page'))
const ProductMainPage = lazy(() => import('@/_workspace/pages/(productGroup)/product-main/page'))
const ProductSubPage = lazy(() => import('@/_workspace/pages/(productGroup)/product-sub/page'))
const ProductTypePage = lazy(() => import('@/_workspace/pages/(productGroup)/product-type/page'))

/* BOI */
const BoiProjectPage = lazy(() => import('@/_workspace/pages/(boi)/boi-project/page'))
const BoiUnitPage = lazy(() => import('@/_workspace/pages/(boi)/boi-unit/page'))
const BoiNameForMaterialConsumablePage = lazy(
  () => import('@/_workspace/pages/(boi)/boi-name-for-material-consumable/page')
)
/* Account */
const AccountDepartmentCodePage = lazy(() => import('@/_workspace/pages/(account)/account-department-code/page'))

/* Unit Of Measurement */
const UnitOfMeasurementPage = lazy(() => import('@/_workspace/pages/(units)/unit-of-measurement/page'))

/* Production Control */
const OrderTypePage = lazy(() => import('@/_workspace/pages/production-control/order-type/page'))

/* Customer */
const CustomerOrderFromPage = lazy(() => import('@/_workspace/pages/(customer)/customer-order-from/page'))
const CustomerShipToPage = lazy(() => import('@/_workspace/pages/(customer)/customer-ship-to/page'))
const CustomerInvoiceToPage = lazy(() => import('@/_workspace/pages/(customer)/customer-invoice-to/page'))

/* Item master */
const ItemCategoryPage = lazy(() => import('@/_workspace/pages/item-master/item-category/page'))
const MakerPage = lazy(() => import('@/_workspace/pages/item-master/maker/page'))
const VendorPage = lazy(() => import('@/_workspace/pages/item-master/vendor/page'))
const ColorPage = lazy(() => import('@/_workspace/pages/item-master/item-property/color/page'))
const ShapePage = lazy(() => import('@/_workspace/pages/item-master/item-property/shape/page'))

/* Standard Price */
const ManufacturingItemGroupPage = lazy(
  () => import('@/_workspace/pages/manufacturing-item/manufacturing-item-group/page')
)
const ManufacturingItemPage = lazy(() => import('@/_workspace/pages/manufacturing-item/item/page'))
const StandardPricePage = lazy(() => import('@/_workspace/pages/manufacturing-item/standard-price/page'))

/* Cost Condition */
const ExchangeRatePage = lazy(() => import('@/_workspace/pages/cost-condition/exchange-rate/page'))
const ImportFeePage = lazy(() => import('@/_workspace/pages/cost-condition/import-fee/page'))
const DirectCostConditionPage = lazy(() => import('@/_workspace/pages/cost-condition/direct-cost-condition/page'))
const IndirectCostConditionPage = lazy(() => import('@/_workspace/pages/cost-condition/indirect-cost-condition/page'))
const OtherCostConditionPage = lazy(() => import('@/_workspace/pages/cost-condition/other-cost-condition/page'))
const SpecialCostConditionPage = lazy(() => import('@/_workspace/pages/cost-condition/special-cost-condition/page'))

/*Bill of Material */
const BomPage = lazy(() => import('@/_workspace/pages/bill-of-material/page'))
const MaterialYieldRatePage = lazy(() => import('@/_workspace/pages/yield-rate-material/page'))

/* YR */
const YrPage = lazy(() => import('@/_workspace/pages/yield-rate-and-go-straight-rate/page'))

/* Sct */
const FiscalYearPeriodPage = lazy(() => import('@/_workspace/pages/sct/fiscal-year-period/page'))

const SctPage = lazy(() => import('@/_workspace/pages/sct/sct-for-product/page'))
const SctBomExplosionPage = lazy(() => import('@/_workspace/pages/sct/sct-bom-explosion/page'))
// const SctReCalPage = lazy(() => import('@/_workspace/pages/sct/re-cal/page'))
const PriceListPage = lazy(() => import('@/_workspace/pages/price-list/page'))

/* PC Admin */
const PCAdminPage = lazy(() => import('@/_workspace/pages/pc-admin/manufacturing-item-price/page'))

/* Add Vendor */
const AddVendorPage = lazy(() => import('@/_workspace/pages/_add-vendor/page'))

/* Find Vendor */
const FindVendorPage = lazy(() => import('@/_workspace/pages/_find-vendor/page'))

/* Request Register History */
const RequestRegisterHistoryPage = lazy(() => import('@/_workspace/pages/_request-history/page'))

/* Approval GPR C */
const ApprovalGprCPage = lazy(() => import('@/_workspace/pages/_approval-GPRC/page'))

/* Request Register (PO Dashboard) */
const RequestRegisterPage = lazy(() => import('@/_workspace/pages/_request-register/page'))

/* Account Register */
const AccRegisterPage = lazy(() => import('@/_workspace/pages/_Acc-register/page'))

/* Task Manager */
const TaskManagerPage = lazy(() => import('@/_workspace/pages/_task-manager/page'))

/* Employee Manager */
const EmployeeManagerPage = lazy(() => import('@/_workspace/pages/_Employee-manager/page'))

/* Blacklist */
const BlackListPage = lazy(() => import('@/_workspace/pages/_black-list/page'))

/* MD Approval */
const MdApprovalPage = lazy(() => import('@/_workspace/pages/_md-approval/page'))

/* PO Mgr Approval */
const PoMgrApprovalPage = lazy(() => import('@/_workspace/pages/_poMgr-approval/page'))

/* PO GM Approval */
const PoGmApprovalPage = lazy(() => import('@/_workspace/pages/_poGm-approval/page'))

/* Check Document */
const CheckDocumentPage = lazy(() => import('@/_workspace/pages/_check-document/page'))

export default (
  <>
    <Route path='/en/product-category' element={<ProductCategoryPage />} />
    <Route path='/en/product-main' element={<ProductMainPage />} />
    <Route path='/en/product-sub' element={<ProductSubPage />} />
    <Route path='/en/product-type' element={<ProductTypePage />} />

    {/* Manufacturing Item */}
    {/* Standard Price */}
    <Route path='/en/manufacturing-item/manufacturing-item-group' element={<ManufacturingItemGroupPage />} />
    <Route path='/en/manufacturing-item/item' element={<ManufacturingItemPage />} />

    <Route path='/en/manufacturing-item/standard-price' element={<StandardPricePage />} />

    <Route path='/en/' element={<ProductTypePage />} />
    {/* BOI */}
    <Route path='/en/boi-project' element={<BoiProjectPage />} />
    <Route path='/en/boi-unit' element={<BoiUnitPage />} />
    <Route path='/en/boi-name-for-material-consumable' element={<BoiNameForMaterialConsumablePage />} />

    {/* Account */}
    <Route path='/en/account-department-code' element={<AccountDepartmentCodePage />} />

    {/* Unit Of Measurement */}
    <Route path='/en/unit-of-measurement' element={<UnitOfMeasurementPage />} />

    {/* Production Control */}
    <Route path='/en/production-control/order-type' element={<OrderTypePage />} />

    {/* Customer */}
    <Route path='/en/customer-order-from' element={<CustomerOrderFromPage />} />
    <Route path='/en/customer-ship-to' element={<CustomerShipToPage />} />
    <Route path='/en/customer-invoice-to' element={<CustomerInvoiceToPage />} />

    {/* Item Master */}
    <Route path='/en/item-master/item-category' element={<ItemCategoryPage />} />
    <Route path='/en/item-master/maker' element={<MakerPage />} />
    <Route path='/en/item-master/vendor' element={<VendorPage />} />
    <Route path='/en/item-master/item-property/color' element={<ColorPage />} />
    <Route path='/en/item-master/item-property/shape' element={<ShapePage />} />

    {/* Cost Condition */}
    <Route path='/en/cost-condition/exchange-rate' element={<ExchangeRatePage />} />
    <Route path='/en/cost-condition/import-fee' element={<ImportFeePage />} />
    <Route path='/en/cost-condition/direct-cost-condition' element={<DirectCostConditionPage />} />
    <Route path='/en/cost-condition/indirect-cost-condition' element={<IndirectCostConditionPage />} />
    <Route path='/en/cost-condition/other-cost-condition' element={<OtherCostConditionPage />} />
    <Route path='/en/cost-condition/special-cost-condition' element={<SpecialCostConditionPage />} />

    {/* Bill of Material */}
    <Route path='/en/bill-of-material' element={<BomPage />} />
    <Route path='/en/yield-rate-material' element={<MaterialYieldRatePage />} />

    {/* YR */}
    <Route path='/en/yield-rate-and-go-straight-rate' element={<YrPage />} />

    {/* SCT */}
    <Route path='/en/sct/fiscal-year-period' element={<FiscalYearPeriodPage />} />

    <Route path='/en/sct/sct-for-product' element={<SctPage />} />
    <Route path='/en/sct/sct-bom-explosion' element={<SctBomExplosionPage />} />
    {/* <Route path='/en/sct/re-cal' element={<SctReCalPage />} /> */}
    <Route path='/en/price-list' element={<PriceListPage />} />

    {/* YR */}
    <Route path='/en/pc-admin/manufacturing-item-price' element={<PCAdminPage />} />

    {/* Add Vendor */}
    <Route path='/en/add-vendor' element={<AddVendorPage />} />

    {/* Find Vendor */}
    <Route path='/en/find-vendor' element={<FindVendorPage />} />

    {/* Request Register History */}
    <Route path='/en/request-register-history' element={<RequestRegisterHistoryPage />} />

    {/* Approval GPR C */}
    <Route path='/en/approval-gpr-c' element={<ApprovalGprCPage />} />

    {/* Request Register (PO Dashboard) */}
    <Route path='/en/request-register' element={<RequestRegisterPage />} />

    {/* Account Register */}
    <Route path='/en/acc-register' element={<AccRegisterPage />} />

    {/* Task Manager */}
    <Route path='/en/task-manager' element={<TaskManagerPage />} />

    {/* Employee Manager */}
    <Route path='/en/employee-manager' element={<EmployeeManagerPage />} />

    {/* Blacklist */}
    <Route path='/en/blacklist' element={<BlackListPage />} />

    {/* MD Approval */}
    <Route path='/en/md-approval' element={<MdApprovalPage />} />

    {/* PO Mgr Approval */}
    <Route path='/en/po-mgr-approval' element={<PoMgrApprovalPage />} />

    {/* PO GM Approval */}
    <Route path='/en/po-gm-approval' element={<PoGmApprovalPage />} />

    {/* Check Document */}
    <Route path='/en/check-document' element={<CheckDocumentPage />} />
  </>
)

import { lazy } from 'react'
import { Route } from 'react-router'

/* Add Vendor */
const AddVendorPage = lazy(() => import('@/_workspace/pages/_add-vendor/page'))

/* Find Vendor */
const FindVendorPage = lazy(() => import('@/_workspace/pages/_find-vendor/page'))

/* Re-register */
const ReRegisterPage = lazy(() => import('@/_workspace/pages/_Re-register/page'))

/* My Request History */
const MyRequestHistoryPage = lazy(() => import('@/_workspace/pages/_request-history/page'))

/* ALL Request History */
const AllRequestHistoryPage = lazy(() => import('@/_workspace/pages/_all-request-history/page'))

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

/* Approval Flow Setting */
const ApprovalFlowSettingPage = lazy(() => import('@/_workspace/pages/_approval-flow-setting/page'))

export default (
  <>
    {/* Add Vendor */}
    <Route path='/en/add-vendor' element={<AddVendorPage />} />

    {/* Find Vendor */}
    <Route path='/en/find-vendor' element={<FindVendorPage />} />

    {/* Re-register */}
    <Route path='/en/re-register' element={<ReRegisterPage />} />

    {/* My Request History */}
    <Route path='/en/request-register-history' element={<MyRequestHistoryPage />} />

    {/* ALL Request History */}
    <Route path='/en/all-request-history' element={<AllRequestHistoryPage />} />

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

    {/* Approval Flow Setting */}
    <Route path='/en/approval-flow' element={<ApprovalFlowSettingPage />} />
  </>
)

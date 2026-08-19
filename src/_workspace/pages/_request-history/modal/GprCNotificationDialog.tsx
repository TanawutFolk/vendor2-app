import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'react-use'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography
} from '@mui/material'
import CustomTextField from '@components/mui/TextField'
import AsyncSelectCustom from '@components/react-select/AsyncSelectCustom'
import DialogCloseButton from '@components/dialogs/DialogCloseButton'
import ConfirmModal from '@components/ConfirmModal'
import Transition from '@components/TransitionDialog'
import { ToastMessageError, ToastMessageSuccess } from '@/components/ToastMessage'
import { AxiosError } from 'axios'
import RegisterRequestServices from '@/_workspace/services/_register-request/RegisterRequestServices'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { useSaveGprCNotification } from '@/_workspace/react-query/hooks/useRegisterRequest'
import {
  fetchGprCProducts,
  type GprCProductOption
} from '@/_workspace/react-select/async-promise-load-options/request-history/fetchGprCProducts'
import {
  fetchGprCSections,
  type GprCSectionOption
} from '@/_workspace/react-select/async-promise-load-options/request-history/fetchGprCSections'
import type {
  GprCNotificationDialogProps,
  GprCFormState,
  CircularMemberInfo,
  GprCProductCheckerInfo
} from '@/_workspace/types/_request-history/RequestHistoryTypes'

const buildEmptyForm = (): GprCFormState => ({
  gpr_c_product_checkers: [
    {
      product_main_id: null,
      product_main_name: '',
      section_name: '',
      checker_empcode: '',
      checker_name: '',
      checker_email: ''
    }
  ],
  gpr_c_approver_empcode: '',
  gpr_c_approver_name: '',
  gpr_c_approver_email: '',
  gpr_c_pc_pic_empcode: '',
  gpr_c_pc_pic_name: '',
  gpr_c_pc_pic_email: '',
  gpr_c_circular_empcodes: Array.from({ length: 6 }, () => ''),
  gpr_c_circular_members: []
})

const normalizeProductCheckers = (raw: any): GprCProductCheckerInfo[] => {
  if (!raw) return []

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []

    return parsed
      .map(item => ({
        product_main_id:
          Number(
            item?.product_main_id ||
              item?.PRODUCT_MAIN_ID ||
              item?.product_group_id ||
              item?.MASTER_PRODUCT_GROUPS_ID ||
              0
          ) || null,
        product_main_name: String(
          item?.product_main_name ||
            item?.PRODUCT_MAIN_NAME ||
            item?.product_group_name ||
            item?.PRODUCT_GROUP_NAME ||
            ''
        ).trim(),
        section_name: String(item?.section_name || item?.SECTION_NAME || '').trim(),
        checker_empcode: String(item?.checker_empcode || item?.CHECKER_EMPCODE || '').trim(),
        checker_name: String(item?.checker_name || item?.CHECKER_NAME || '').trim(),
        checker_email: String(item?.checker_email || item?.CHECKER_EMAIL || '').trim()
      }))
      .filter(
        item =>
          item.product_main_id || item.section_name || item.checker_empcode || item.checker_name || item.checker_email
      )
  } catch {
    return []
  }
}

const normalizeCircularMembers = (raw: any): CircularMemberInfo[] => {
  if (!raw) return []

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!Array.isArray(parsed)) return []

    return parsed
      .map(item => ({
        empcode: String(item?.empcode || item || '').trim(),
        name: String(item?.name || '').trim(),
        email: String(item?.email || '').trim()
      }))
      .filter(item => item.empcode || item.name || item.email)
      .slice(0, 6)
  } catch {
    return []
  }
}

export default function GprCNotificationDialog({ open, rowData, onClose, onSaved }: GprCNotificationDialogProps) {
  const user = getUserData()
  const requesterCode = String(rowData?.EMPLOYEE_CODE || '').trim()
  const currentUserCode = String(user?.EMPLOYEE_CODE || '').trim()
  const isRequester = !!requesterCode && requesterCode === currentUserCode

  const [form, setForm] = useState<GprCFormState>(buildEmptyForm)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [circularCount, setCircularCount] = useState(1)
  const productCheckerLookupSeq = useRef<number[]>([0])
  const approverLookupSeq = useRef(0)
  const pcPicLookupSeq = useRef(0)
  const circularLookupSeq = useRef(Array.from({ length: 6 }, () => 0))
  const employeeProfileCache = useRef<Record<string, CircularMemberInfo>>({})

  useEffect(() => {
    if (!open || !rowData?.REQUEST_REGISTER_VENDOR_ID) return

    let active = true
    setLoading(true)

    const load = async () => {
      try {
        const res = await RegisterRequestServices.getSelectionForm({
          REQUEST_REGISTER_VENDOR_ID: Number(rowData.REQUEST_REGISTER_VENDOR_ID)
        })
        if (!active) return

        const result = res?.data?.ResultOnDb || {}
        const circularMembers = normalizeCircularMembers(
          result.gpr_c_circular_members ||
            result.GPR_C_CIRCULAR_MEMBERS ||
            result.gpr_c_circular_json ||
            result.GPR_C_CIRCULAR_JSON
        )
        const productCheckers = normalizeProductCheckers(
          result.gpr_c_product_checkers ||
            result.GPR_C_PRODUCT_CHECKERS ||
            result.gpr_c_product_group_checkers ||
            result.GPR_C_PRODUCT_GROUP_CHECKERS
        )

        const nextForm = {
          gpr_c_product_checkers:
            productCheckers.length > 0 ? productCheckers : buildEmptyForm().gpr_c_product_checkers,
          gpr_c_approver_empcode: String(
            result.gpr_c_approver_empcode || result.GPR_C_APPROVER_EMPCODE || rowData?.GPR_C_APPROVER_EMPCODE || ''
          ).trim(),
          gpr_c_approver_name: String(
            result.gpr_c_approver_name || result.GPR_C_APPROVER_NAME || rowData?.GPR_C_APPROVER_NAME || ''
          ).trim(),
          gpr_c_approver_email: String(
            result.gpr_c_approver_email || result.GPR_C_APPROVER_EMAIL || rowData?.GPR_C_APPROVER_EMAIL || ''
          ).trim(),
          gpr_c_pc_pic_empcode: String(
            result.gpr_c_pc_pic_empcode || result.GPR_C_PC_PIC_EMPCODE || rowData?.GPR_C_PC_PIC_EMPCODE || ''
          ).trim(),
          gpr_c_pc_pic_name: String(
            result.gpr_c_pc_pic_name || result.GPR_C_PC_PIC_NAME || rowData?.GPR_C_PC_PIC_NAME || ''
          ).trim(),
          gpr_c_pc_pic_email: String(
            result.gpr_c_pc_pic_email || result.GPR_C_PC_PIC_EMAIL || rowData?.GPR_C_PC_PIC_EMAIL || ''
          ).trim(),
          gpr_c_circular_empcodes: Array.from({ length: 6 }, (_, idx) => circularMembers[idx]?.empcode || ''),
          gpr_c_circular_members: circularMembers
        }
        setForm(nextForm)
        productCheckerLookupSeq.current = nextForm.gpr_c_product_checkers.map(() => 0)
        setCircularCount(Math.max(1, Math.min(6, circularMembers.length || 1)))
      } catch {
        if (!active) return
        const circularMembers = normalizeCircularMembers(rowData?.GPR_C_CIRCULAR_JSON)
        const productCheckers = normalizeProductCheckers(
          rowData?.GPR_C_PRODUCT_CHECKERS || rowData?.GPR_C_PRODUCT_GROUP_CHECKERS
        )
        const fallbackForm = {
          gpr_c_product_checkers:
            productCheckers.length > 0 ? productCheckers : buildEmptyForm().gpr_c_product_checkers,
          gpr_c_approver_empcode: String(rowData?.GPR_C_APPROVER_EMPCODE || '').trim(),
          gpr_c_approver_name: String(rowData?.GPR_C_APPROVER_NAME || '').trim(),
          gpr_c_approver_email: String(rowData?.GPR_C_APPROVER_EMAIL || '').trim(),
          gpr_c_pc_pic_empcode: String(rowData?.GPR_C_PC_PIC_EMPCODE || '').trim(),
          gpr_c_pc_pic_name: String(rowData?.GPR_C_PC_PIC_NAME || '').trim(),
          gpr_c_pc_pic_email: String(rowData?.GPR_C_PC_PIC_EMAIL || '').trim(),
          gpr_c_circular_empcodes: Array.from({ length: 6 }, (_, idx) => circularMembers[idx]?.empcode || ''),
          gpr_c_circular_members: circularMembers
        }
        setForm(fallbackForm)
        productCheckerLookupSeq.current = fallbackForm.gpr_c_product_checkers.map(() => 0)
        setCircularCount(Math.max(1, Math.min(6, circularMembers.length || 1)))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [open, rowData])

  const lookupEmployeeProfile = async (empcodeRaw: string): Promise<CircularMemberInfo | null> => {
    const empcode = String(empcodeRaw || '').trim()
    if (!empcode) return null

    const cacheKey = empcode.toUpperCase()
    if (employeeProfileCache.current[cacheKey]) return employeeProfileCache.current[cacheKey]

    const response = await RegisterRequestServices.resolveEmployeeProfile({ EMPCODE: empcode })
    if (!response.data.Status) {
      throw new Error(response.data.Message || `Employee code not found: ${empcode}`)
    }

    const profile = response.data.ResultOnDb || null
    if (profile) employeeProfileCache.current[cacheKey] = profile

    return profile
  }

  useDebounce(
    () => {
      if (!open) return

      form.gpr_c_product_checkers.forEach((item, index) => {
        const empcode = String(item.checker_empcode || '').trim()
        productCheckerLookupSeq.current[index] = (productCheckerLookupSeq.current[index] || 0) + 1
        const requestSeq = productCheckerLookupSeq.current[index]

        if (!empcode) return
        if (item.checker_name && item.checker_email) return

        void lookupEmployeeProfile(empcode)
          .then(member => {
            if (!member || requestSeq !== productCheckerLookupSeq.current[index]) return

            setForm(prev => {
              const current = prev.gpr_c_product_checkers[index]
              if (String(current?.checker_empcode || '').trim() !== empcode) return prev

              const next = [...prev.gpr_c_product_checkers]
              next[index] = {
                ...current,
                checker_empcode: member.empcode || empcode,
                checker_name: member.name || '',
                checker_email: member.email || ''
              }
              return { ...prev, gpr_c_product_checkers: next }
            })
          })
          .catch(() => {
            if (requestSeq !== productCheckerLookupSeq.current[index]) return

            setForm(prev => {
              const current = prev.gpr_c_product_checkers[index]
              if (String(current?.checker_empcode || '').trim() !== empcode) return prev

              const next = [...prev.gpr_c_product_checkers]
              next[index] = { ...current, checker_name: '', checker_email: '' }
              return { ...prev, gpr_c_product_checkers: next }
            })
          })
      })
    },
    450,
    [form.gpr_c_product_checkers.map(item => item.checker_empcode).join('|'), open]
  )

  useDebounce(
    () => {
      const empcode = String(form.gpr_c_approver_empcode || '').trim()
      approverLookupSeq.current += 1
      const requestSeq = approverLookupSeq.current

      if (!open || !empcode) return
      if (form.gpr_c_approver_name && form.gpr_c_approver_email) return

      void lookupEmployeeProfile(empcode)
        .then(member => {
          if (!member || requestSeq !== approverLookupSeq.current) return

          setForm(prev =>
            String(prev.gpr_c_approver_empcode || '').trim() === empcode
              ? {
                  ...prev,
                  gpr_c_approver_name: member.name || '',
                  gpr_c_approver_email: member.email || ''
                }
              : prev
          )
        })
        .catch(() => {
          if (requestSeq !== approverLookupSeq.current) return
          setForm(prev =>
            String(prev.gpr_c_approver_empcode || '').trim() === empcode
              ? { ...prev, gpr_c_approver_name: '', gpr_c_approver_email: '' }
              : prev
          )
        })
    },
    450,
    [form.gpr_c_approver_empcode, open]
  )

  useDebounce(
    () => {
      const empcode = String(form.gpr_c_pc_pic_empcode || '').trim()
      pcPicLookupSeq.current += 1
      const requestSeq = pcPicLookupSeq.current

      if (!open || !empcode) return
      if (form.gpr_c_pc_pic_name && form.gpr_c_pc_pic_email) return

      void lookupEmployeeProfile(empcode)
        .then(member => {
          if (!member || requestSeq !== pcPicLookupSeq.current) return

          setForm(prev =>
            String(prev.gpr_c_pc_pic_empcode || '').trim() === empcode
              ? {
                  ...prev,
                  gpr_c_pc_pic_name: member.name || '',
                  gpr_c_pc_pic_email: member.email || ''
                }
              : prev
          )
        })
        .catch(() => {
          if (requestSeq !== pcPicLookupSeq.current) return
          setForm(prev =>
            String(prev.gpr_c_pc_pic_empcode || '').trim() === empcode
              ? { ...prev, gpr_c_pc_pic_name: '', gpr_c_pc_pic_email: '' }
              : prev
          )
        })
    },
    450,
    [form.gpr_c_pc_pic_empcode, open]
  )

  useDebounce(
    () => {
      if (!open) return

      form.gpr_c_circular_empcodes.slice(0, circularCount).forEach((rawEmpcode, index) => {
        const empcode = String(rawEmpcode || '').trim()
        circularLookupSeq.current[index] += 1
        const requestSeq = circularLookupSeq.current[index]

        if (!empcode) return
        const currentMember = form.gpr_c_circular_members[index]
        if (
          String(currentMember?.empcode || '')
            .trim()
            .toUpperCase() === empcode.toUpperCase() &&
          currentMember?.name &&
          currentMember?.email
        )
          return

        void lookupEmployeeProfile(empcode)
          .then(member => {
            if (!member || requestSeq !== circularLookupSeq.current[index]) return

            setForm(prev => {
              if (String(prev.gpr_c_circular_empcodes[index] || '').trim() !== empcode) return prev

              const nextMembers = [...prev.gpr_c_circular_members]
              nextMembers[index] = {
                empcode: member.empcode || empcode,
                name: member.name || '',
                email: member.email || ''
              }

              return { ...prev, gpr_c_circular_members: nextMembers }
            })
          })
          .catch(() => {
            if (requestSeq !== circularLookupSeq.current[index]) return

            setForm(prev => {
              if (String(prev.gpr_c_circular_empcodes[index] || '').trim() !== empcode) return prev

              const nextMembers = [...prev.gpr_c_circular_members]
              nextMembers[index] = { empcode: '', name: '', email: '' }

              return { ...prev, gpr_c_circular_members: nextMembers }
            })
          })
      })
    },
    450,
    [form.gpr_c_circular_empcodes.slice(0, circularCount).join('|'), circularCount, open]
  )

  const handleProductChange = (index: number, option: GprCProductOption | null) => {
    setForm(prev => {
      const next = [...prev.gpr_c_product_checkers]
      next[index] = {
        ...next[index],
        product_main_id: option?.PRODUCT_MAIN_ID || null,
        product_main_name: option
          ? `${option.PRODUCT_MAIN_NAME.trim()} (${option.PRODUCT_MAIN_ALPHABET.trim()})`
          : '',
        section_name: option ? '' : next[index].section_name
      }
      return { ...prev, gpr_c_product_checkers: next }
    })
  }

  const handleSectionChange = (index: number, option: GprCSectionOption | null) => {
    setForm(prev => {
      const next = [...prev.gpr_c_product_checkers]
      next[index] = {
        ...next[index],
        product_main_id: option ? null : next[index].product_main_id,
        product_main_name: option ? '' : next[index].product_main_name,
        section_name: option?.SECT_NAME || ''
      }
      return { ...prev, gpr_c_product_checkers: next }
    })
  }

  const handleProductCheckerChange = (index: number, value: string) => {
    setForm(prev => {
      const next = [...prev.gpr_c_product_checkers]
      next[index] = {
        ...next[index],
        checker_empcode: value,
        checker_name: '',
        checker_email: ''
      }
      return { ...prev, gpr_c_product_checkers: next }
    })

    if (!String(value || '').trim()) {
      productCheckerLookupSeq.current[index] = (productCheckerLookupSeq.current[index] || 0) + 1
    }
  }

  const handleAddProductChecker = () => {
    setForm(prev => ({
      ...prev,
      gpr_c_product_checkers: [
        ...prev.gpr_c_product_checkers,
        {
          product_main_id: null,
          product_main_name: '',
          section_name: '',
          checker_empcode: '',
          checker_name: '',
          checker_email: ''
        }
      ]
    }))
    productCheckerLookupSeq.current.push(0)
  }

  const handleRemoveProductChecker = (index: number) => {
    setForm(prev => ({
      ...prev,
      gpr_c_product_checkers: prev.gpr_c_product_checkers.filter((_, itemIndex) => itemIndex !== index)
    }))
    productCheckerLookupSeq.current = productCheckerLookupSeq.current.filter((_, itemIndex) => itemIndex !== index)
  }

  const handleApproverChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      gpr_c_approver_empcode: value,
      gpr_c_approver_name: '',
      gpr_c_approver_email: ''
    }))

    if (!String(value || '').trim()) approverLookupSeq.current += 1
  }

  const handlePcPicChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      gpr_c_pc_pic_empcode: value,
      gpr_c_pc_pic_name: '',
      gpr_c_pc_pic_email: ''
    }))

    if (!String(value || '').trim()) pcPicLookupSeq.current += 1
  }

  const handleCircularChange = (index: number, value: string) => {
    setForm(prev => {
      const next = [...prev.gpr_c_circular_empcodes]
      next[index] = value
      const nextMembers = [...prev.gpr_c_circular_members]
      nextMembers[index] = { empcode: '', name: '', email: '' }
      return { ...prev, gpr_c_circular_empcodes: next, gpr_c_circular_members: nextMembers }
    })

    if (!String(value || '').trim()) circularLookupSeq.current[index] += 1
  }

  const handleAddCircular = () => {
    setCircularCount(prev => Math.min(6, prev + 1))
  }

  const handleRemoveCircular = (index: number) => {
    setForm(prev => {
      const nextEmpcodes = prev.gpr_c_circular_empcodes.filter((_, idx) => idx !== index)
      const nextMembers = prev.gpr_c_circular_members.filter((_, idx) => idx !== index)
      return {
        ...prev,
        gpr_c_circular_empcodes: [...nextEmpcodes, ''].slice(0, 6),
        gpr_c_circular_members: [...nextMembers, { empcode: '', name: '', email: '' }].slice(0, 6)
      }
    })
    setCircularCount(prev => Math.max(1, prev - 1))
  }

  const getValidationMessage = () => {
    if (form.gpr_c_product_checkers.length === 0) {
      return 'Please add at least one Product Main or Section and Checker.'
    }

    const selectedProductIds = new Set<number>()
    const selectedSections = new Set<string>()
    for (const [index, item] of form.gpr_c_product_checkers.entries()) {
      const hasProduct = Boolean(item.product_main_id)
      const sectionName = String(item.section_name || '').trim()
      const hasSection = Boolean(sectionName)
      if (Number(hasProduct) + Number(hasSection) !== 1) {
        return `Please select either Product Main or Section for row ${index + 1}.`
      }
      if (item.product_main_id) {
        if (selectedProductIds.has(item.product_main_id)) return 'Product Main cannot be selected more than once.'
        selectedProductIds.add(item.product_main_id)
      } else {
        const sectionKey = sectionName.toUpperCase()
        if (selectedSections.has(sectionKey)) return 'Section cannot be selected more than once.'
        selectedSections.add(sectionKey)
      }
      if (!String(item.checker_empcode || '').trim()) return `Please enter Checker Employee Code for row ${index + 1}.`
      if (!item.checker_name || !item.checker_email) return `Checker Employee Code is invalid for row ${index + 1}.`
    }

    if (!String(form.gpr_c_approver_empcode || '').trim()) return 'Please enter GPR C Approver Employee Code.'
    if (!form.gpr_c_approver_name || !form.gpr_c_approver_email) return 'GPR C Approver Employee Code is invalid.'
    if (!String(form.gpr_c_pc_pic_empcode || '').trim()) return 'Please enter PC PIC Employee Code.'
    if (!form.gpr_c_pc_pic_name || !form.gpr_c_pc_pic_email) return 'PC PIC Employee Code is invalid.'

    for (let index = 0; index < circularCount; index += 1) {
      const empcode = String(form.gpr_c_circular_empcodes[index] || '').trim()
      if (!empcode) continue
      const member = form.gpr_c_circular_members[index]
      if (!member?.name || !member?.email) return `Circular Employee Code is invalid for row ${index + 1}.`
    }

    return ''
  }

  const openConfirmSave = () => {
    if (!rowData?.REQUEST_REGISTER_VENDOR_ID) return
    if (!isRequester) {
      ToastMessageError({ title: 'GPR C Notification', message: 'Only requester can update this section.' })
      return
    }
    const validationMessage = getValidationMessage()
    if (validationMessage) {
      ToastMessageError({ title: 'GPR C Notification', message: validationMessage })
      return
    }
    setConfirmOpen(true)
  }

  const saveMutation = useSaveGprCNotification(
    (data: any) => {
      ToastMessageSuccess({ title: 'GPR C Notification', message: data?.Message || 'GPR C notification setup saved.' })
      setConfirmOpen(false)
      onSaved?.()
    },
    (error: unknown) => {
      let message = 'Failed to save GPR C notification setup'
      if (error instanceof AxiosError) {
        message = (error.response?.data as any)?.Message || error.message
      } else if (error instanceof Error) {
        message = error.message
      }
      ToastMessageError({ title: 'GPR C Notification', message })
    }
  )

  const handleSave = () => {
    if (!rowData?.REQUEST_REGISTER_VENDOR_ID) return
    if (!isRequester) {
      ToastMessageError({ title: 'GPR C Notification', message: 'Only requester can update this section.' })
      return
    }
    const validationMessage = getValidationMessage()
    if (validationMessage) {
      ToastMessageError({ title: 'GPR C Notification', message: validationMessage })
      return
    }

    saveMutation.mutate({
      request_id: Number(rowData.REQUEST_REGISTER_VENDOR_ID),
      gpr_c_data: {
        gpr_c_product_checkers: form.gpr_c_product_checkers.map(item => ({
          product_main_id: item.product_main_id,
          product_main_name: item.product_main_name,
          section_name: String(item.section_name || '').trim(),
          checker_empcode: String(item.checker_empcode || '').trim()
        })),
        gpr_c_approver_empcode: form.gpr_c_approver_empcode,
        gpr_c_pc_pic_empcode: form.gpr_c_pc_pic_empcode,
        gpr_c_pc_pic_name: form.gpr_c_pc_pic_name,
        gpr_c_pc_pic_email: form.gpr_c_pc_pic_email,
        gpr_c_circular_empcodes: form.gpr_c_circular_empcodes
          .map(v => String(v || '').trim())
          .filter(Boolean)
          .slice(0, 6)
      },
      CREATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM',
      UPDATE_BY: user?.EMPLOYEE_CODE || 'SYSTEM'
    })
  }

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: 'calc(100% - 32px)', sm: 860 },
          maxWidth: 860,
          bgcolor: 'background.default',
          top: { sm: 30 },
          m: { xs: 2, sm: 0 }
        }
      }}
      sx={{
        '& .MuiDialog-paper': { overflow: 'visible' },
        '& .MuiDialog-container': { justifyContent: 'center', alignItems: 'flex-start' }
      }}
    >
      <DialogTitle sx={{ px: 4, py: 4, position: 'relative' }}>
        <Typography variant='h5' component='span' fontWeight={800}>
          Requester GPR C Approval Setup
        </Typography>
        <DialogCloseButton onClick={onClose} disableRipple>
          <i className='tabler-x' />
        </DialogCloseButton>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 4, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Grid container spacing={2} columns={{ xs: 12, md: 14 }}>
              <Grid item xs={12} md={14}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    Product Main / Section Checker
                  </Typography>
                </Divider>
              </Grid>
              {form.gpr_c_product_checkers.map((item, index) => (
                <Grid key={`product-checker-${index}`} item xs={12} md={14} sx={{ position: 'relative' }}>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={12} md={6}>
                      <AsyncSelectCustom<GprCProductOption>
                        label={`Product Main ${index + 1}`}
                        placeholder='Select Product Main...'
                        defaultOptions
                        cacheOptions
                        isClearable
                        isDisabled={!isRequester || Boolean(item.section_name)}
                        loadOptions={inputValue => fetchGprCProducts(inputValue)}
                        value={
                          item.product_main_id
                            ? {
                                PRODUCT_MAIN_ID: item.product_main_id,
                                PRODUCT_MAIN_NAME: item.product_main_name.replace(/\s*\([^()]*\)\s*$/, ''),
                                PRODUCT_MAIN_ALPHABET: item.product_main_name.match(/\(([^()]*)\)\s*$/)?.[1] || ''
                              }
                            : null
                        }
                        onChange={option => handleProductChange(index, option)}
                        getOptionLabel={option =>
                          `${option.PRODUCT_MAIN_NAME.trim()} (${option.PRODUCT_MAIN_ALPHABET.trim()})`
                        }
                        getOptionValue={option => option.PRODUCT_MAIN_ID.toString()}
                        classNamePrefix='select'
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <AsyncSelectCustom<GprCSectionOption>
                        label={`Section Checker ${index + 1}`}
                        placeholder='Select Section...'
                        defaultOptions
                        cacheOptions
                        isClearable
                        isDisabled={!isRequester || Boolean(item.product_main_id)}
                        loadOptions={inputValue => fetchGprCSections(inputValue)}
                        value={item.section_name ? { SECT_NAME: item.section_name } : null}
                        onChange={option => handleSectionChange(index, option)}
                        getOptionLabel={option => option.SECT_NAME}
                        getOptionValue={option => option.SECT_NAME}
                        classNamePrefix='select'
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems='center' columns={{ xs: 12, md: 14 }}>
                        <Grid item xs={12} md={2}>
                          <CustomTextField
                            fullWidth
                            label={`Checker EmpCode ${index + 1} *`}
                            placeholder='S00000'
                            value={item.checker_empcode}
                            onChange={event => handleProductCheckerChange(index, event.target.value)}
                            disabled={!isRequester}
                          />
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <CustomTextField
                            fullWidth
                            label={`Checker Name ${index + 1}`}
                            value={item.checker_name}
                            disabled
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <CustomTextField
                            fullWidth
                            label={`Checker Email ${index + 1}`}
                            value={item.checker_email}
                            disabled
                          />
                        </Grid>
                        {form.gpr_c_product_checkers.length > 1 && (
                          <Grid
                            item
                            xs={12}
                            md={1}
                            sx={{
                              display: 'flex',
                              alignSelf: 'stretch',
                              alignItems: 'flex-end',
                              justifyContent: { xs: 'flex-end', md: 'flex-start' }
                            }}
                          >
                            <Button
                              size='small'
                              color='error'
                              variant='tonal'
                              onClick={() => handleRemoveProductChecker(index)}
                              disabled={!isRequester}
                              sx={{ minWidth: 0, width: '100%', height: 38, p: 0 }}
                            >
                              <i className='tabler-trash' style={{ fontSize: 15 }} />
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12} md={13} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant='outlined'
                  startIcon={<i className='tabler-plus' />}
                  onClick={handleAddProductChecker}
                  disabled={!isRequester}
                  sx={{ borderStyle: 'dashed' }}
                >
                  Add Product Main / Section & Checker
                </Button>
              </Grid>
              <Grid item xs={12} md={14}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    GPR C Approver
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} md={2}>
                <CustomTextField
                  fullWidth
                  placeholder='Employee Code'
                  label='GPR C Approver *'
                  value={form.gpr_c_approver_empcode}
                  onChange={e => handleApproverChange(e.target.value)}
                  disabled={!isRequester}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <CustomTextField fullWidth label='Approver Name' value={form.gpr_c_approver_name} disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField fullWidth label='Approver Email' value={form.gpr_c_approver_email} disabled />
              </Grid>
              <Grid item xs={12} md={14}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    PC PIC
                  </Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} md={2}>
                <CustomTextField
                  fullWidth
                  label='PC PIC EmpCode *'
                  placeholder='S00000'
                  value={form.gpr_c_pc_pic_empcode}
                  onChange={e => handlePcPicChange(e.target.value)}
                  disabled={!isRequester}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <CustomTextField
                  fullWidth
                  label='PC PIC Name'
                  value={form.gpr_c_pc_pic_name}
                  onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_name: e.target.value }))}
                  disabled={!isRequester}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomTextField
                  fullWidth
                  label='PC PIC Email'
                  value={form.gpr_c_pc_pic_email}
                  onChange={e => setForm(prev => ({ ...prev, gpr_c_pc_pic_email: e.target.value }))}
                  disabled={!isRequester}
                />
              </Grid>
              <Grid item xs={12} md={14}>
                <Divider textAlign='left'>
                  <Typography variant='body2' color='primary'>
                    Circular List
                  </Typography>
                </Divider>
              </Grid>
              {Array.from({ length: circularCount }).map((_, index) => {
                const memberInfo = form.gpr_c_circular_members[index]

                return (
                  <Grid key={index} item xs={12} md={14} sx={{ position: 'relative' }}>
                    <Grid container spacing={2} alignItems='center' columns={{ xs: 12, md: 14 }}>
                      <Grid item xs={12} md={2}>
                        <CustomTextField
                          fullWidth
                          label={`Circular EmpCode ${index + 1}`}
                          placeholder='S00000'
                          value={form.gpr_c_circular_empcodes[index] || ''}
                          onChange={e => handleCircularChange(index, e.target.value)}
                          disabled={!isRequester}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <CustomTextField
                          fullWidth
                          label={`Circular Name ${index + 1}`}
                          value={memberInfo?.name || ''}
                          disabled
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <CustomTextField
                          fullWidth
                          label={`Circular Email ${index + 1}`}
                          value={memberInfo?.email || ''}
                          disabled
                        />
                      </Grid>
                      {circularCount > 1 && (
                        <Grid
                          item
                          xs={12}
                          md={1}
                          sx={{
                            display: 'flex',
                            alignSelf: 'stretch',
                            alignItems: 'flex-end',
                            justifyContent: { xs: 'flex-end', md: 'flex-start' }
                          }}
                        >
                          <Button
                            size='small'
                            color='error'
                            variant='tonal'
                            onClick={() => handleRemoveCircular(index)}
                            disabled={!isRequester}
                            sx={{ minWidth: 0, width: '100%', height: 38, p: 0 }}
                          >
                            <i className='tabler-trash' style={{ fontSize: 15 }} />
                          </Button>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                )
              })}
              {circularCount < 6 && (
                <Grid item xs={12} md={13} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant='outlined'
                    startIcon={<i className='tabler-plus' />}
                    onClick={handleAddCircular}
                    disabled={!isRequester}
                    sx={{ borderStyle: 'dashed' }}
                  >
                    Add Circular List
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'flex-end',
          px: 4,
          py: 3,
          gap: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        {isRequester && (
          <Button
            variant='contained'
            color='success'
            onClick={openConfirmSave}
            disabled={saveMutation.isPending || loading}
            startIcon={
              saveMutation.isPending ? (
                <CircularProgress size={14} color='inherit' />
              ) : (
                <i className='tabler-device-floppy' />
              )
            }
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Setup'}
          </Button>
        )}
        <Button variant='tonal' color='secondary' onClick={onClose} disabled={saveMutation.isPending}>
          {isRequester ? 'Cancel' : 'Close'}
        </Button>
      </DialogActions>
      <ConfirmModal
        show={confirmOpen}
        onConfirmClick={handleSave}
        onCloseClick={() => setConfirmOpen(false)}
        isLoading={saveMutation.isPending}
        isDelete={false}
      />
    </Dialog>
  )
}

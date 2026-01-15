import { useMemo, useState } from 'react'

import {
  MaterialReactTable,

  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
  MRT_FilterFns
} from 'material-react-table'
import { Box, Breadcrumbs, Button, Divider, Grid, IconButton, Tooltip, Typography } from '@mui/material'
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { FormProvider, useForm, useFormState } from 'react-hook-form'
import {
  Input,
  any,
  array,
  boolean,
  nullable,
  number,
  object,
  optional,
  picklist,
  record,
  string,
  unknown
} from 'valibot'
import { getUserData } from '@/utils/user-profile/userLoginProfile'
import { UserProfileSettingProgramI } from '@/types/common-system/UserProfileSettingProgram'

import { valibotResolver } from '@hookform/resolvers/valibot'
import UserProfileSettingProgramServices from '@/services/common-system/UserProfileSettingProgramServices'
import ResultDataResponseI from '@/libs/axios/types/ResultDataResponseI'
import { safeJsonParse } from '@/utils/formatting-checking-value/safeJsonParse'
import CustomerShipToWatch from './CustomerShipToWatch'
// import EditingInlineCell from '../product-main/EditingInlineCell copy 2'

import SkeletonCustom from '@/components/SkeletonCustom'

import CustomerShipToSearch from './CustomerShipToSearch'
import CustomerShipToTableData from './CustomerShipToTableData'
import AxiosResponseI from '@/libs/axios/types/ResultDataResponseI'
import { useUpdateEffect } from 'react-use'
import dayjs from 'dayjs'
import { MENU_ID } from './env'

export type FormData = Input<typeof schema>

const schema = object({
  searchFilters: object({
    customerShipToName: string(),
    customerShipToAlphabet: string(),
    status: nullable(
      object({
        value: number(),
        label: string()
      })
    )
  }),
  searchResults: object({
    pageSize: number(),
    columnFilters: array(
      object({
        id: string(),
        value: unknown()
      })
    ),
    sorting: array(
      object({
        desc: boolean(),
        id: string()
      })
    ),
    density: picklist(['comfortable', 'compact', 'spacious']),
    columnVisibility: record(string(), boolean()),
    columnPinning: object({
      left: optional(array(string())),
      right: optional(array(string()))
    }),
    columnOrder: array(string()),
    columnFilterFns: record(string(), any())
  })
})

const getUrlParamSearch = ({ USER_ID, APPLICATION_ID, MENU_ID }: UserProfileSettingProgramI): string => {
  let params = ``

  params += `"USER_ID":"${USER_ID}"`
  params += `, "APPLICATION_ID":"${APPLICATION_ID}"`
  params += `, "MENU_ID":"${MENU_ID}"`

  params = `{${params}}`

  return params
}

const paramForSearch: UserProfileSettingProgramI = {
  USER_ID: Number(getUserData().USER_ID),
  APPLICATION_ID: Number(import.meta.env.VITE_APPLICATION_ID),
  MENU_ID: MENU_ID
}

const columnsShipTo = [
  'mrt-row-actions',
  'inuseForSearch',
  'CUSTOMER_SHIP_TO_ID',
  'CUSTOMER_SHIP_TO_NAME',
  'CUSTOMER_SHIP_TO_ALPHABET',
  'CREATE_BY',
  'CREATE_DATE',
  'UPDATE_BY',
  'UPDATE_DATE'
]

const CustomerShipTo = () => {
  const [isEnableFetching, setIsEnableFetching] = useState(false)
  const reactHookFormMethods = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: async (): Promise<FormData> => {
      // const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
      //   ResultDataResponseI<UserProfileSettingProgramI>
      // >(getUrlParamSearch(paramForSearch))
      try {
        const result = await UserProfileSettingProgramServices.getByUserIdAndApplicationIdAndMenuId<
          AxiosResponseI<UserProfileSettingProgramI<FormData>>
        >(getUrlParamSearch(paramForSearch))

        const columnsDifference = columnsShipTo.filter(
          element =>
            !result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder.includes(
              element
            )
        )
        const columnFilters =
          result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults?.columnFilters.map(item => {
            if (item.id === 'CREATE_DATE' || item.id === 'UPDATE_DATE') {
              const value = (item?.value as string) || ''

              return {
                id: item.id,
                value: dayjs(value).isValid() ? dayjs(value) : null
              }
            } else {
              return item
            }
          })

        return {
          searchFilters: {
            customerShipToName:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.customerShipToName || '',
            customerShipToAlphabet:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.customerShipToAlphabet ||
              '',
            status: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchFilters.status || null
          },
          searchResults: {
            // pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            // columnFilters: [],
            // sorting: [],
            // density: 'comfortable',
            // columnVisibility: {},
            // columnPinning: { left: [], right: [] },
            // columnOrder:
            //   result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder?.concat(
            //     columnsDifference
            //   ) || [],
            // columnFilterFns: {}
            pageSize: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.pageSize || 10,
            columnFilters: columnFilters || [],
            sorting: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.sorting || [],
            density:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.density || 'compact',
            columnVisibility: {
              CUSTOMER_SHIP_TO_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_SHIP_TO_NAME ?? true,
              CUSTOMER_SHIP_TO_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CUSTOMER_SHIP_TO_ALPHABET ?? true,
              CREATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CREATE_BY ?? true,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_BY ?? true,
              CREATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .CREATE_DATE ?? true,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .UPDATE_DATE ?? true,
              inuseForSearch:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnVisibility
                  .inuseForSearch ?? true
            },
            columnPinning: result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults
              .columnPinning || { left: [], right: [] },
            columnOrder:
              result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnOrder?.concat(
                columnsDifference
              ) || [],
            columnFilterFns: {
              CUSTOMER_SHIP_TO_NAME:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_SHIP_TO_NAME || MRT_FilterFns.contains.name,
              CUSTOMER_SHIP_TO_ALPHABET:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CUSTOMER_SHIP_TO_ALPHABET || MRT_FilterFns.contains.name,
              CREATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CREATE_BY || MRT_FilterFns.contains.name,
              UPDATE_BY:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_BY || MRT_FilterFns.contains.name,
              CREATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .CREATE_DATE || MRT_FilterFns.equals.name,
              UPDATE_DATE:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .UPDATE_DATE || MRT_FilterFns.equals.name,
              inuseForSearch:
                result?.data?.ResultOnDb?.[0]?.USER_PROFILE_SETTING_PROGRAM_DATA?.searchResults.columnFilterFns
                  .inuseForSearch || ''
            }
          }
        }
      } catch (error) {
        return {
          searchFilters: {
            customerShipToName: '',
            customerShipToAlphabet: '',
            status: null
          },
          searchResults: {
            pageSize: 10,
            columnFilters: [],
            sorting: [],
            density: 'compact',
            columnVisibility: {
              CUSTOMER_SHIP_TO_ID: false,
              CUSTOMER_SHIP_TO_NAME: true,
              CUSTOMER_SHIP_TO_ALPHABET: true,
              CREATE_BY: true,
              CREATE_DATE: true,
              UPDATE_DATE: true,
              UPDATE_BY: true,
              inuseForSearch: true
            },
            columnPinning: { left: [], right: [] },
            columnOrder: columnsShipTo,
            columnFilterFns: {
              CUSTOMER_SHIP_TO_ID: MRT_FilterFns.contains.name,
              CUSTOMER_SHIP_TO_NAME: MRT_FilterFns.contains.name,
              CUSTOMER_SHIP_TO_ALPHABET: MRT_FilterFns.contains.name,
              CREATE_BY: MRT_FilterFns.contains.name,
              CREATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_DATE: MRT_FilterFns.contains.name,
              UPDATE_BY: MRT_FilterFns.equals.name,
              inuseForSearch: MRT_FilterFns.contains.name
            }
          }
        }
      }
    }
  })

  const { isLoading } = useFormState({
    control: reactHookFormMethods.control
  })

  useUpdateEffect(() => {
    setIsEnableFetching(true)
  }, [isLoading])

  const breadcrumbs = [
    <Typography key='1' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Home
    </Typography>,
    <Typography key='2' sx={{ color: 'var(--mui-palette-text-secondary) !important' }}>
      Customer
    </Typography>,
    <Typography key='3' sx={{ color: 'var(--mui-palette-text-primary) !important' }}>
      Customer Ship To
    </Typography>
  ]

  return (
    <Grid container spacing={6}>
      <FormProvider {...reactHookFormMethods}>
        <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant='h4'>Customer Ship To</Typography>
          <Divider orientation='vertical' flexItem />
          <Breadcrumbs
            separator='›'
            aria-label='breadcrumb'
            sx={{
              display: 'inline-block'
            }}
          >
            {breadcrumbs}
          </Breadcrumbs>
          {isLoading ? null : <CustomerShipToWatch />}
        </Grid>
        {/* <Grid item xs={12}>
          <EditingInlineCell />
        </Grid> */}
        <Grid item xs={12}>
          <CustomerShipToSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            <SkeletonCustom />
          ) : (
            <CustomerShipToTableData isEnableFetching={isEnableFetching} setIsEnableFetching={setIsEnableFetching} />
          )}
        </Grid>
      </FormProvider>
    </Grid>
  )

  // const columns = useMemo<MRT_ColumnDef<ProductMainInterface>[]>(
  //   () => [
  //     {
  //       accessorKey: 'firstName',
  //       header: 'First Name',
  //       Cell: ({ row }) => {
  //         return (
  //           <Controller
  //             name='searchFilters.productCategory'
  //             control={control}
  //             render={({ field: { ...fieldProps } }) => (
  //               <AsyncSelectCustom
  //                 label='Product Category'
  //                 {...fieldProps}
  //                 isClearable
  //                 cacheOptions
  //                 defaultOptions
  //                 loadOptions={inputValue => {
  //                   return fetchProductCategoryByLikeProductCategoryNameAndInuse(inputValue, '1')
  //                 }}
  //                 getOptionLabel={data => data.PRODUCT_CATEGORY_NAME}
  //                 getOptionValue={data => data.PRODUCT_CATEGORY_ID.toString()}
  //                 classNamePrefix='select'
  //                 placeholder='Select Product Category ...'
  //               />
  //             )}
  //           />
  //         )
  //       },
  //       Edit: ({ row }) => {
  //         return 'test'
  //       }
  //     }
  //   ],
  //   []
  // )

  // //call CREATE hook
  // const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser()

  // //call READ hook
  // const {
  //   data: fetchedUsers = [],
  //   isError: isLoadingUsersError,
  //   isFetching: isFetchingUsers,
  //   isLoading: isLoadingUsers
  // } = useGetUsers()

  // //call UPDATE hook
  // const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUser()

  // //call DELETE hook
  // const { mutateAsync: deleteUser, isPending: isDeletingUser } = useDeleteUser()

  // //CREATE action
  // const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({ values, table }) => {
  //   // const newValidationErrors = validateUser(values)

  //   // if (Object.values(newValidationErrors).some(error => error)) {
  //   //   setValidationErrors(newValidationErrors)

  //   //   return
  //   // }

  //   // setValidationErrors({})
  //   await createUser(values)
  //   table.setCreatingRow(null) //exit creating mode
  // }

  // //UPDATE action
  // const handleSaveUser: MRT_TableOptions<ProductMainInterface>['onEditingRowSave'] = async ({ values, table }) => {
  //   // const newValidationErrors = validateUser(values)

  //   // if (Object.values(newValidationErrors).some(error => error)) {
  //   //   setValidationErrors(newValidationErrors)

  //   //   return
  //   // }

  //   // setValidationErrors({})
  //   await updateUser(values)
  //   table.setEditingRow(null) //exit editing mode
  // }

  // //DELETE action
  // const openDeleteConfirmModal = (row: MRT_Row<ProductMainInterface>) => {
  //   if (window.confirm('Are you sure you want to delete this user?')) {
  //     deleteUser(row.original.id)
  //   }
  // }

  // const table = useMaterialReactTable({
  //   columns,
  //   data: fetchedUsers,
  //   createDisplayMode: 'row', // ('modal', and 'custom' are also available)
  //   editDisplayMode: 'custom', // ('modal', 'cell', 'table', and 'custom' are also available)
  //   enableEditing: true,
  //   getRowId: row => row.id,
  //   muiToolbarAlertBannerProps: isLoadingUsersError
  //     ? {
  //         color: 'error',
  //         children: 'Error loading data'
  //       }
  //     : undefined,
  //   muiTableContainerProps: {
  //     sx: {
  //       minHeight: '500px'
  //     }
  //   },
  //   onCreatingRowCancel: () => setValidationErrors({}),
  //   onCreatingRowSave: handleCreateUser,
  //   onEditingRowCancel: () => setValidationErrors({}),
  //   onEditingRowSave: handleSaveUser,
  //   renderRowActions: ({ row, table }) => (
  //     <Box sx={{ display: 'flex', gap: '1rem' }}>
  //       <Tooltip title='Edit'>
  //         <IconButton onClick={() => table.setEditingRow(row)}>
  //           <EditIcon />
  //         </IconButton>
  //       </Tooltip>
  //       <Tooltip title='Delete'>
  //         <IconButton color='error' onClick={() => openDeleteConfirmModal(row)}>
  //           <DeleteIcon />
  //         </IconButton>
  //       </Tooltip>
  //     </Box>
  //   ),
  //   renderTopToolbarCustomActions: ({ table }) => (
  //     <Button
  //       variant='contained'
  //       onClick={() => {
  //         table.setCreatingRow(true) //simplest way to open the create row modal with no default values
  //         //or you can pass in a row object to set default values with the `createRow` helper function
  //         // table.setCreatingRow(
  //         //   createRow(table, {
  //         //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
  //         //   }),
  //         // );
  //       }}
  //     >
  //       Create New User
  //     </Button>
  //   ),
  //   state: {
  //     isLoading: isLoadingUsers,
  //     isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
  //     showAlertBanner: isLoadingUsersError,
  //     showProgressBars: isFetchingUsers
  //   }
  // })

  // //CREATE hook (post new user to api)
  // function useCreateUser() {
  //   const queryClient = useQueryClient()

  //   return useMutation({
  //     mutationFn: async (user: User) => {
  //       //send api update request here
  //       await new Promise(resolve => setTimeout(resolve, 1000)) //fake api call

  //       return Promise.resolve()
  //     },

  //     //client side optimistic update
  //     onMutate: (newUserInfo: User) => {
  //       queryClient.setQueryData(
  //         ['users'],
  //         (prevUsers: any) =>
  //           [
  //             ...prevUsers,
  //             {
  //               ...newUserInfo,
  //               id: (Math.random() + 1).toString(36).substring(7)
  //             }
  //           ] as User[]
  //       )
  //     }

  //     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  //   })
  // }

  // //READ hook (get users from api)
  // function useGetUsers() {
  //   return useQuery<User[]>({
  //     queryKey: ['users'],
  //     queryFn: async () => {
  //       //send api request here
  //       await new Promise(resolve => setTimeout(resolve, 1000)) //fake api call

  //       return Promise.resolve(fakeData)
  //     },
  //     refetchOnWindowFocus: false
  //   })
  // }

  // //UPDATE hook (put user in api)
  // function useUpdateUser() {
  //   const queryClient = useQueryClient()

  //   return useMutation({
  //     mutationFn: async (user: User) => {
  //       //send api update request here
  //       await new Promise(resolve => setTimeout(resolve, 1000)) //fake api call

  //       return Promise.resolve()
  //     },

  //     //client side optimistic update
  //     onMutate: (newUserInfo: User) => {
  //       queryClient.setQueryData(['users'], (prevUsers: any) =>
  //         prevUsers?.map((prevUser: User) => (prevUser.id === newUserInfo.id ? newUserInfo : prevUser))
  //       )
  //     }

  //     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  //   })
  // }

  // //DELETE hook (delete user in api)
  // function useDeleteUser() {
  //   const queryClient = useQueryClient()

  //   return useMutation({
  //     mutationFn: async (userId: string) => {
  //       //send api update request here
  //       await new Promise(resolve => setTimeout(resolve, 1000)) //fake api call

  //       return Promise.resolve()
  //     },

  //     //client side optimistic update
  //     onMutate: (userId: string) => {
  //       queryClient.setQueryData(['users'], (prevUsers: any) => prevUsers?.filter((user: User) => user.id !== userId))
  //     }

  //     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
  //   })
  // }

  // return <MaterialReactTable table={table} />
}

export default CustomerShipTo

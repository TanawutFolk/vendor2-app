import { fetchItemCodeForSupportMesAndInuse } from '@/_workspace/react-select/async-promise-load-options/fetchItemManufacturing'
import { fetchProcessByLikeProcessAndInuse } from '@/_workspace/react-select/async-promise-load-options/master-data-system/fetchProcess'
import CustomTextField from '@/components/mui/TextField'
import AsyncSelectCustom from '@/components/react-select/AsyncSelectCustom'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ListProps } from '@mui/material/List'
import { Controller, set, useFormContext } from 'react-hook-form'
// Components Imports
import { useQueryClient } from '@tanstack/react-query'

import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import FolderIcon from '@mui/icons-material/Folder'
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined'
import { useEffect, useMemo, useState } from 'react'
import {
  MaterialReactTable,
  MRT_Row,
  MRT_TableOptions,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState
} from 'material-react-table'
import { StandardCostI } from '@/_workspace/types/sct/StandardCostType'
import {
  PREFIX_QUERY_KEY,
  useSearchSctBySctSelectedWithCondition
} from '@/_workspace/react-query/hooks/useStandardCostData'
// Type Imports
import type { ThemeColor } from '@core/types'
import { get } from 'http'
import { ToastMessageError } from '@/components/ToastMessage'
import BatchChangeMaterialStepThreeSearch from './batch-change-material-step/BatchChangeMaterialStepThreeSearch'
import BatchChangeMaterialStepThreeDataTable from './batch-change-material-step/BatchChangeMaterialStepThreeDataTable'

const StyledList = styled(List)<ListProps>(({ theme }) => ({
  '& .MuiListItem-container': {
    border: '1px solid var(--mui-palette-divider)',
    '&:first-of-type': {
      borderTopLeftRadius: 'var(--mui-shape-borderRadius)',
      borderTopRightRadius: 'var(--mui-shape-borderRadius)'
    },
    '&:last-child': {
      borderBottomLeftRadius: 'var(--mui-shape-borderRadius)',
      borderBottomRightRadius: 'var(--mui-shape-borderRadius)'
    },
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '& .MuiListItemText-root': {
      marginTop: 0,
      '& .MuiTypography-root': {
        fontWeight: 500
      }
    }
  }
}))

const BatchChangeMaterialStepThree = ({ dataForBatchChange }) => {
  // States
  const [isEnableFetching, setIsEnableFetching] = useState(true)

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <BatchChangeMaterialStepThreeSearch setIsEnableFetching={setIsEnableFetching} />
        </Grid>
        <Grid item xs={12}>
          <BatchChangeMaterialStepThreeDataTable
            isEnableFetching={isEnableFetching}
            setIsEnableFetching={setIsEnableFetching}
            dataForBatchChange={dataForBatchChange}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default BatchChangeMaterialStepThree

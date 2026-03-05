// React Imports
import { useState } from 'react'

// MUI Imports
import { Grid } from '@mui/material'

// Template Imports
import DxBreadCrumbs from '@/_template/DxBreadCrumbs'

// Component Imports
import SearchFilter, { defaultSearchFilterValues } from './SearchFilter'
import SearchResult from './SearchResult'

// Env Imports
import { MENU_NAME, breadcrumbNavigation } from './env'

// Types
import type { SearchFilterValues } from './SearchFilter'

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
const RequestRegisterPage = () => {
    const [activeFilters, setActiveFilters] = useState<SearchFilterValues>(defaultSearchFilterValues)

    return (
        <Grid container spacing={6}>
            {/* Header */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center' }}>
                <DxBreadCrumbs menuName={MENU_NAME} breadcrumbNavigation={breadcrumbNavigation} />
            </Grid>

            {/* Search Filter */}
            <Grid item xs={12}>
                <SearchFilter
                    onSearch={setActiveFilters}
                    onClear={() => {
                        setActiveFilters(defaultSearchFilterValues)
                    }}
                />
            </Grid>

            {/* Search Result (AG Grid + Summary + Actions) */}
            <Grid item xs={12}>
                <SearchResult activeFilters={activeFilters} />
            </Grid>
        </Grid>
    )
}

export default RequestRegisterPage

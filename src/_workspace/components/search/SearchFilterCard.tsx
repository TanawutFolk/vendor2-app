import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, Collapse, IconButton } from '@mui/material'
import classNames from 'classnames'

interface SearchFilterCardProps {
    collapse: boolean
    onToggle: () => void
    children: ReactNode
}

export default function SearchFilterCard({ collapse, onToggle, children }: SearchFilterCardProps) {
    return (
        <Card style={{ overflow: 'visible', zIndex: 4 }}>
            <CardHeader
                title='Search Filters'
                action={
                    <IconButton size='small' aria-label='collapse' onClick={onToggle}>
                        <i className={classNames(collapse ? 'tabler-chevron-down' : 'tabler-chevron-up', 'text-xl')} />
                    </IconButton>
                }
                titleTypographyProps={{ variant: 'h5' }}
                sx={{ '& .MuiCardHeader-avatar': { mr: 3 } }}
            />
            <Collapse in={!collapse}>
                <CardContent>{children}</CardContent>
            </Collapse>
        </Card>
    )
}

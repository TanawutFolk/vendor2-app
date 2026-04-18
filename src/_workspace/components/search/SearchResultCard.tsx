import { ReactNode } from 'react'
import { Card, CardHeader } from '@mui/material'

interface SearchResultCardProps {
    action?: ReactNode
    children: ReactNode
}

export default function SearchResultCard({ action, children }: SearchResultCardProps) {
    return (
        <Card>
            <CardHeader
                title='Search Result'
                titleTypographyProps={{ variant: 'h5' }}
                action={action}
            />
            {children}
        </Card>
    )
}

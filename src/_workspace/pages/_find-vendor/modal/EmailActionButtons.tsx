import React, { useState } from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

interface EmailActionButtonsProps {
    email: string
    contactName: string
}

export const EmailActionButtons = ({ email, contactName }: EmailActionButtonsProps) => {
    const [copied, setCopied] = useState(false)
    const fullAddress = contactName ? `"${contactName}" <${email}>` : email

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(fullAddress)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleMailTo = (e: React.MouseEvent) => {
        e.stopPropagation()
        window.location.href = `mailto:${fullAddress}`
    }

    return (
        <Box display="flex" gap={0.5}>
            <Tooltip title={copied ? "Copied!" : `Copy: ${fullAddress}`}>
                <IconButton
                    size="small"
                    onClick={handleCopy}
                    edge="end"
                    sx={{
                        color: copied ? 'success.main' : 'action.active',
                        '&:hover': { color: copied ? 'success.dark' : 'primary.main' }
                    }}
                >
                    <ContentCopyIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title={`Send to: ${fullAddress}`}>
                <IconButton
                    size="small"
                    onClick={handleMailTo}
                    edge="end"
                    color="primary"
                >
                    <MailOutlineIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
    )
}

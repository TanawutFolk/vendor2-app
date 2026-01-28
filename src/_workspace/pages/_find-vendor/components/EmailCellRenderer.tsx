import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import type { ICellRendererParams } from 'ag-grid-community';

export default function EmailCellRenderer(params: ICellRendererParams) {
    const email = params.value;
    const contactName = params.data?.contact_name; // Get Contact Name
    const [copied, setCopied] = useState(false);

    if (!email) {
        return null;
    }

    // Format: "Contact Name" <email@example.com> or just email if no name
    const fullAddress = contactName ? `"${contactName}" <${email}>` : email;

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(fullAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMailTo = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Use full address for mailto. Note: Some clients might only accept the email explicitly, 
        // but standard mailto supports "Name <email>" format in many cases or user can edit.
        // However, to be safe and compatible with most handlers while fulfilling the request, 
        // we try to pass the full string.
        window.location.href = `mailto:${fullAddress}`;
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', gap: 0.5 }}>
            <Tooltip title={fullAddress}>
                <Typography
                    variant="body2"
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flexGrow: 1
                    }}
                >
                    {email}
                </Typography>
            </Tooltip>

            <Tooltip title={copied ? "Copied!" : `Copy: ${fullAddress}`}>
                <IconButton
                    size="small"
                    onClick={handleCopy}
                    sx={{
                        padding: '4px',
                        color: copied ? 'success.main' : 'text.secondary',
                        '&:hover': { color: copied ? 'success.dark' : 'primary.main' }
                    }}
                >
                    <ContentCopyIcon sx={{ fontSize: '16px' }} />
                </IconButton>
            </Tooltip>

            <Tooltip title={`Send to: ${fullAddress}`}>
                <IconButton
                    size="small"
                    onClick={handleMailTo}
                    color="primary"
                    sx={{ padding: '4px' }}
                >
                    <MailOutlineIcon sx={{ fontSize: '18px' }} />
                </IconButton>
            </Tooltip>
        </Box>
    );
}

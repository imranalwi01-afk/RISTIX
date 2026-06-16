'use client'

import React from 'react'
import { Chip, ChipProps, Tooltip, Zoom } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'

interface ImpactLevelBadgeProps extends Omit<ChipProps, 'color'> {
    level: string | null | undefined
    showIcon?: boolean
}

const IMPACT_CONFIG: Record<
    ImpactLevel,
    {
        label: string
        color: 'info' | 'warning' | 'error' | 'default'
        icon: React.ElementType
        description: string
    }
> = {
    low: {
        label: 'Low',
        color: 'info',
        icon: InfoOutlinedIcon,
        description: 'Akses ini hanya mengizinkan Anda untuk melihat data. Tidak ada perubahan data atau risiko sistem yang terjadi.',
    },
    medium: {
        label: 'Medium',
        color: 'warning',
        icon: WarningAmberOutlinedIcon,
        description: 'Akses ini mengizinkan perubahan konfigurasi dan parameter. Memerlukan persetujuan karena dapat memengaruhi perhitungan IFRS9 ke depannya.',
    },
    high: {
        label: 'High',
        color: 'error',
        icon: ErrorOutlineOutlinedIcon,
        description: 'PERINGATAN: Akses kritikal! Tindakan ini berdampak langsung pada operasional utama, keamanan sistem, atau laporan akhir IFRS9. Menjalankan aksi ini membutuhkan persetujuan berjenjang.',
    },
    critical: {
        label: 'Critical',
        color: 'error',
        icon: ErrorOutlineOutlinedIcon,
        description: 'BAHAYA: Akses sangat kritikal! Tindakan ini dapat merusak integritas sistem atau membypass kontrol keamanan.',
    },
}

export const ImpactLevelBadge: React.FC<ImpactLevelBadgeProps> = ({
    level,
    showIcon = true,
    size = 'small',
    ...props
}) => {
    // Normalize level string
    const normalizedLevel = (level?.toLowerCase() || 'low') as ImpactLevel
    const config = IMPACT_CONFIG[normalizedLevel] || IMPACT_CONFIG.low

    const Icon = config.icon

    return (
        <Tooltip
            title={config.description}
            arrow
            placement="top"
            TransitionComponent={Zoom}
        >
            <Chip
                label={config.label}
                color={config.color}
                size={size}
                icon={showIcon ? <Icon fontSize="small" /> : undefined}
                variant="outlined"
                sx={{
                    fontWeight: 500,
                    cursor: 'help',
                    ...props.sx,
                }}
                {...props}
            />
        </Tooltip>
    )
}

export default ImpactLevelBadge

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { premiumFormatter } from '../premium-format';
import { CurrencyInline } from './CurrencyInline';
import { PendingButton } from './PendingButton';

interface SummaryBarProps {
  premium: number;
  label: string;
  formId: string;
  pending: boolean;
  children?: ReactNode;
}

export function SummaryBar({
  premium,
  label,
  formId,
  pending,
  children,
}: SummaryBarProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        insetBlockEnd: 0,
        blockSize: '58px',
        display: 'flex',
        alignItems: 'center',
        gap: '6.5px',
        paddingInline: '6.5px',
        backgroundColor: 'background.paper',
        borderBlockStart: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ minInlineSize: 0 }}>
        <Typography
          component="p"
          sx={{
            fontSize: '12.7px',
            fontWeight: 800,
            color: 'primary.main',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.2,
          }}
        >
          <CurrencyInline>{premiumFormatter.format(premium)}</CurrencyInline>
        </Typography>

        <Typography
          component="p"
          sx={{ fontSize: '9.7px', color: 'text.secondary', lineHeight: 1.2 }}
        >
          {label}
        </Typography>
      </Box>

      <PendingButton
        type="submit"
        form={formId}
        variant="contained"
        pending={pending}
        sx={{ marginInlineStart: 'auto' }}
      >
        {children}
      </PendingButton>
    </Box>
  );
}

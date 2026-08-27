import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { premiumFormatter } from '../premium-format';
import { CurrencyInline } from './CurrencyInline';
import { NumericInline } from './NumericInline';

export interface PremiumSummaryRow {
  readonly label: string;
  readonly value: string;
  readonly ltr?: boolean;
}

interface PremiumSummaryProps {
  title: string;
  rows: readonly PremiumSummaryRow[];
  premiumLabel: string;
  premium: number;
  note: string;
  density: 'tight' | 'medium';
}

const rowPadding = {
  tight: { paddingBlock: '5px', paddingInline: '6.5px' },
  medium: { paddingBlock: '9px', paddingInline: '6.5px' },
};

export function PremiumSummary({
  title,
  rows,
  premiumLabel,
  premium,
  note,
  density,
}: PremiumSummaryProps) {
  return (
    <Stack>
      <Typography
        component="p"
        sx={{
          fontSize: '9.7px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'text.secondary',
        }}
      >
        {title}
      </Typography>

      <Stack>
        {rows.map((row) => (
          <Box
            key={`${row.label}-${row.value}`}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '6.5px',
              ...rowPadding[density],
            }}
          >
            <Typography
              component="span"
              sx={{ fontSize: '10.5px', fontWeight: 400, color: 'text.secondary' }}
            >
              {row.label}
            </Typography>

            <Typography
              component="span"
              sx={{
                fontSize: '10.5px',
                fontWeight: 700,
                color: 'text.primary',
                minInlineSize: 0,
                textAlign: 'end',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {row.ltr === true ? (
                <NumericInline>{row.value}</NumericInline>
              ) : (
                row.value
              )}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box
        sx={{
          borderBlockStart: 1,
          borderColor: 'divider',
          marginBlockStart: '9px',
          paddingBlockStart: '9px',
        }}
      >
        <Typography
          component="p"
          sx={{ fontSize: '10.5px', fontWeight: 400, color: 'text.secondary' }}
        >
          {premiumLabel}
        </Typography>

        <Typography
          component="p"
          sx={{
            fontSize: '20.9px',
            fontWeight: 800,
            color: 'primary.main',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <CurrencyInline>{premiumFormatter.format(premium)}</CurrencyInline>
        </Typography>

        <Typography
          component="p"
          sx={{
            fontSize: '9.7px',
            color: 'text.secondary',
            marginBlockStart: '5px',
          }}
        >
          {note}
        </Typography>
      </Box>
    </Stack>
  );
}

import Button, { type ButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type { ReactNode } from 'react';

export type PendingButtonProps = ButtonProps & {
  pending?: boolean;
  children?: ReactNode;
};

export function PendingButton({
  pending,
  children,
  disabled,
  ...buttonProps
}: PendingButtonProps) {
  return (
    <Button {...buttonProps} disabled={pending === true || disabled === true}>
      {pending === true ? (
        <CircularProgress size={20} color="inherit" />
      ) : (
        children
      )}
    </Button>
  );
}

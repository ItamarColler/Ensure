import Stack, { type StackProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, ReactNode } from 'react';

interface ErrorSurfaceOwnProps<C extends ElementType> {
  component?: C;
  title?: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}

export type ErrorSurfaceProps<C extends ElementType = 'section'> = StackProps<
  C,
  ErrorSurfaceOwnProps<C>
>;

export function ErrorSurface<C extends ElementType = 'section'>({
  title,
  description,
  action,
  ...stackProps
}: ErrorSurfaceProps<C>) {
  return (
    <Stack spacing={3} {...stackProps}>
      {title !== undefined && (
        <Typography variant="h6" component="h1">
          {title}
        </Typography>
      )}

      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>

      {action}
    </Stack>
  );
}

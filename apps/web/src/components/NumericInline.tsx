import type { ReactNode } from 'react';

interface NumericInlineProps {
  children?: ReactNode;
}

export function NumericInline({ children }: NumericInlineProps) {
  return <bdi dir="ltr">{children}</bdi>;
}

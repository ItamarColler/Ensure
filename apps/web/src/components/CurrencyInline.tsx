import type { ReactNode } from 'react';

interface CurrencyInlineProps {
  children?: ReactNode;
}

export function CurrencyInline({ children }: CurrencyInlineProps) {
  return <bdi>{children}</bdi>;
}

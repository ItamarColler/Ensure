export interface HealthEventRow {
  id: number;
  checkedAt: Date;
  ok: boolean;
  note: string | null;
}

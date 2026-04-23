export type AsyncViewState = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export function resolveAsyncViewState(input: {
  loading: boolean;
  error?: string | null;
  rowCount?: number;
}): AsyncViewState {
  if (input.loading) return 'loading';
  if (input.error) return 'error';
  if ((input.rowCount ?? 0) === 0) return 'empty';
  return 'success';
}

export type ExportFormat = 'env' | 'json' | 'shell';

export interface ExportEntry {
  key: string;
  value: string;
}

export function formatExport(entries: ExportEntry[], format: ExportFormat): string {
  switch (format) {
    case 'env':
      return entries.map((e) => `${e.key}=${e.value}`).join('\n');
    case 'json':
      return JSON.stringify(Object.fromEntries(entries.map((e) => [e.key, e.value])), null, 2);
    case 'shell':
      return entries.map((e) => `export ${e.key}="${e.value}"`).join('\n');
    default: {
      const _exhaustive: never = format;
      return _exhaustive;
    }
  }
}

/**
 * Export formatting
 * @module shared/utils/exportFormats
 * @description Format variable key/value pairs for export to different target formats.
 */
export type ExportFormat = 'env' | 'json' | 'shell';

export interface ExportEntry {
  key: string;
  value: string;
}

/**
 * Format export entries to a string for the requested format.
 * @param entries - The entries to export.
 * @param format - The output format.
 * @returns The formatted output string.
 */
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

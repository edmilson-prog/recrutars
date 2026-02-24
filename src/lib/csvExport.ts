/**
 * CSV Export Utility
 * Generates CSV files with BOM for Excel UTF-8 compatibility.
 */

export interface CSVColumn<T> {
  key: string;
  header: string;
  accessor: (item: T) => string;
}

/**
 * Escapes a CSV cell value by wrapping it in quotes if it contains
 * commas, double quotes, or newlines. Internal quotes are doubled.
 */
function escapeCSVCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exports an array of objects to a CSV file and triggers browser download.
 *
 * @param data - Array of objects to export
 * @param columns - Column definitions with key, header, and accessor function
 * @param filename - Download filename (without extension)
 */
export function exportToCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  // Build header row
  const headerRow = columns.map(col => escapeCSVCell(col.header)).join(',');

  // Build data rows
  const dataRows = data.map(item =>
    columns.map(col => escapeCSVCell(col.accessor(item))).join(',')
  );

  // Join all rows with CRLF (standard CSV line ending)
  const csvContent = [headerRow, ...dataRows].join('\r\n');

  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Returns a formatted date string for use in export filenames.
 * Format: YYYY-MM-DD
 */
export function getExportDateSuffix(): string {
  return new Date().toISOString().split('T')[0];
}

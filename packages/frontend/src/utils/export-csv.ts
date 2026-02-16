export const exportToCsv = (
    filename: string,
    headers: string[],
    rows: Array<Array<string | number | boolean | null | undefined>>
) => {
    const escapeCsvValue = (value: string | number | boolean | null | undefined): string => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (/[",\n]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const csvContent = [
        headers.map(escapeCsvValue).join(','),
        ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

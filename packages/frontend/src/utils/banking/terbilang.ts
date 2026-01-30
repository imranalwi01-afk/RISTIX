/**
 * Utility to convert numbers to Indonesian words (Terbilang)
 */

const satuan = [
    '',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
];

export function terbilang(n: number): string {
    if (n < 0) return 'minus ' + terbilang(Math.abs(n));
    if (n === 0) return 'nol';

    if (n < 12) return satuan[n];
    if (n < 20) return terbilang(n - 10) + ' belas';
    if (n < 100) return terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 > 0 ? ' ' + terbilang(n % 10) : '');
    if (n < 200) return 'seratus' + (n - 100 > 0 ? ' ' + terbilang(n - 100) : '');
    if (n < 1000) return terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 > 0 ? ' ' + terbilang(n % 100) : '');
    if (n < 2000) return 'seribu' + (n - 1000 > 0 ? ' ' + terbilang(n - 1000) : '');
    if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 > 0 ? ' ' + terbilang(n % 1000) : '');
    if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' juta' + (n % 1000000 > 0 ? ' ' + terbilang(n % 1000000) : '');
    if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' miliar' + (n % 1000000000 > 0 ? ' ' + terbilang(n % 1000000000) : '');
    if (n < 1000000000000000) return terbilang(Math.floor(n / 1000000000000)) + ' triliun' + (n % 1000000000000 > 0 ? ' ' + terbilang(n % 1000000000000) : '');

    return 'angka terlalu besar';
}

/**
 * Format terbilang with Rupiah suffix if applicable
 */
export function formatTerbilang(n: number, isCurrency: boolean = true): string {
    const result = terbilang(Math.floor(n));
    const suffix = isCurrency ? ' RUPIAH' : '';
    return result.toUpperCase() + suffix;
}

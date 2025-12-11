export function numberWithComma(x) {
    if (x === null || x === undefined || x === '') {
        return '';
    }

    const numString = String(x);
    const parts = numString.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedInteger + decimalPart;
}
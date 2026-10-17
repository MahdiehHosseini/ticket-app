import QRCode from 'qrcode';

// QR به‌صورت SVG (سمت سرور)
export const qrSvg = (text: string) => QRCode.toString(text, { type: 'svg', margin: 0, color: { dark: '#16164a', light: '#0000' } });

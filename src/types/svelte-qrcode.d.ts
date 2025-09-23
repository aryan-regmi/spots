declare module 'svelte-qrcode' {
  import type { SvelteComponentTyped } from 'svelte';

  export interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    background?: string;
    foreground?: string;
  }

  export default class QRCode extends SvelteComponentTyped<QRCodeProps> { }
}

/** Icon names available in Icon.astro (also the allowed values for a service `icon` in the profile). */
export const ICON_NAMES = [
  'code',
  'spark',
  'mail',
  'layers',
  'bolt',
  'compass',
  'cap',
  'lock',
  'badge',
  'sparkles',
  'phone',
  'cloud',
  'shield',
  'database',
] as const;
export type IconName = (typeof ICON_NAMES)[number];

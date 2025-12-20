/**
 * i18n helper for Fox Club
 * Simple translation system for French content
 */

import { fr } from "./fr";

/**
 * Get translation by key path
 * Example: t('common.loading') => 'Chargement...'
 */
export function t(key: string): string {
  const keys = key.split(".");
  let value: any = fr;

  for (const k of keys) {
    value = value[k];
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
  }

  return value;
}

/**
 * Export translations for direct access
 */
export { fr };
export type { TranslationKeys } from "./fr";

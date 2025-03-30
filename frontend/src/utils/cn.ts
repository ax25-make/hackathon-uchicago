// twmerge clsx

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using `clsx` and `twMerge`.
 *
 * @param {string[]} inputs - The class names to merge.
 * @returns {string} - The merged class names.
 */
export function cn(...inputs: (string | undefined | boolean)[]): string {
	return twMerge(clsx(inputs.filter(Boolean)));
}

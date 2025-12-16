/**
 * Watermark position options
 */
export const WATERMARK_POSITIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center-left', label: 'Center Left' },
  { value: 'center', label: 'Center' },
  { value: 'center-right', label: 'Center Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

/**
 * Default watermark options
 */
export const DEFAULT_WATERMARK_OPTIONS = {
  position: 'bottom-right',
  logoSize: 15,
  opacity: 100,
  margin: 2,
};

/**
 * Watermark option ranges
 */
export const WATERMARK_RANGES = {
  logoSize: { min: 5, max: 50 },
  opacity: { min: 10, max: 100 },
  margin: { min: 0, max: 10 },
};


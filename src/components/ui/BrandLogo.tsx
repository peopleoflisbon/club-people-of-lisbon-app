/**
 * BrandLogo
 *
 * Renders the People Of Lisbon brand square image.
 * Source comes from the `brand_square_image_url` app_setting.
 * Falls back to /pol-logo.png (the uploaded asset).
 *
 * Usage:
 *   <BrandLogo size={40} radius={10} className="shadow-md" />
 */

interface BrandLogoProps {
  /** URL of the logo — pass from a parent that has already fetched app_settings */
  src?: string;
  size?: number;
  radius?: number;
  className?: string;
  alt?: string;
}

const FALLBACK = '/pol-logo.png';

export default function BrandLogo({
  src,
  size = 40,
  radius,
  className = '',
  alt = 'People Of Lisbon',
}: BrandLogoProps) {
  const url = src || FALLBACK;
  const r = radius ?? Math.round(size * 0.24);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        objectFit: 'cover',
        flexShrink: 0,
        display: 'block',
      }}
      className={className}
      onError={(e) => {
        // If custom URL fails, fall back to the static asset
        const img = e.currentTarget;
        if (img.src !== FALLBACK) img.src = FALLBACK;
      }}
    />
  );
}

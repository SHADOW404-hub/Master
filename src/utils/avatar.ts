/**
 * Clean SVG Vector Avatar & Illustration Generator
 * Replaces external stock photo dependencies with clean UI vector graphics
 */

export function getAvatarSVG(name: string): string {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const colors = [
    { bg: '#3B82F6', text: '#FFFFFF' },
    { bg: '#10B981', text: '#FFFFFF' },
    { bg: '#8B5CF6', text: '#FFFFFF' },
    { bg: '#F59E0B', text: '#FFFFFF' },
    { bg: '#EC4899', text: '#FFFFFF' },
    { bg: '#06B6D4', text: '#FFFFFF' },
  ];

  const charCode = name.charCodeAt(0) || 0;
  const color = colors[charCode % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="30" fill="${color.bg}" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="4" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${color.text}" font-family="Plus Jakarta Sans, sans-serif" font-size="36" font-weight="800">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getPortfolioVectorSVG(category: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" width="400" height="240">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
    </defs>
    <rect width="400" height="240" rx="16" fill="url(#g)" />
    <circle cx="200" cy="120" r="70" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" stroke-width="2" />
    <path d="M170 140 L200 90 L230 140 Z" fill="none" stroke="#3B82F6" stroke-width="4" stroke-linejoin="round" />
    <circle cx="200" cy="105" r="8" fill="#10B981" />
    <text x="50%" y="190" dominant-baseline="middle" text-anchor="middle" fill="#94A3B8" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600">${category}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

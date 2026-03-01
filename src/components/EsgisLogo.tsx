interface EsgisLogoProps {
  size?: number;
  className?: string;
}

// Logo ESGIS Library — mortarboard + livre ouvert, style académique
export default function EsgisLogo({ size = 36, className = "" }: EsgisLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fond arrondi */}
      <rect width="40" height="40" rx="10" fill="rgba(79,209,197,0.12)" />
      <rect width="40" height="40" rx="10" stroke="rgba(79,209,197,0.4)" strokeWidth="0.8" />

      {/* Chapeau de diplomé (mortarboard) */}
      <polygon points="20,7 33,13 20,19 7,13" fill="#4FD1C5" />
      {/* Bord du chapeau */}
      <line x1="7" y1="13" x2="33" y2="13" stroke="#4FD1C5" strokeWidth="0.5" opacity="0.5"/>
      {/* Pompon / fil */}
      <line x1="33" y1="13" x2="33" y2="20" stroke="#4FD1C5" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="33" cy="21" r="1.5" fill="#4FD1C5" />

      {/* Livre ouvert sous le chapeau */}
      {/* Page gauche */}
      <path d="M8 24 L8 33 Q14 31 20 31 L20 22 Q14 22 8 24 Z"
        fill="rgba(79,209,197,0.25)" stroke="#4FD1C5" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Page droite */}
      <path d="M32 24 L32 33 Q26 31 20 31 L20 22 Q26 22 32 24 Z"
        fill="rgba(79,209,197,0.15)" stroke="#4FD1C5" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Reliure */}
      <line x1="20" y1="22" x2="20" y2="31" stroke="#4FD1C5" strokeWidth="1.2" />

      {/* Lignes texte page gauche */}
      <line x1="11" y1="26" x2="18" y2="25.5" stroke="#4FD1C5" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      <line x1="11" y1="28.5" x2="18" y2="28" stroke="#4FD1C5" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      {/* Lignes texte page droite */}
      <line x1="22" y1="25.5" x2="29" y2="26" stroke="#4FD1C5" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      <line x1="22" y1="28" x2="29" y2="28.5" stroke="#4FD1C5" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

interface BiblioLogoProps {
  size?: number;
  className?: string;
}

// Logo générique BiblioTech — livre ouvert avec étoile
export default function BiblioLogo({ size = 36, className = "" }: BiblioLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="10" fill="rgba(79,209,197,0.12)" />
      <rect width="40" height="40" rx="10" stroke="rgba(79,209,197,0.35)" strokeWidth="0.8" />
      {/* Livre ouvert */}
      <path d="M7 12 L7 30 Q13.5 27.5 20 28 L20 10 Q13.5 9.5 7 12 Z"
        fill="rgba(79,209,197,0.2)" stroke="#4FD1C5" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M33 12 L33 30 Q26.5 27.5 20 28 L20 10 Q26.5 9.5 33 12 Z"
        fill="rgba(79,209,197,0.12)" stroke="#4FD1C5" strokeWidth="1.3" strokeLinejoin="round" />
      <line x1="20" y1="10" x2="20" y2="28" stroke="#4FD1C5" strokeWidth="1.3" />
      {/* Lignes texte gauche */}
      <line x1="10" y1="16" x2="17.5" y2="15.5" stroke="#4FD1C5" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="10" y1="19.5" x2="17.5" y2="19" stroke="#4FD1C5" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="10" y1="23" x2="17.5" y2="22.5" stroke="#4FD1C5" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      {/* Lignes texte droite */}
      <line x1="22.5" y1="15.5" x2="30" y2="16" stroke="#4FD1C5" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <line x1="22.5" y1="19" x2="30" y2="19.5" stroke="#4FD1C5" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="22.5" y1="22.5" x2="30" y2="23" stroke="#4FD1C5" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      {/* Étoile en haut à droite */}
      <path d="M31 6 L31.7 8.2 L34 8.2 L32.2 9.5 L32.9 11.7 L31 10.4 L29.1 11.7 L29.8 9.5 L28 8.2 L30.3 8.2 Z"
        fill="#4FD1C5" opacity="0.9" />
    </svg>
  );
}

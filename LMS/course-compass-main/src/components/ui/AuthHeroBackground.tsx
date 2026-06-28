export const AuthHeroBackground = () => {
  return (
    <>
      <div className="absolute inset-0 gradient-mesh-bg animate-mesh" />
      <div className="aurora-bg" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

      {/* soft color glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-cyan-500/20 rounded-full blur-[120px] opacity-40" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[120px] opacity-40" />

      {/* Tech brand icons scattered background - matching admin login style */}
      <div aria-hidden className="pointer-events-none">
        {/* LEFT SIDE ICONS */}
        {/* Hand/Cup icon - top left */}
        <svg className="absolute left-10 top-24 w-12 h-12 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 10c0-2 2-3 4-3s4 1 4 3v4c0 2-2 3-4 3s-4-1-4-3v-4zm0 6c0 1.5 1.5 3 4 3s4-1.5 4-3" stroke="#0db7ed" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* React atom icon */}
        <svg className="absolute left-20 top-12 w-10 h-10 opacity-60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="1.5" fill="#61dafb" />
          <ellipse cx="12" cy="12" rx="7" ry="3" fill="none" stroke="#61dafb" strokeWidth="1" />
          <ellipse cx="12" cy="12" rx="7" ry="3" fill="none" stroke="#61dafb" strokeWidth="1" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="7" ry="3" fill="none" stroke="#61dafb" strokeWidth="1" transform="rotate(120 12 12)" />
        </svg>

        {/* TypeScript badge - top left area */}
        <svg className="absolute left-56 top-16 w-11 h-11 opacity-75" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="#3178c6" />
          <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">TS</text>
        </svg>

        {/* HTML5 icon - middle left */}
        <svg className="absolute left-8 top-56 w-11 h-11 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3h18l-3 18-9 2-9-2L3 3z" fill="#f06529" opacity="0.2" stroke="#f06529" strokeWidth="1.2" />
          <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#f06529">5</text>
        </svg>

        {/* Git icon - bottom left */}
        <svg className="absolute left-12 bottom-20 w-12 h-12 opacity-65" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.17-1.12-1.48-1.12-1.48-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.82-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.57.69.48C19.14 20.16 22 16.42 22 12 22 6.48 18.52 2 12 2z" fill="#f1502f" opacity="0.5" />
        </svg>

        {/* Node.js icon - left middle-bottom */}
        <svg className="absolute left-28 bottom-8 w-10 h-10 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="#68a063" opacity="0.4" />
          <circle cx="12" cy="12" r="3" fill="#68a063" />
        </svg>

        {/* RIGHT SIDE ICONS */}
        {/* Figma icon - top right */}
        <svg className="absolute right-12 top-16 w-11 h-11 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2C6.9 2 6 2.9 6 4v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="#a259ff" opacity="0.3" />
          <path d="M14 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2z" fill="#f24e1e" opacity="0.3" />
          <path d="M14 12c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2s-2-.9-2-2v-4c0-1.1.9-2 2-2z" fill="#ff7262" opacity="0.3" />
          <path d="M8 16c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#1abcfe" opacity="0.3" />
          <path d="M2 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" fill="#0acf83" opacity="0.3" />
        </svg>

        {/* CSS icon - right top area */}
        <svg className="absolute right-32 top-24 w-10 h-10 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3h18l-1.5 15L12 21l-7.5-3L3 3z" fill="#264de4" opacity="0.15" stroke="#264de4" strokeWidth="1" />
          <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#264de4">CSS</text>
        </svg>

        {/* C# badge - right middle */}
        <svg className="absolute right-16 top-56 w-11 h-11 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#239120" opacity="0.15" />
          <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#239120">C#</text>
        </svg>

        {/* JavaScript badge - right bottom-middle */}
        <svg className="absolute right-20 bottom-32 w-12 h-12 opacity-75" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="2" fill="#f7df1e" opacity="0.15" />
          <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#f7df1e">JS</text>
        </svg>

        {/* Python badge - right bottom */}
        <svg className="absolute right-8 bottom-12 w-12 h-12 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#3776ab" opacity="0.15" />
          <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#3776ab">PY</text>
        </svg>

        {/* GitHub/dark icon - right bottom corner */}
        <svg className="absolute right-24 bottom-24 w-12 h-12 opacity-60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.05" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.17-1.12-1.48-1.12-1.48-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.82-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.57.69.48C19.14 20.16 22 16.42 22 12 22 6.48 18.52 2 12 2z" fill="#424242" opacity="0.3" />
        </svg>
      </div>
    </>
  );
};

function DashboardCardArt({ variant }) {
  if (variant === "books") {
    return (
      <svg viewBox="0 0 180 100" role="presentation">
        <ellipse cx="104" cy="86" rx="62" ry="7" fill="#a9b79c" opacity=".45" />
        <path d="M53 30h27v54H53z" fill="#bd765a" />
        <path d="M58 35h17v43H58z" fill="#d89471" />
        <path d="M83 20h30v64H83z" fill="#e1bd6e" />
        <path d="M88 26h20v51H88z" fill="#f0d58b" />
        <path d="M116 34h26v50h-26z" fill="#6f8971" />
        <path d="M121 39h16v39h-16z" fill="#8da58a" />
        <path d="M51 84h93" stroke="#6f6655" strokeWidth="3" strokeLinecap="round" />
        <path d="M68 41v8m30-16v9m30 3v7" stroke="#fff4db" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        <path d="m148 25 3 6 6 2-6 2-3 6-2-6-6-2 6-2z" fill="#c79e4d" />
      </svg>
    );
  }

  if (variant === "reservations") {
    return (
      <svg viewBox="0 0 180 100" role="presentation">
        <ellipse cx="100" cy="86" rx="55" ry="7" fill="#d5b987" opacity=".4" />
        <rect x="56" y="19" width="67" height="66" rx="9" fill="#fffaf0" stroke="#d9bd87" strokeWidth="2" />
        <path d="M56 31a12 12 0 0 1 12-12h43a12 12 0 0 1 12 12v8H56z" fill="#d49a55" />
        <path d="M72 15v11m35-11v11" stroke="#876744" strokeWidth="4" strokeLinecap="round" />
        <path d="M70 51h10m10 0h10m10 0h4M70 64h10m10 0h10m10 0h4" stroke="#d8c8a8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="96" cy="64" r="4" fill="#8b9d79" />
        <path d="m126 60 8 8 17-20" fill="none" stroke="#71866a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (variant === "details") {
    return (
      <svg viewBox="0 0 180 100" role="presentation">
        <ellipse cx="91" cy="84" rx="64" ry="8" fill="#a7b8c8" opacity=".42" />
        <path d="M36 32c18-6 35-4 52 7v39c-17-10-34-12-52-6z" fill="#fffaf0" stroke="#73889a" strokeWidth="2" strokeLinejoin="round" />
        <path d="M144 32c-18-6-35-4-56 7v39c21-10 38-12 56-6z" fill="#f8e7c7" stroke="#73889a" strokeWidth="2" strokeLinejoin="round" />
        <path d="M90 39v39" stroke="#73889a" strokeWidth="2" />
        <path d="M48 45c10-2 20 0 29 4m-29 6c10-2 20 0 29 4m20-10c10-4 20-6 31-4m-31 16c10-4 20-6 31-4" fill="none" stroke="#c6b58f" strokeWidth="2" strokeLinecap="round" />
        <path d="m140 19 3 6 7 2-7 2-3 6-2-6-6-2 6-2z" fill="#d0a85a" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 180 100" role="presentation">
      <ellipse cx="94" cy="86" rx="58" ry="7" fill="#d4aaaa" opacity=".42" />
      <circle cx="87" cy="39" r="17" fill="#d69b78" />
      <path d="M61 82c2-18 12-28 26-28s24 10 26 28z" fill="#657f70" />
      <path d="M71 39c0-13 7-22 18-22 9 0 16 7 17 17-9 0-15-3-20-8-3 6-8 10-15 13z" fill="#544237" />
      <path d="M105 68c12-8 23-8 35-1v18c-12-7-23-7-35 1z" fill="#fff7e7" stroke="#9c8665" strokeWidth="2" strokeLinejoin="round" />
      <path d="M140 67c-11-6-22-6-35 1v18c13-7 24-7 35-1z" fill="#ecd9b5" stroke="#9c8665" strokeWidth="2" strokeLinejoin="round" />
      <path d="M122 69v15" stroke="#9c8665" strokeWidth="1.5" />
      <path d="m47 29 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#c49b4e" />
    </svg>
  );
}

export default DashboardCardArt;

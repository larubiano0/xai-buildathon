import type { Mood } from "../game/logic";

export function GhostSprite({ mood }: { mood: Mood }) {
  return (
    <svg className={`sprite mood-${mood}`} viewBox="0 0 120 140" aria-hidden>
      <ellipse cx="60" cy="126" rx="28" ry="6" fill="rgba(0,0,0,0.35)" />
      <path
        fill="#f6f1ff"
        d="M30 76C30 42 42 18 60 18C78 18 90 42 90 76L90 112Q82 98 74 112Q66 126 58 112Q50 98 42 112Q34 126 30 112Z"
      />
      <path className="brow left" d="M36 52l18 8" />
      <path className="brow right" d="M84 52L66 60" />
      <ellipse className="eye left" cx="46" cy="70" rx="7" ry="8" />
      <ellipse className="eye right" cx="74" cy="70" rx="7" ry="8" />
      <circle className="pupil" cx="47" cy="72" r="2.5" />
      <circle className="pupil" cx="75" cy="72" r="2.5" />
      <path className="mouth" d="M50 90c5 7 15 7 20 0" />
      <path className="frown" d="M50 96c5-7 15-7 20 0" />
      <ellipse className="oh" cx="60" cy="92" rx="6" ry="8" />
    </svg>
  );
}

export function Cobweb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 140" aria-hidden>
      <g fill="none" stroke="rgba(230,220,255,0.45)" strokeWidth="1">
        <path d="M4 4 L120 18 M4 4 L96 48 M4 4 L70 86 M4 4 L36 120 M4 4 L12 86" />
        <path d="M28 10 Q46 28 24 46 Q40 40 58 22" />
        <path d="M18 36 Q40 48 28 74 Q48 58 70 40" />
        <path d="M12 70 Q34 78 30 104" />
      </g>
    </svg>
  );
}

export function Candles() {
  return (
    <div className="candles" aria-hidden>
      <span className="candle tall"><i /></span>
      <span className="candle"><i /></span>
      <span className="candle short"><i /></span>
    </div>
  );
}

export function Embers() {
  return (
    <div className="embers" aria-hidden>
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} style={{ left: `${8 + index * 12}%`, animationDelay: `${index * -1.1}s` }} />
      ))}
    </div>
  );
}

export function Face() {
  return (
    <svg className="face" viewBox="0 0 160 210" aria-hidden>
      <ellipse cx="80" cy="118" rx="58" ry="78" fill="#1a120e" />
      <ellipse cx="80" cy="122" rx="46" ry="64" fill="#c3a88a" />
      <ellipse cx="80" cy="132" rx="40" ry="52" fill="#b08968" />
      <path d="M34 96c12-46 80-50 96-4c-18-28-70-30-96 4z" fill="#140e0c" />
      <path d="M28 70c18-36 86-40 108-6" fill="#0c0908" />
      <ellipse cx="62" cy="124" rx="14" ry="9" fill="#1a120e" />
      <ellipse cx="100" cy="124" rx="14" ry="9" fill="#1a120e" />
      <circle cx="64" cy="124" r="3.5" fill="#ffb15a" />
      <circle cx="102" cy="124" r="3.5" fill="#ffb15a" />
      <path d="M80 132 l5 18 h-10 z" fill="#7c5848" />
      <path d="M64 164 h34" stroke="#5c3d34" strokeWidth="3" />
      <path d="M48 150c6 10 18 6 22-2M92 148c4 8 16 12 22 2" fill="none" stroke="rgba(80,40,30,0.45)" strokeWidth="2" />
    </svg>
  );
}

export function Bottle({ color, label }: { color: string; label: string }) {
  return (
    <svg className="bottle" viewBox="0 0 80 140" role="img" aria-label={label}>
      <rect x="32" y="6" width="16" height="20" rx="3" fill="#d9c7a2" />
      <rect x="35" y="22" width="10" height="10" fill="#9a8668" />
      <path
        d="M24 40h32l8 16v48a18 18 0 0 1-18 18H34a18 18 0 0 1-18-18V56z"
        fill={color}
      />
      <path d="M30 48c6 8 6 30 0 62" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="3" />
      <circle cx="34" cy="78" r="3" fill="rgba(255,255,255,0.35)">
        <animate attributeName="cy" values="96;58;96" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="48" cy="90" r="2" fill="rgba(255,255,255,0.28)">
        <animate attributeName="cy" values="104;64;104" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function Manor() {
  return (
    <svg className="manor" viewBox="0 0 1440 460" preserveAspectRatio="xMidYMax meet" aria-hidden>
      <g fill="#100e18">
        <path d="M250 460 V250 h40 l70-120 70 120 h40 V460 Z" />
        <path d="M430 460 V280 L700 120 L970 280 V460 Z" />
        <path d="M620 190 h50 v-70 h30 v70 h50 v40 h-130 Z" />
        <path d="M990 460 V210 h46 l54-96 54 96 h46 V460 Z" />
        <rect x="300" y="400" width="820" height="70" />
      </g>
      <g className="windows" fill="#ff9a3c">
        <rect x="300" y="300" width="18" height="28" />
        <rect x="348" y="300" width="18" height="28" />
        <rect x="300" y="352" width="18" height="28" />
        <rect x="348" y="352" width="18" height="28" />
        <rect x="500" y="300" width="26" height="36" />
        <rect x="560" y="300" width="26" height="36" />
        <rect x="690" y="300" width="26" height="36" />
        <rect x="750" y="300" width="26" height="36" />
        <rect x="820" y="300" width="26" height="36" />
        <rect x="530" y="360" width="26" height="40" />
        <rect x="720" y="360" width="26" height="40" />
        <rect x="800" y="360" width="26" height="40" />
        <rect x="1048" y="260" width="16" height="26" />
        <rect x="1104" y="260" width="16" height="26" />
        <rect x="1048" y="312" width="16" height="26" />
        <rect x="1104" y="312" width="16" height="26" />
        <rect x="1048" y="364" width="16" height="26" />
        <rect x="1104" y="364" width="16" height="26" />
        <rect x="655" y="150" width="12" height="18" />
      </g>
      <path d="M688 340 h64 v120 h-64 Z" fill="#1a0d08" />
      <path d="M676 340 h88 v10 h-88 Z" fill="#2a2118" />
    </svg>
  );
}

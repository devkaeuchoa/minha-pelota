interface RetroInlineAlertProps {
  message: string;
}

export function RetroInlineAlert({ message }: RetroInlineAlertProps) {
  return (
    <div
      data-component="retro-inline-alert"
      className="flex items-center gap-2 border-2 border-[#ff0055] bg-[#200010] p-2"
    >
      <span className="inline-flex h-6 w-6 items-center justify-center text-[#ff0055]">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-5 w-5" shapeRendering="crispEdges">
          {/* pixelated warning triangle */}
          <rect x="7" y="2" width="2" height="2" fill="#ff0055" />
          <rect x="6" y="4" width="4" height="2" fill="#ff0055" />
          <rect x="5" y="6" width="6" height="2" fill="#ff0055" />
          <rect x="4" y="8" width="8" height="2" fill="#ff0055" />
          <rect x="3" y="10" width="10" height="2" fill="#ff0055" />
          <rect x="2" y="12" width="12" height="2" fill="#ff0055" />
          {/* exclamation mark */}
          <rect x="7" y="6" width="2" height="4" fill="#0a0004" />
          <rect x="7" y="11" width="2" height="2" fill="#0a0004" />
        </svg>
      </span>
      <span className="retro-text-shadow text-lg leading-tight text-[#ffe4e6]">{message}</span>
    </div>
  );
}

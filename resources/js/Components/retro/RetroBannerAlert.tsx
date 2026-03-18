interface RetroBannerAlertProps {
  message: string;
}

export function RetroBannerAlert({ message }: RetroBannerAlertProps) {
  return (
    <div
      data-component="retro-banner-alert"
      className="border-2 border-[#ffd700] bg-[#0b1340] px-3 py-1 shadow-[0_0_8px_#ffd700]"
    >
      <span className="retro-text-shadow animate-pulse text-xl text-[#ffd700]">{message}</span>
    </div>
  );
}

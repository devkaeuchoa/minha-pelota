interface RetroFileInputProps {
  label: string;
  fileName?: string;
  onBrowse?: () => void;
}

export function RetroFileInput({ label, fileName, onBrowse }: RetroFileInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
      <div
        className="flex cursor-pointer items-center gap-2 border-2 border-[#4060c0] bg-[#1e348c] p-2 hover:bg-[#2540a0]"
        onClick={onBrowse}
      >
        <div className="retro-inset-shadow border-2 border-[#4060c0] bg-[#0b1340] px-3 py-1">
          <span className="retro-text-shadow text-lg text-[#ffd700]">BROWSE</span>
        </div>
        <span className="retro-text-shadow truncate text-sm text-[#6070a0]">
          {fileName ?? 'NO FILE SELECTED'}
        </span>
      </div>
    </div>
  );
}

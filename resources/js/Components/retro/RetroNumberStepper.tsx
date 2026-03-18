interface RetroNumberStepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export function RetroNumberStepper({
  label,
  value,
  min = 0,
  max = 99,
  onChange,
}: RetroNumberStepperProps) {
  const decrement = () => {
    if (value > min) onChange?.(value - 1);
  };

  const increment = () => {
    if (value < max) onChange?.(value + 1);
  };

  return (
    <div data-component="retro-number-stepper" className="flex flex-col gap-1">
      <label className="retro-text-shadow text-sm text-[#a0b0ff]">{label}</label>
      <div className="flex gap-2">
        <button
          onClick={decrement}
          className="h-10 w-10 border-2 border-[#4060c0] bg-[#1e348c] text-xl text-[#6070a0] hover:bg-[#2540a0] hover:text-white"
        >
          -
        </button>
        <div className="retro-inset-shadow flex flex-1 items-center justify-center border-2 border-[#4060c0] bg-[#0b1340]">
          <span className="retro-text-shadow text-3xl text-[#ffd700]">{value}</span>
        </div>
        <button
          onClick={increment}
          className="h-10 w-10 border-2 border-[#4060c0] bg-[#1e348c] text-xl text-[#6070a0] hover:bg-[#2540a0] hover:text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}

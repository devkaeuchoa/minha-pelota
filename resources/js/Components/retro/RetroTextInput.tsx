import { InputHTMLAttributes, useRef } from 'react';

interface RetroTextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
}

const stepperButtonClasses =
  'retro-text-shadow flex h-9 w-11 shrink-0 touch-manipulation select-none items-center justify-center border-2 border-[#4060c0] bg-[#1e348c] text-xl text-[#ffd700] outline-none active:brightness-125 disabled:cursor-not-allowed disabled:opacity-50';

export function RetroTextInput({ label, id, type, ...props }: RetroTextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isNumber = type === 'number';
  const steppersDisabled = props.disabled || props.readOnly;

  const step = (direction: 1 | -1) => {
    const input = inputRef.current;
    if (!input || steppersDisabled) return;
    if (direction === 1) {
      input.stepUp();
    } else {
      input.stepDown();
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <div data-component="retro-text-input" className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="retro-text-shadow text-base text-[#a0b0ff]">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {isNumber && (
          <button
            type="button"
            aria-label="Diminuir"
            disabled={steppersDisabled}
            onClick={() => step(-1)}
            className={stepperButtonClasses}
          >
            −
          </button>
        )}
        <div className="retro-inset-shadow flex h-9 flex-1 items-center border-2 border-[#4060c0] bg-[#0b1340] px-2">
          <input
            ref={inputRef}
            id={id}
            type={type}
            {...props}
            className="retro-input w-full bg-transparent font-retro text-xl tracking-widest text-[#ffd700] outline-none placeholder:text-[#4060a0]"
          />
        </div>
        {isNumber && (
          <button
            type="button"
            aria-label="Aumentar"
            disabled={steppersDisabled}
            onClick={() => step(1)}
            className={stepperButtonClasses}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

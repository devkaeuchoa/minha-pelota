import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RetroTextInput } from './RetroTextInput';

function ControlledNumberInput(props: {
  min?: number;
  max?: number;
  initial?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState(props.initial ?? '');
  return (
    <RetroTextInput
      id="quantity"
      type="number"
      min={props.min}
      max={props.max}
      value={value}
      disabled={props.disabled}
      readOnly={props.readOnly}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

describe('RetroTextInput', () => {
  it('renders the label associated with the input', () => {
    render(<RetroTextInput id="name" label="NOME" value="" onChange={() => {}} />);

    expect(screen.getByLabelText('NOME')).toBeInTheDocument();
  });

  it('renders the given placeholder', () => {
    render(
      <RetroTextInput id="quantity" type="number" placeholder="0" value="" onChange={() => {}} />,
    );

    expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
  });

  it('does not render increment/decrement steppers for non-number types', () => {
    render(<RetroTextInput id="name" type="text" value="" onChange={() => {}} />);

    expect(screen.queryByRole('button', { name: 'Aumentar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Diminuir' })).not.toBeInTheDocument();
  });

  it('increments and decrements the value via the stepper buttons', async () => {
    const user = userEvent.setup();
    render(<ControlledNumberInput initial="2" min={2} max={4} />);

    const input = screen.getByRole('spinbutton');
    await user.click(screen.getByRole('button', { name: 'Aumentar' }));
    expect(input).toHaveValue(3);

    await user.click(screen.getByRole('button', { name: 'Diminuir' }));
    expect(input).toHaveValue(2);
  });

  it('does not step past min/max', async () => {
    const user = userEvent.setup();
    render(<ControlledNumberInput initial="4" min={2} max={4} />);

    const input = screen.getByRole('spinbutton');
    await user.click(screen.getByRole('button', { name: 'Aumentar' }));
    expect(input).toHaveValue(4);

    await user.click(screen.getByRole('button', { name: 'Diminuir' }));
    await user.click(screen.getByRole('button', { name: 'Diminuir' }));
    await user.click(screen.getByRole('button', { name: 'Diminuir' }));
    expect(input).toHaveValue(2);
  });

  it('disables the steppers when the input is disabled', () => {
    render(<ControlledNumberInput initial="2" disabled />);
    expect(screen.getByRole('button', { name: 'Aumentar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Diminuir' })).toBeDisabled();
  });

  it('disables the steppers when the input is read-only', () => {
    render(<ControlledNumberInput initial="2" readOnly />);
    expect(screen.getByRole('button', { name: 'Aumentar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Diminuir' })).toBeDisabled();
  });
});

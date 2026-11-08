import { Radio, RadioGroup, Label } from "@headlessui/react";
import { APPLIANCES, type ApplianceId } from "../utils/appliances";

type AppliancePickerProps = {
  value: ApplianceId;
  onChange: (id: ApplianceId) => void;
};

export function AppliancePicker({ value, onChange }: AppliancePickerProps) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      aria-label="Appliance"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {APPLIANCES.map((appliance) => (
        <Radio
          key={appliance.id}
          value={appliance.id}
          className="group cursor-pointer rounded-xl border border-[var(--border)] p-3 transition-colors hover:border-[var(--muted)] focus:outline-none data-[focus]:ring-2 data-[focus]:ring-[var(--switch-track-checked)] data-[checked]:border-[var(--text)] data-[checked]:bg-[var(--border)]"
        >
          <span className="text-2xl" aria-hidden="true">
            {appliance.icon}
          </span>
          <Label className="mt-1 block cursor-pointer text-sm font-medium">
            {appliance.label}
          </Label>
          <span className="block text-xs text-[var(--muted)]">
            {appliance.description}
          </span>
        </Radio>
      ))}
    </RadioGroup>
  );
}

import { Radio, RadioGroup, Label } from "@headlessui/react";
import { APPLIANCES, type ApplianceId } from "../utils/appliances";

type AppliancePickerProps = {
  value: ApplianceId;
  onChange: (id: ApplianceId) => void;
};

/** Compact appliance chips: icon + short name, three to a row. */
export function AppliancePicker({ value, onChange }: AppliancePickerProps) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      aria-label="Appliance"
      className="grid grid-cols-3 gap-2"
    >
      {APPLIANCES.map((appliance) => (
        <Radio
          key={appliance.id}
          value={appliance.id}
          title={appliance.description}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-2 py-1.5 text-xs transition-colors hover:border-[var(--muted)] focus:outline-none data-[focus]:ring-2 data-[focus]:ring-[var(--switch-track-checked)] data-[checked]:border-[var(--text)] data-[checked]:ring-1 data-[checked]:ring-[var(--text)]"
        >
          <span aria-hidden="true">{appliance.icon}</span>
          <Label className="cursor-pointer truncate font-medium">
            <span aria-hidden="true">{appliance.shortLabel}</span>
            <span className="sr-only">{appliance.label}</span>
          </Label>
        </Radio>
      ))}
    </RadioGroup>
  );
}

'use client';

import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';

interface ConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ConsentCheckbox({
  checked,
  onCheckedChange,
  disabled = false,
}: ConsentCheckboxProps) {
  return (
    <div className="flex items-start space-x-3 rounded-md border p-4">
      <Checkbox
        id="consent"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby="consent-description"
      />
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="consent"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I consent to be contacted
        </Label>
        <p
          id="consent-description"
          className="text-sm text-muted-foreground"
        >
          By checking this box, I authorize Toyota dealers to contact me via
          phone, email, or text message regarding my inquiry. I understand that
          my contact information will be shared with the selected dealer(s) for
          the purpose of responding to my vehicle inquiry. I can withdraw my
          consent at any time by contacting the dealer directly.
        </p>
      </div>
    </div>
  );
}

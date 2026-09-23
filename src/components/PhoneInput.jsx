// Web port of the mobile app's components/PhoneInput.tsx — Nigeria-only
// for now (matches uleeb-api's normalizePhone), a fixed "+234" chip
// beside a digits-only local-number field.
const DIAL_CODE = '+234';

export function PhoneInput({ value, onChangeValue, placeholder = '800 000 0000', autoFocus }) {
  function handleChange(raw) {
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    onChangeValue(digits.slice(0, 10));
  }

  return (
    <div className="phone-input-row">
      <div className="phone-input-code">{DIAL_CODE}</div>
      <input
        className="auth-input phone-input-field"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        autoFocus={autoFocus}
      />
    </div>
  );
}

export function phoneInputToE164(local) {
  return local ? `${DIAL_CODE}${local}` : '';
}

export function isPhoneInputValid(local) {
  return local.length >= 10;
}

export function phoneInputFromStored(stored) {
  if (!stored) return '';
  let digits = stored.replace(/\D/g, '');
  if (digits.startsWith('234')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

import { isValidCountryCode } from '../countries';

export function validatePhoneByCountry(phone: string, countryCode: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!digitsOnly) {
    return false;
  }

  const length = digitsOnly.length;

  switch (countryCode) {
    case 'IN':
      return length === 10;
    case 'US':
      return length === 10;
    case 'GB':
      return length >= 10 && length <= 11;
    case 'CA':
      return length === 10;
    case 'AU':
      return length === 10;
    case 'DE':
      return length >= 10 && length <= 11;
    case 'FR':
      return length === 9;
    case 'JP':
      return length >= 10 && length <= 11;
    case 'CN':
      return length === 11;
    case 'BR':
      return length >= 10 && length <= 11;
    case 'MX':
      return length === 10;
    case 'RU':
      return length === 10;
    default:
      return length >= 6 && length <= 15;
  }
}

export function validatePincodeByCountry(pincode: string, countryCode: string): boolean {
  if (!pincode || pincode.trim().length === 0) {
    return false;
  }

  const cleanPincode = pincode.trim();
  const length = cleanPincode.length;

  switch (countryCode) {
    case 'IN':
      return /^\d{6}$/.test(cleanPincode);
    case 'US':
      return /^\d{5}(-\d{4})?$/.test(cleanPincode);
    case 'GB':
      return /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/.test(cleanPincode.replace(/\s+/g, '').toUpperCase());
    case 'CA':
      return /^[A-Z]\d[A-Z] \d[A-Z]\d$/.test(cleanPincode.replace(/\s+/g, '').toUpperCase());
    case 'AU':
      return /^\d{4}$/.test(cleanPincode);
    case 'DE':
      return /^\d{5}$/.test(cleanPincode);
    case 'FR':
      return /^\d{5}$/.test(cleanPincode);
    case 'JP':
      return /^\d{3}-\d{4}$/.test(cleanPincode);
    case 'CN':
      return /^\d{6}$/.test(cleanPincode);
    case 'BR':
      return /^\d{5}-\d{3}$/.test(cleanPincode);
    case 'MX':
      return /^\d{5}$/.test(cleanPincode);
    case 'RU':
      return /^\d{6}$/.test(cleanPincode);
    default:
      return length >= 3 && length <= 10;
  }
}

export function validateCountryCode(countryCode: string): boolean {
  return isValidCountryCode(countryCode);
}

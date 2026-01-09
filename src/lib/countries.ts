import { countries, getEmojiFlag, type TCountryCode as CountriesListCountryCode } from 'countries-list';

export interface Country {
  code: string;
  name: string;
  native: string;
  dialCode: string;
  flag: string;
}

export interface PhoneInputConfig {
  inputMode: 'tel' | 'numeric' | 'text';
  maxLength: number;
  allowsNonNumeric: boolean;
}

export interface PincodeInputConfig {
  label: string;
  inputMode: 'text' | 'numeric';
  pattern: string;
  maxLength: number;
  required: boolean;
  allowsLetters: boolean;
}

let cachedCountries: Country[] | null = null;

export function getAllCountries(): Country[] {
  if (cachedCountries) {
    return cachedCountries;
  }

  cachedCountries = Object.entries(countries).map(([code, data]: [string, unknown]) => {
    const countryData = data as {
      name: string;
      native: string;
      phone: number[];
      capital?: string;
      currency?: string[];
      languages?: string[];
    };

    return {
      code,
      name: countryData.name,
      native: countryData.native,
      dialCode: countryData.phone?.[0] ? `+${countryData.phone[0]}` : '',
      flag: getEmojiFlag(code as CountriesListCountryCode),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return cachedCountries;
}

export function getCountryByCode(code: string): Country | undefined {
  return getAllCountries().find(country => country.code === code);
}

export function getCountryDialCode(countryCode: string): string {
  const country = getCountryByCode(countryCode);
  return country?.dialCode || '';
}

export function isValidCountryCode(code: string): boolean {
  return getAllCountries().some(country => country.code === code);
}

export function searchCountries(query: string): Country[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return getAllCountries();
  }

  return getAllCountries().filter(country =>
    country.name.toLowerCase().includes(normalizedQuery) ||
    country.code.toLowerCase().includes(normalizedQuery) ||
    country.dialCode.includes(normalizedQuery)
  );
}

// Countries with alphanumeric postal codes
const ALPHANUMERIC_POSTAL_CODES: string[] = [
  'GB', // United Kingdom: SW1A 1AA
  'CA', // Canada: K1A 0B1
  'NL', // Netherlands: 1234 AB
  'IE', // Ireland: A65 F4E2 (Eircode)
];

// Countries without postal codes (approximately 40 countries)
const NO_POSTAL_CODES: string[] = [
  'AE', // United Arab Emirates
  'AG', // Antigua and Barbuda
  'AW', // Aruba
  'BS', // Bahamas
  'BQ', // Bonaire
  'CV', // Cape Verde
  'CI', // Ivory Coast
  'CK', // Cook Islands
  'CM', // Cameroon
  'CU', // Cuba
  'DJ', // Djibouti
  'DM', // Dominica
  'ER', // Eritrea
  'FJ', // Fiji
  'GA', // Gabon
  'GD', // Grenada
  'GY', // Guyana
  'HK', // Hong Kong
  'KI', // Kiribati
  'KM', // Comoros
  'KN', // Saint Kitts and Nevis
  'KP', // North Korea
  'KW', // Kuwait
  'LY', // Libya
  'MH', // Marshall Islands
  'MO', // Macau
  'MR', // Mauritania
  'MU', // Mauritius
  'NA', // Namibia
  'OM', // Oman
  'PA', // Panama
  'QA', // Qatar
  'RW', // Rwanda
  'SB', // Solomon Islands
  'SC', // Seychelles
  'ST', // Sao Tome and Principe
  'SY', // Syria
  'TC', // Turks and Caicos Islands
  'TO', // Tonga
  'TT', // Trinidad and Tobago
  'TV', // Tuvalu
  'VC', // Saint Vincent and the Grenadines
  'VG', // British Virgin Islands
  'WS', // Samoa
  'YE', // Yemen
];

export function getCountryPhoneConfig(countryCode: string): PhoneInputConfig {
  const normalizedCode = countryCode.toUpperCase();

  // Default config - numeric phone input
  return {
    inputMode: 'tel',
    maxLength: 15,
    allowsNonNumeric: false,
  };
}

export function getCountryPincodeConfig(countryCode: string): PincodeInputConfig {
  const normalizedCode = countryCode.toUpperCase();
  const hasAlphanumericPincode = ALPHANUMERIC_POSTAL_CODES.includes(normalizedCode);
  const hasNoPincode = NO_POSTAL_CODES.includes(normalizedCode);

  // Special handling for countries with alphanumeric postal codes
  if (normalizedCode === 'GB') {
    return {
      label: 'Postcode',
      inputMode: 'text',
      pattern: '[A-Z0-9 ]*',
      maxLength: 8,
      required: true,
      allowsLetters: true,
    };
  }

  if (normalizedCode === 'CA') {
    return {
      label: 'Postal Code',
      inputMode: 'text',
      pattern: '[A-Z0-9 ]*',
      maxLength: 7,
      required: true,
      allowsLetters: true,
    };
  }

  if (normalizedCode === 'NL') {
    return {
      label: 'Postal Code',
      inputMode: 'text',
      pattern: '[A-Z0-9 ]*',
      maxLength: 7,
      required: true,
      allowsLetters: true,
    };
  }

  if (normalizedCode === 'IE') {
    return {
      label: 'Eircode',
      inputMode: 'text',
      pattern: '[A-Z0-9 ]*',
      maxLength: 8,
      required: true,
      allowsLetters: true,
    };
  }

  // Countries without postal codes
  if (hasNoPincode) {
    return {
      label: 'Postal Code (optional)',
      inputMode: 'text',
      pattern: '[A-Z0-9 ]*',
      maxLength: 10,
      required: false,
      allowsLetters: false,
    };
  }

  // Default for most countries - numeric postal code
  if (normalizedCode === 'US') {
    return {
      label: 'ZIP Code',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 10,
      required: true,
      allowsLetters: false,
    };
  }

  // Default numeric postal code (India, etc.)
  return {
    label: 'Pincode',
    inputMode: 'numeric',
    pattern: '[0-9]*',
    maxLength: 10,
    required: true,
    allowsLetters: false,
  };
}

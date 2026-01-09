import { countries, getEmojiFlag, type TCountryCode as CountriesListCountryCode } from 'countries-list';

export interface Country {
  code: string;
  name: string;
  native: string;
  dialCode: string;
  flag: string;
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

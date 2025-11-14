import { useEffect, useState } from 'react';
import CountriesAPI, { type CountrySimple } from '../services/countriesAPI';
import { FALLBACK_COUNTRY_OPTIONS } from '../constants/countries';

export interface CountryOption {
  value: string;
  label: string;
  currency?: string;
}

const fallbackOptions: CountryOption[] = FALLBACK_COUNTRY_OPTIONS;

const normalizeCountries = (countries: CountrySimple[] = []): CountryOption[] =>
  countries.map(country => ({
    value: country.label || country.value,
    label: country.label || country.value,
    currency: country.currency
  }));

export function useCountryOptions() {
  const [countries, setCountries] = useState<CountryOption[]>(fallbackOptions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await CountriesAPI.getCountriesSimple();
        if (isMounted && response && response.length > 0) {
          setCountries(normalizeCountries(response));
        }
      } catch (error) {
        console.error('Failed to fetch countries, falling back to local list', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCountries();
    return () => {
      isMounted = false;
    };
  }, []);

  return { countries, loading };
}

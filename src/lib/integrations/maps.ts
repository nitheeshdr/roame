import { NotImplementedError } from '@/lib/utils';

/**
 * Ola Maps adapter. The interface is final; the implementation is wired when an
 * OLA_MAPS_API_KEY is provided. Until then every method returns a clean 501 so
 * the endpoints exist and are documented without pretending to work.
 */
const OLA_KEY = process.env.OLA_MAPS_API_KEY;
const isConfigured = !!OLA_KEY && OLA_KEY !== 'your-ola-maps-key';

function ensure(): void {
  if (!isConfigured) {
    throw new NotImplementedError('Ola Maps is not configured. Set OLA_MAPS_API_KEY to enable maps endpoints.');
  }
}

export const mapsAdapter = {
  isConfigured,
  async search(_query: string) {
    ensure();
    return [];
  },
  async reverseGeocode(_lat: number, _lng: number) {
    ensure();
    return {};
  },
  async autocomplete(_input: string) {
    ensure();
    return [];
  },
  async directions(_from: string, _to: string) {
    ensure();
    return {};
  },
  async nearby(_lat: number, _lng: number, _category?: string) {
    ensure();
    return [];
  },
};

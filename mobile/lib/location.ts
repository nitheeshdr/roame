import * as React from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
  lat: number;
  lng: number;
  name: string | null;
}

export type LocationStatus = 'loading' | 'denied' | 'ready' | 'error';

/**
 * Requests foreground location permission, reads the current position, and
 * reverse-geocodes it to a human place name (e.g. "Indiranagar, Bengaluru")
 * using the on-device geocoder — no API key needed.
 */
export function useLocation() {
  const [location, setLocation] = React.useState<UserLocation | null>(null);
  const [status, setStatus] = React.useState<LocationStatus>('loading');

  const load = React.useCallback(async () => {
    setStatus('loading');
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      let name: string | null = null;
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (place) {
          const area = place.district ?? place.subregion ?? null;
          const city = place.city ?? place.region ?? null;
          name = [area, city].filter((x) => x && x !== area).length
            ? [area, city].filter(Boolean).join(', ')
            : (city ?? area ?? place.name ?? null);
        }
      } catch {
        /* geocode is best-effort */
      }

      setLocation({ lat, lng, name });
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { location, status, retry: load };
}

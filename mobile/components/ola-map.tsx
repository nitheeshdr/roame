import * as React from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import type { MapPoint } from '@/lib/api';

const OLA_KEY = process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY;

/**
 * Live Ola Maps view rendered via MapLibre GL JS inside a WebView (works in
 * Expo Go — no native map module). Ola requires the api_key on every tile /
 * glyph / sprite request, appended in `transformRequest`. Activity markers are
 * plotted from /api/discovery/map; tapping one posts the id back to RN.
 */
function buildHtml(apiKey: string, points: MapPoint[], me: { lat: number; lng: number } | null): string {
  const data = JSON.stringify(points);
  const meJson = JSON.stringify(me);
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<style>html,body,#map{margin:0;height:100%;width:100%;background:#FAFAFA}
.mlibre-pin{width:18px;height:18px;border-radius:9px;background:#059669;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)}
.me-dot{width:16px;height:16px;border-radius:8px;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.18)}</style>
</head><body><div id="map"></div><script>
const KEY = ${JSON.stringify(apiKey)};
const POINTS = ${data};
const ME = ${meJson};
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=' + KEY,
  center: ME ? [ME.lng, ME.lat] : [77.5946, 12.9716],
  zoom: ME ? 13 : 10.5,
  attributionControl: false,
  transformRequest: (url) => {
    if (url.includes('api.olamaps.io') && !url.includes('api_key=')) {
      return { url: url + (url.includes('?') ? '&' : '?') + 'api_key=' + KEY };
    }
    return { url };
  },
});
map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
map.on('load', () => {
  const bounds = new maplibregl.LngLatBounds();
  if (ME) {
    const meEl = document.createElement('div'); meEl.className = 'me-dot';
    new maplibregl.Marker({ element: meEl }).setLngLat([ME.lng, ME.lat]).addTo(map);
    bounds.extend([ME.lng, ME.lat]);
  }
  POINTS.forEach((p) => {
    if (typeof p.lng !== 'number' || typeof p.lat !== 'number') return;
    const el = document.createElement('div'); el.className = 'mlibre-pin';
    el.onclick = () => window.ReactNativeWebView && window.ReactNativeWebView.postMessage(p.id);
    const popup = new maplibregl.Popup({ offset: 16, closeButton: false })
      .setHTML('<div style="font:600 13px system-ui;padding:2px 2px">'+ (p.title||'') +'</div>');
    new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
    bounds.extend([p.lng, p.lat]);
  });
  const count = POINTS.length + (ME ? 1 : 0);
  if (count > 1) { try { map.fitBounds(bounds, { padding: 70, maxZoom: 14, duration: 0 }); } catch(e){} }
});
</script></body></html>`;
}

export function OlaMap({
  points,
  me = null,
  onSelect,
}: {
  points: MapPoint[];
  me?: { lat: number; lng: number } | null;
  onSelect?: (id: string) => void;
}) {
  const html = React.useMemo(() => (OLA_KEY ? buildHtml(OLA_KEY, points, me) : ''), [points, me]);

  if (!OLA_KEY) {
    return (
      <View className="flex-1 items-center justify-center bg-subtle px-8">
        <Text className="text-center text-[15px] text-muted">
          Map is not configured. Set EXPO_PUBLIC_OLA_MAPS_API_KEY.
        </Text>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      style={{ flex: 1, backgroundColor: '#FAFAFA' }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(e) => onSelect?.(e.nativeEvent.data)}
    />
  );
}

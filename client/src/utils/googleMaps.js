// Generate a Google Maps link without geocoding or waiting for route calculation.
export function googleMapsUrl(destination, origin = '') {
  const dest = String(destination || '').trim();
  if (!dest) return '';
  const params = new URLSearchParams({api:'1', destination:dest, travelmode:'driving'});
  if (String(origin || '').trim()) params.set('origin',String(origin).trim());
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

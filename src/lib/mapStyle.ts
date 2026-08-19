// Hand-written JSON map style (not a Cloud-based Map ID style) so Explore
// doesn't depend on a manual Google Cloud Console setup step — recolors the
// default Google map to the app's paper/ink/teal palette.
export const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#F2EFE6' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4B4B42' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F2EFE6' }, { weight: 3 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },

  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#C8C4B4' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },

  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F2EFE6' }] },

  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#DCE0C8' }] },

  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E2DFD2' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#FDFCF7' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F0EAD8' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#D9C89A' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A8A7C' }] },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#C8DCE4' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3A7A8A' }] },
]

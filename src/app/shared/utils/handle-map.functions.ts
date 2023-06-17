import * as L from 'leaflet';

//* Включает взаимодействие с картой */
export function handleMapZoomEnd (map:L.Map,zoomEnd: boolean): void {
  zoomEnd = true;
  map.scrollWheelZoom.enable();
  map.dragging.enable();

  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.boxZoom.enable();
  console.log('onMapZoomEnd');
}

//* Отключает взаимодействие с картой */
export function handleMapZoomStart(map:L.Map,zoomEnd: boolean): void {
  zoomEnd = false;
  map.scrollWheelZoom.disable();
  map.dragging.disable();

  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.boxZoom.disable();

  let zoomWrap = map.zoomControl.getContainer();
  zoomWrap?.classList.add('disabledBtn');
  //console.log(88888, zoomWrap)
  console.log('onMapZoomStart');
}
//вынести
export function handleMapMoveStart(map:L.Map,zoomEnd: boolean): void {

}
// вынести
export function handleMapMoveEnd(map:L.Map,zoomEnd: boolean): void {

}

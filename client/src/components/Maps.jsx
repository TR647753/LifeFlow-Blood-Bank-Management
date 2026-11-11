import React,{useEffect,useState}from'react';import{MapContainer,TileLayer,Marker,Popup,Polyline,useMap}from'react-leaflet';import L from 'leaflet';import {toast} from 'react-toastify';import api from '../services/api';delete L.Icon.Default.prototype._getIconUrl;L.Icon.Default.mergeOptions({iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'});function Fit({points}){const map=useMap();useEffect(()=>{if(points.length)map.fitBounds(points,{padding:[35,35],maxZoom:13})},[JSON.stringify(points)]);return null}export function DonorMap({donors=[]}){const pins=donors.filter(d=>Number.isFinite(d.latitude)&&Number.isFinite(d.longitude));return <div className="map-wrap"><MapContainer center={[13.0827,80.2707]} zoom={11} style={{height:350}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{pins.map(d=><Marker key={d._id} position={[d.latitude,d.longitude]}><Popup>{d.name} • {d.bloodGroup}<br/>{d.city}</Popup></Marker>)}<Fit points={pins.map(d=>[d.latitude,d.longitude])}/></MapContainer>{!pins.length&&<small className="text-muted">No donors have map coordinates. Text search still works.</small>}</div>}
export function DeliveryRoute({request,inventory=[]}){const [route,setRoute]=useState([]),[origin,setOrigin]=useState(''),[destination,setDestination]=useState(''),[distance,setDistance]=useState(null),[busy,setBusy]=useState(false);const [a,setA]=useState(''),[b,setB]=useState('');useEffect(()=>{setOrigin('');setDestination('');setA('');setB(request?[request.hospitalName,request.hospitalAddress,request.city].filter(Boolean).join(', '):'');setRoute([]);setDistance(null)},[request?._id]);const geocode=async(text)=>{const response=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(text));const data=await response.json();if(!data.length)throw new Error('Address not found: '+text);return [Number(data[0].lat),Number(data[0].lon)]};async function plan(){setBusy(true);try{const start=a?await geocode(a):origin?origin.split(',').map(Number):null;const end=b?await geocode(b):destination?destination.split(',').map(Number):null;if(!start||!end)throw new Error('Enter both pickup and destination addresses');const url=`${import.meta.env.VITE_OSRM_URL||'https://router.project-osrm.org'}/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;const response=await fetch(url);const data=await response.json();if(!data.routes?.length)throw new Error('No driving route available');setRoute(data.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng]));setDistance({km:(data.routes[0].distance/1000).toFixed(1),minutes:Math.ceil(data.routes[0].duration/60)})}catch(e){toast.error(e.message)}finally{setBusy(false)}}return <div className="panel"><h5>Blood delivery route planner</h5><p className="muted">Plan a driving route from a blood bank to the hospital. Public routing is for demonstration; confirm road access and transport requirements.</p><div className="row g-2 mb-3"><div className="col-md-6"><label>Pickup blood bank address</label><input className="form-control" placeholder="e.g. Chennai Central Blood Bank, Chennai" value={a} onChange={e=>setA(e.target.value)}/><select className="form-select mt-2" value={origin} onChange={e=>{setOrigin(e.target.value);setA('')}}><option value="">Or select geocoded stock location</option>{inventory.filter(i=>(!request||i.bloodGroup===request.bloodGroup)&&i.units>0&&new Date(i.expiryDate)>new Date()&&Number.isFinite(i.latitude)&&Number.isFinite(i.longitude)).map(i=><option key={i._id} value={`${i.latitude},${i.longitude}`}>{i.location} ({i.bloodGroup})</option>)}</select></div><div className="col-md-6"><label>Destination hospital address</label><input className="form-control" placeholder="Hospital, city, state" value={b} onChange={e=>setB(e.target.value)}/><button className="btn btn-sm btn-outline-secondary mt-2" onClick={()=>setB(`${request?.hospitalName||''}, ${request?.hospitalAddress||''}, ${request?.city||''}`)}>Use request hospital</button></div></div><button className="btn btn-danger" disabled={busy} onClick={plan}>{busy?'Calculating...':'Calculate delivery route'}</button>{distance&&<div className="alert alert-info mt-3">Estimated driving distance: {distance.km} km • {distance.minutes} minutes (not live traffic)</div>}<div className="mt-3"><MapContainer center={[13.0827,80.2707]} zoom={11} style={{height:350}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{route.length>0&&<><Polyline positions={route} color="#d72545" weight={5}/><Marker position={route[0]}><Popup>Pickup</Popup></Marker><Marker position={route[route.length-1]}><Popup>Hospital</Popup></Marker><Fit points={route}/></>}</MapContainer></div></div>}

// Donors may navigate to the patient hospital (if authorized) or a verified camp.
// Route lookup uses an editable destination without changing patient records.
function cleanRouteAddress(parts) {
 const tokens = parts.flatMap(value => String(value || '').split(',')).map(value => value.trim()).filter(Boolean);
 const seen = new Set();
 return tokens.filter(token => { const key = token.toLocaleLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }).join(', ');
}
export function DonorCollectionRoute({request,camps=[],onClose}){
 const [choice,setChoice]=useState('hospital'),[start,setStart]=useState(''),[destinationOverride,setDestinationOverride]=useState(null),[route,setRoute]=useState([]),[info,setInfo]=useState(null),[busy,setBusy]=useState(false);
 const camp=camps.find(c=>c._id===choice);
 const suggested=camp?cleanRouteAddress([camp.name,camp.address,camp.city,camp.district,'India']):cleanRouteAddress([request.hospitalName,request.hospitalAddress,request.city,request.district,'India']);
 const target=destinationOverride===null?suggested:destinationOverride;
 async function geocode(address,kind){
  const query=address.trim();
  const candidates=[query];
  // A full facility name is not always indexed. Fall back to its street/area.
  const chunks=query.split(',').map(v=>v.trim()).filter(Boolean);
  if(chunks.length>2)candidates.push(chunks.slice(1).join(', '));
  for(const candidate of [...new Set(candidates)]){
   const response=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(candidate),{headers:{Accept:'application/json'}});
   if(!response.ok)throw new Error('Address lookup unavailable ('+kind+')');
   const matches=await response.json();
   if(matches.length){const lat=Number(matches[0].lat),lon=Number(matches[0].lon);if(Number.isFinite(lat)&&Number.isFinite(lon))return [lat,lon]}
  }
  throw new Error(kind+' address not found: '+query+'. Edit the address and try a street or landmark.');
 }
 async function calculate(){setBusy(true);setRoute([]);setInfo(null);try{
  if(!start.trim())throw new Error('Enter your starting address');
  if(!target.trim())throw new Error('Enter the destination address');
  const a=await geocode(start,'Starting');const b=await geocode(target,'Destination');
  const response=await fetch(`${import.meta.env.VITE_OSRM_URL||'https://router.project-osrm.org'}/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`);
  if(!response.ok)throw new Error('Route service unavailable');
  const data=await response.json();if(!data.routes?.length)throw new Error('No driving route found');
  setRoute(data.routes[0].geometry.coordinates.map(([lng,lat])=>[lat,lng]));
  setInfo({km:(data.routes[0].distance/1000).toFixed(1),min:Math.ceil(data.routes[0].duration/60)});
 }catch(e){toast.error(e.message)}finally{setBusy(false)}}
 return <div className="panel mt-3">
  <div className="d-flex justify-content-between"><h5>Donor donation location route</h5><button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button></div>
  <label>Choose donation destination</label>
  <select className="form-select mb-2" value={choice} onChange={e=>{setChoice(e.target.value);setDestinationOverride(null);setRoute([]);setInfo(null)}}><option value="hospital">Patient Hospital (only if authorized to collect blood)</option>{camps.map(c=><option key={c._id} value={c._id}>Camp: {c.name} — {c.city}</option>)}</select>
  <label>Destination address (editable for map search)</label>
  <input className="form-control mb-2" value={target} onChange={e=>{setDestinationOverride(e.target.value);setRoute([]);setInfo(null)}} placeholder="Hospital or camp street, city, India" />
  <button className="btn btn-sm btn-outline-secondary mb-2" onClick={()=>{setDestinationOverride(null);setRoute([]);setInfo(null)}}>Reset to saved destination</button>
  <p className="text-muted">Editing this address changes the map search only, not the patient's saved request. Confirm the location and collection authorization before travel. Donated blood requires testing and processing.</p>
  <label>Your starting address</label><input className="form-control mb-2" value={start} onChange={e=>setStart(e.target.value)} placeholder="Street or landmark, city, India"/>
  <button className="btn btn-danger" disabled={busy} onClick={calculate}>{busy?'Calculating...':'Calculate route'}</button>
  {info&&<p className="mt-2">Estimated driving distance: {info.km} km · {info.min} minutes (no live traffic)</p>}
  <div className="mt-3"><MapContainer center={[13.0827,80.2707]} zoom={11} style={{height:340}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{route.length>0&&<><Polyline positions={route} color="#d72545" weight={5}/><Marker position={route[0]}><Popup>Donor start</Popup></Marker><Marker position={route[route.length-1]}><Popup>Donation destination</Popup></Marker><Fit points={route}/></>}</MapContainer></div>
 </div>
}


// Reusable map for routes in the donor, admin and patient dashboards.
export function SharedRoutePlanner({title='Route planner',initialStart='',initialDestination='',startLabel='Starting address',endLabel='Destination address'}){
 const [start,setStart]=useState(initialStart),[end,setEnd]=useState(initialDestination),[points,setPoints]=useState([]),[summary,setSummary]=useState(null),[busy,setBusy]=useState(false);
 useEffect(()=>{setStart(initialStart);setEnd(initialDestination);setPoints([]);setSummary(null)},[initialStart,initialDestination]);
 async function locate(value,label){
  const parts=value.split(',').map(x=>x.trim()).filter(Boolean);
  const candidates=[value,...(parts.length>2?[parts.slice(1).join(', ')]:[])];
  for(const q of [...new Set(candidates)]){
   const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q),{headers:{Accept:'application/json'}});
   if(!r.ok)throw Error('Address lookup service unavailable');
   const results=await r.json();if(results.length)return [Number(results[0].lat),Number(results[0].lon)];
  }throw Error(label+' address not found. Try a street or landmark.');
 }
 async function calculate(){setBusy(true);setPoints([]);setSummary(null);try{
  if(!start.trim()||!end.trim())throw Error('Enter starting and destination addresses');
  const a=await locate(start,'Starting'),b=await locate(end,'Destination');
  const r=await fetch(`${import.meta.env.VITE_OSRM_URL||'https://router.project-osrm.org'}/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson&steps=true`);
  if(!r.ok)throw Error('Routing service unavailable');const result=await r.json(),route=result.routes?.[0];if(!route)throw Error('No driving route found');
  setPoints(route.geometry.coordinates.map(([lng,lat])=>[lat,lng]));
  setSummary({km:(route.distance/1000).toFixed(1),min:Math.ceil(route.duration/60),steps:(route.legs||[]).flatMap(leg=>leg.steps||[]).map(step=>step.name||step.maneuver?.type).filter(Boolean)});
 }catch(e){toast.error(e.message)}finally{setBusy(false)}}
 return <div className="panel mt-3"><h5>{title}</h5><p className="text-muted">Planned driving route, not live vehicle tracking or traffic.</p>
 <div className="row g-2"><div className="col-md-6"><label>{startLabel}</label><input className="form-control" value={start} onChange={e=>setStart(e.target.value)} placeholder="Street, city, India"/></div>
 <div className="col-md-6"><label>{endLabel}</label><input className="form-control" value={end} onChange={e=>setEnd(e.target.value)} placeholder="Street, city, India"/></div></div>
 <button className="btn btn-danger mt-2" disabled={busy} onClick={calculate}>{busy?'Calculating...':'Calculate route'}</button>
 {summary&&<><p className="mt-2"><strong>{summary.km} km</strong> · approximately {summary.min} minutes (no live traffic)</p><details><summary>Road names / directions</summary><ol>{summary.steps.map((step,i)=><li key={i}>{step}</li>)}</ol></details></>}
 <div className="mt-3"><MapContainer center={[13.0827,80.2707]} zoom={11} style={{height:340}}><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{points.length>0&&<><Polyline positions={points} color="#d72545" weight={5}/><Marker position={points[0]}><Popup>Starting location</Popup></Marker><Marker position={points[points.length-1]}><Popup>Destination</Popup></Marker><Fit points={points}/></>}</MapContainer></div></div>;
}

const STORAGE = { users: 'rf_users', listings: 'rf_listings', session: 'rf_session' };
const app = document.getElementById('app');
const authActions = document.getElementById('authActions');
let route = 'home';
let ownerMap, tenantMap, detailMap, ownerMarker;

const FACILITIES = ['Water','Electricity','WiFi','Parking','Gym','Security','AC','Balcony','Kitchen','Furnished'];
const ROOM_TYPES = ['Bachelor','Single','1BHK','2BHK'];

const read = (k, fallback=[]) => JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const session = () => read(STORAGE.session, null);
const users = () => read(STORAGE.users, []);
const listings = () => read(STORAGE.listings, seedListings());

function seedListings(){
  const data=[{id:crypto.randomUUID(),ownerId:'demo-owner',roomType:'1BHK',title:'Sunny 1BHK near park',description:'Modern flat with balcony and secure entry.',address:'Dhanmondi 27, Dhaka',location:'Near lake road',contactNumber:'+8801700000000',price:18000,images:[],facilities:['WiFi','Water','Security','Balcony'],latitude:23.7465,longitude:90.3760}];
  write(STORAGE.listings,data);
  return data;
}

function toast(msg){
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}

document.querySelectorAll('[data-route]').forEach(btn=>btn.onclick=()=>{ route=btn.dataset.route; render(); });

function renderAuth(){
  const s=session();
  authActions.innerHTML = s ? `<button class="btn" id="logoutBtn">Logout</button>` : `<button class="btn outline" id="loginNav">Login</button><button class="btn" id="signupNav">Signup</button>`;
  document.getElementById('logoutBtn')?.addEventListener('click',()=>{ localStorage.removeItem(STORAGE.session); toast('Logged out'); render(); });
  document.getElementById('loginNav')?.addEventListener('click',()=>showAuth('login'));
  document.getElementById('signupNav')?.addEventListener('click',()=>showAuth('register'));
}

function homeView(){
  app.innerHTML=`<section class="hero"><div class="card"><h2>Find your next room with confidence</h2><p>RoomFinder (static mode) supports Owner/Tenant authentication, listing creation, filters, and maps — all saved in browser localStorage.</p><div class="row"><button class="btn" id="heroStart">Get Started</button><button class="btn outline" id="heroDash">Open Dashboard</button></div></div></section>`;
  document.getElementById('heroStart').onclick=()=>showAuth('register');
  document.getElementById('heroDash').onclick=()=>{ route='dashboard'; render(); };
}

function showAuth(mode='login'){
  app.innerHTML=`<div class="card" style="max-width:520px;margin:28px auto;"><h3>${mode==='login'?'Login':'Create account'}</h3><form class="form" id="authForm">${mode==='register'?`<input class="input" name="name" placeholder="Name" required><input class="input" name="phone" placeholder="Phone" required><select class="input" name="userType"><option>Owner</option><option>Tenant</option></select>`:''}<input class="input" type="email" name="email" placeholder="Email" required><input class="input" type="password" name="password" placeholder="Password" required><button class="btn">${mode==='login'?'Sign in':'Register'}</button></form><p>${mode==='login'?'No account?':'Already registered?'} <button class="link" id="switchAuth">${mode==='login'?'Register':'Login'}</button></p></div>`;

  document.getElementById('switchAuth').onclick=()=>showAuth(mode==='login'?'register':'login');
  document.getElementById('authForm').onsubmit=(e)=>{
    e.preventDefault();
    const f=Object.fromEntries(new FormData(e.target).entries());
    if(mode==='register'){
      const all=users();
      if(all.find(u=>u.email===f.email)) return toast('Email exists');
      const user={id:crypto.randomUUID(),name:f.name,email:f.email,password:f.password,phone:f.phone,userType:f.userType};
      all.push(user); write(STORAGE.users,all); toast('Registered'); return showAuth('login');
    }
    const u=users().find(x=>x.email===f.email && x.password===f.password);
    if(!u) return toast('Invalid login');
    write(STORAGE.session,{id:u.id,name:u.name,email:u.email,phone:u.phone,userType:u.userType});
    route='dashboard'; toast('Welcome'); render();
  };
}

function ownerView(user){
  const my=listings().filter(l=>l.ownerId===user.id);
  app.innerHTML=`<div class="split"><section class="card"><h3>Create listing</h3><form class="form" id="listingForm"><select class="input" name="roomType">${ROOM_TYPES.map(r=>`<option>${r}</option>`).join('')}</select><input class="input" name="title" placeholder="Title" required><textarea class="input" name="description" placeholder="Description" required></textarea><input class="input" name="address" placeholder="Address" required><input class="input" name="location" placeholder="Location details" required><input class="input" name="contactNumber" value="${user.phone||''}" placeholder="Contact number" required><input class="input" type="number" name="price" placeholder="Rent/Price" required><input class="input" type="file" name="images" multiple accept="image/*"><div class="row">${FACILITIES.map(f=>`<label><input type="checkbox" name="facilities" value="${f}"> ${f}</label>`).join('')}</div><p><strong>Pin location:</strong> click on map</p><div id="ownerMap"></div><button class="btn">Publish</button></form></section><section><h3>Your listings</h3><div class="grid">${my.map(l=>cardHtml(l,true)).join('') || '<div class="card">No listings yet.</div>'}</div></section></div>`;

  setTimeout(()=>initOwnerMap(),0);

  app.querySelectorAll('.deleteBtn').forEach(btn=>btn.onclick=()=>{
    const all=listings().filter(x=>x.id!==btn.dataset.id); write(STORAGE.listings,all); toast('Deleted'); ownerView(user);
  });
  app.querySelectorAll('.viewBtn').forEach(btn=>btn.onclick=()=>showDetail(btn.dataset.id));

  document.getElementById('listingForm').onsubmit=async (e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    const files=fd.getAll('images').filter(f=>f && f.size);
    const imageData = await Promise.all(files.map(fileToDataURL));
    const listing={
      id:crypto.randomUUID(), ownerId:user.id,
      roomType:fd.get('roomType'), title:fd.get('title'), description:fd.get('description'), address:fd.get('address'),
      location:fd.get('location'), contactNumber:fd.get('contactNumber'), price:Number(fd.get('price')),
      images:imageData, facilities:fd.getAll('facilities'), latitude:ownerMarker.getLatLng().lat, longitude:ownerMarker.getLatLng().lng
    };
    const all=listings(); all.unshift(listing); write(STORAGE.listings,all); toast('Listing published'); ownerView(user);
  };
}

function tenantView(){
  const all=listings();
  app.innerHTML=`<section class="card"><h3>Browse listings</h3><div class="row"><select class="input" id="fltType" style="max-width:180px"><option value="">All Types</option>${ROOM_TYPES.map(t=>`<option>${t}</option>`).join('')}</select><input class="input" id="fltQuery" placeholder="Search location/address" style="max-width:320px"><label>Max Price: <span id="priceVal">50000</span></label><input id="fltPrice" type="range" min="1000" max="100000" value="50000"><button class="link" id="listMode">List View</button><button class="link" id="mapMode">Map View</button></div></section><section id="tenantBody" class="grid cards" style="margin-top:12px"></section>`;
  const state={type:'',query:'',price:50000,mode:'list'};
  const rerender=()=>{
    const filtered=all.filter(l=>(!state.type||l.roomType===state.type)&&(!state.query||`${l.address} ${l.location} ${l.title}`.toLowerCase().includes(state.query.toLowerCase()))&&l.price<=state.price);
    const body=document.getElementById('tenantBody');
    if(state.mode==='list'){
      body.className='grid cards';
      body.innerHTML=filtered.map(cardHtml).join('')||'<div class="card">No listings match filters.</div>';
      body.querySelectorAll('.viewBtn').forEach(btn=>btn.onclick=()=>showDetail(btn.dataset.id));
    } else {
      body.className='';
      body.innerHTML='<div id="tenantMap"></div>';
      setTimeout(()=>initTenantMap(filtered),0);
    }
  };
  document.getElementById('fltType').onchange=e=>{state.type=e.target.value;rerender();};
  document.getElementById('fltQuery').oninput=e=>{state.query=e.target.value;rerender();};
  document.getElementById('fltPrice').oninput=e=>{state.price=Number(e.target.value);document.getElementById('priceVal').textContent=e.target.value;rerender();};
  document.getElementById('listMode').onclick=()=>{state.mode='list';rerender();};
  document.getElementById('mapMode').onclick=()=>{state.mode='map';rerender();};
  rerender();
}

function cardHtml(l, canDelete=false){
  return `<article class="card"><img class="thumb" src="${l.images?.[0]||'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=900'}"><div class="row" style="justify-content:space-between"><span class="badge">${l.roomType}</span><strong>৳${l.price}</strong></div><h4>${l.title}</h4><p>${l.description}</p><p>📍 ${l.address}</p><p>📞 ${l.contactNumber}</p><div>${(l.facilities||[]).map(f=>`<span class="facility">${f}</span>`).join('')}</div><div class="row"><button class="btn viewBtn" data-id="${l.id}">Details</button>${canDelete?`<button class="btn outline deleteBtn" data-id="${l.id}">Delete</button>`:""}</div></article>`;
}

function showDetail(id){
  const l=listings().find(x=>x.id===id); if(!l) return;
  app.innerHTML=`<article class="card"><div class="grid cards">${(l.images?.length?l.images:['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200']).map(i=>`<img class="thumb" src="${i}" style="height:180px">`).join('')}</div><h2>${l.title}</h2><span class="badge">${l.roomType}</span><p>${l.description}</p><p><strong>Address:</strong> ${l.address}</p><p><strong>Price:</strong> ৳${l.price}</p><p><strong>Contact:</strong> ${l.contactNumber}</p><p><strong>Coordinates:</strong> ${l.latitude.toFixed(5)}, ${l.longitude.toFixed(5)}</p><div>${(l.facilities||[]).map(f=>`<span class="facility">${f}</span>`).join('')}</div><div class="row"><a class="btn" target="_blank" href="https://www.google.com/maps?q=${l.latitude},${l.longitude}">View on Map</a><button class="btn outline" id="backBtn">Back to Search</button></div><div id="detailMap"></div></article>`;
  document.getElementById('backBtn').onclick=()=>{ route='dashboard'; render(); };
  setTimeout(()=>{
    if(detailMap) detailMap.remove();
    detailMap=L.map('detailMap').setView([l.latitude,l.longitude],13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(detailMap);
    L.marker([l.latitude,l.longitude]).addTo(detailMap).bindPopup(`${l.roomType} • ৳${l.price}`).openPopup();
  },0);
}

function initOwnerMap(){
  if(ownerMap) ownerMap.remove();
  ownerMap=L.map('ownerMap').setView([23.8103,90.4125],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(ownerMap);
  ownerMarker=L.marker([23.8103,90.4125],{draggable:true}).addTo(ownerMap);
  ownerMap.on('click',(e)=>ownerMarker.setLatLng(e.latlng));
}

function initTenantMap(data){
  if(tenantMap) tenantMap.remove();
  tenantMap=L.map('tenantMap').setView([23.8103,90.4125],12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(tenantMap);
  data.forEach(l=>{
    const m=L.marker([l.latitude,l.longitude]).addTo(tenantMap);
    m.bindPopup(`<b>${l.title}</b><br>${l.roomType} • ৳${l.price}<br><button onclick="window.__openDetail('${l.id}')">Open</button>`);
  });
}
window.__openDetail=(id)=>showDetail(id);

function dashboardView(){
  const s=session();
  if(!s) return showAuth('login');
  if(s.userType==='Owner') ownerView(s);
  else tenantView();
}

function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const fr=new FileReader(); fr.onload=()=>resolve(fr.result); fr.onerror=reject; fr.readAsDataURL(file);
  });
}

function render(){
  renderAuth();
  if(route==='home') return homeView();
  if(route==='dashboard') return dashboardView();
  homeView();
}

render();

// ==========================================
// 1. กำหนด Base Maps (แผนที่พื้นฐาน)
// ==========================================
const standardMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
});

const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri'
});

// ==========================================
// 2. กำหนด Overlay Maps (TomTom Traffic)
// ==========================================
const tomtomApiKey = '8oHwI99AzpDA013yabYCuqOfZ4ffAW6t'; 

const trafficLayer = L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${tomtomApiKey}`, {
    maxZoom: 19,
    opacity: 0.8,
    attribution: '© TomTom Traffic'
});

// ==========================================
// 3. เริ่มต้นแผนที่ (ใช้ Canvas เพื่อความลื่นไหลบนมือถือ)
// ==========================================
const map = L.map('map', {
    center: [16.426, 102.831],
    zoom: 15,
    layers: [standardMap],
    preferCanvas: true 
});

// ==========================================
// 4. สร้างตัวควบคุม Layer (กางออกตลอดเวลา)
// ==========================================
const baseMaps = {
    "🗺️ แผนที่ปกติ": standardMap,
    "🛰️ ภาพถ่ายดาวเทียม": satelliteMap
};

const overlayMaps = {
    "🚥 สภาพจราจร (TomTom)": trafficLayer
};

L.control.layers(baseMaps, overlayMaps, { 
    position: 'topright',
    collapsed: false 
}).addTo(map);

// ==========================================
// 5. ปุ่มค้นหาพิกัด (เปลี่ยนเป็น Icon สากล)
// ==========================================
const locateControl = L.control({ position: 'topright' });

locateControl.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = `
        <a href="#" class="locate-button" 
           style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: #fff; color: #333; text-decoration: none; font-size: 20px; border-radius: 4px;" 
           title="หาตำแหน่งของฉัน" onclick="findMyLocation(event)">
            🎯
        </a>`;
    return div;
};
locateControl.addTo(map);

// ==========================================
// 6. ถนนที่ปิดการจราจร (สีแดง)
// ==========================================
const closedRoadCoords = [
    [16.43208706515419, 102.8236686865473], 
    [16.430630117959158, 102.83393084954284]
];

L.polyline(closedRoadCoords, {
    color: '#E60000',
    weight: 7,
    opacity: 0.9
}).addTo(map).bindPopup("<b>ถนนข้าวเหนียว</b><br>🚫 ปิดการจราจร");

// ==========================================
// 7. ถนนเดินรถทางเดียว (One Way) - น้ำเงินสว่าง/ขาว (วิ่งช้า)
// ==========================================
const antPathOptions = {
    "delay": 3000,          
    "dashArray": [2, 15],   
    "weight": 6,            
    "color": "#FFFFFF",     
    "pulseColor": "#00B0FF", 
    "paused": false,
    "reverse": false
};

function addOneWayRoad(coords, title) {
    L.polyline.antPath(coords, antPathOptions).addTo(map).bindPopup(title);
}

addOneWayRoad([[16.430630117959158, 102.83393084954284], [16.413435340521765, 102.83230136209767]], "ถ.หน้าเมือง (One Way ลงใต้)");
addOneWayRoad([[16.413410196889533, 102.83390695303456], [16.430427455358263, 102.83551202402492]], "ถ.กลางเมือง (One Way ขึ้นเหนือ)");
addOneWayRoad([[16.425690229282985, 102.83337331303535], [16.426572045447383, 102.8265380468853]], "ถ.รื่นรมย์ (One Way ตะวันตก)");
addOneWayRoad([[16.4288121055052, 102.82655115995854], [16.420952043566356, 102.82411801361377]], "ถ.ดรุณสำราญ (One Way ลงใต้)");
addOneWayRoad([[16.41339039536673, 102.83232797139702], [16.413393379252348, 102.83515038046185]], "ถ.เหล่านาดี (One Way มุ่งหน้าบึงแก่นนคร)");
addOneWayRoad([[16.43040440588915, 102.83555893562193], [16.43064366518606, 102.83390937467006]], "จุดเชื่อมต่อถนนหน้าเมือง");

// ==========================================
// 8. ระบบติดตามพิกัด GPS แบบ Real-time
// ==========================================
let userMarker, userCircle;
let isTracking = false;

function findMyLocation(e) {
    if (e) e.preventDefault();
    const btn = document.querySelector('.locate-button');

    if (!isTracking) {
        map.locate({ 
            setView: true, 
            maxZoom: 16, 
            watch: true,                
            enableHighAccuracy: true,   
            maximumAge: 1000            
        });
        isTracking = true;
        btn.innerHTML = '🔄'; // เปลี่ยนเป็น Icon กำลังโหลด
        btn.style.color = '#2196F3';
    } else {
        map.stopLocate();
        isTracking = false;
        btn.innerHTML = '🎯';
        btn.style.color = '#333';
    }
}

map.on('locationfound', function(e) {
    if (userMarker) map.removeLayer(userMarker);
    if (userCircle) map.removeLayer(userCircle);

    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        iconSize: [25, 41], iconAnchor: [12, 41]
    });
    
    userMarker = L.marker(e.latlng, {icon: userIcon}).addTo(map);
    userCircle = L.circle(e.latlng, e.accuracy, { color: '#2196F3', fillOpacity: 0.1 }).addTo(map);
    
    // หากกำลังติดตามอยู่ ปรับ Icon ให้เป็นสีฟ้าเพื่อบอกสถานะ Active
    if (isTracking) {
        const btn = document.querySelector('.locate-button');
        btn.innerHTML = '🎯';
        btn.style.color = '#2196F3';
    }
});

map.on('locationerror', function(e) {
    alert("ไม่สามารถเข้าถึงพิกัด GPS ได้");
    isTracking = false;
    document.querySelector('.locate-button').innerHTML = '🎯';
});

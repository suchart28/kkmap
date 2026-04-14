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
// 3. เริ่มต้นแผนที่ (เพิ่ม preferCanvas เพื่อให้มือถือโหลดเส้นและ Animation ได้ลื่นไหลขึ้น)
// ==========================================
const map = L.map('map', {
    center: [16.426, 102.831],
    zoom: 15,
    layers: [standardMap],
    preferCanvas: true // ✨ บังคับให้ใช้ Canvas วาดกราฟิก ช่วยลดอาการกระตุกบนมือถือ
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
// 5. ปุ่มค้นหาพิกัด (ย้ายมา TopRight ให้อยู่ใต้ Layer)
// ==========================================
const locateControl = L.control({ position: 'topright' });

locateControl.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    // ปรับรูปแบบปุ่มให้เป็นข้อความยาวขึ้น กดง่ายบนมือถือ
    div.innerHTML = `
        <a href="#" class="locate-button" style="display: block; padding: 8px 12px; background: #fff; color: #333; text-decoration: none; font-weight: bold; border-radius: 4px;" title="หาตำแหน่งของฉัน" onclick="findMyLocation(event)">
            📍 พิกัดของฉัน
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
// 7. ถนนเดินรถทางเดียว (One Way) - สีน้ำเงินสว่าง/ขาว
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
// 8. กล่องสัญลักษณ์ (Legend)
// ==========================================
const legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = `
        <h4 style="margin: 0 0 10px 0; text-align: center;">สัญลักษณ์</h4>
        <div class="legend-item"><span class="color-box red-line"></span> ห้ามผ่าน (ปิดถนน)</div>
        <div class="legend-item">
            <span class="color-box" style="background: #00B0FF; border: 1px solid #ccc; height: 6px;"></span> 
            เดินรถทางเดียว (น้ำเงินสว่าง)
        </div>
    `;
    return div;
};
legend.addTo(map);

// ==========================================
// 9. ระบบติดตามพิกัด GPS แบบ Real-time (ปรับจูนสำหรับมือถือ)
// ==========================================
let userMarker, userCircle;
let isTracking = false; // ตัวแปรเช็คสถานะการติดตาม

function findMyLocation(e) {
    if (e) e.preventDefault();
    
    const btn = document.querySelector('.locate-button');

    if (!isTracking) {
        // ✨ เปิดโหมดติดตามต่อเนื่อง (Watch) และใช้ GPS แม่นยำสูง
        map.locate({ 
            setView: true, 
            maxZoom: 16, 
            watch: true,                // ดึงพิกัดต่อเนื่องเมื่อผู้ใช้ขยับ
            enableHighAccuracy: true,   // บังคับใช้ฮาร์ดแวร์ GPS แทนเสาสัญญาณ (แม่นยำขึ้นมาก)
            maximumAge: 2000            // อัปเดตข้อมูลใหม่ตลอด (ยอมให้ใช้ข้อมูลเก่าไม่เกิน 2 วินาที)
        });
        isTracking = true;
        btn.innerHTML = '🔄 กำลังติดตาม...';
        btn.style.color = '#2196F3';
    } else {
        // กดซ้ำเพื่อหยุดการติดตาม ช่วยประหยัดแบตเตอรี่มือถือ
        map.stopLocate();
        isTracking = false;
        btn.innerHTML = '📍 พิกัดของฉัน';
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
});

map.on('locationerror', function(e) {
    alert("ไม่สามารถเข้าถึงพิกัด GPS ได้ กรุณาเปิด Location (GPS) ในเครื่องของคุณ");
    isTracking = false;
    document.querySelector('.locate-button').innerHTML = '📍 พิกัดของฉัน';
    document.querySelector('.locate-button').style.color = '#333';
});

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
// 3. เริ่มต้นแผนที่
// ==========================================
const map = L.map('map', {
    center: [16.426, 102.831],
    zoom: 15,
    layers: [standardMap] 
});

// ==========================================
// 4. สร้างตัวควบคุม Layer (ตั้งค่าให้แสดงตลอดเวลา)
// ==========================================
const baseMaps = {
    "🗺️ แผนที่ปกติ": standardMap,
    "🛰️ ภาพถ่ายดาวเทียม": satelliteMap
};

const overlayMaps = {
    "🚥 สภาพจราจร (TomTom)": trafficLayer
};

// collapsed: false คือการสั่งให้เมนู "กางออกตลอดเวลา"
L.control.layers(baseMaps, overlayMaps, { 
    position: 'topright',
    collapsed: false 
}).addTo(map);

// ==========================================
// 5. ถนนที่ปิดการจราจร (สีแดง)
// ==========================================
const closedRoadCoords = [
    [16.43208706515419, 102.8236686865473], 
    [16.430630117959158, 102.83393084954284]
    [16.431221853618894, 102.82932971705632]
    [16.430378016189305, 102.82913123344365]
    [16.430300835753666, 102.82909904691186]
    [16.4314431030702, 102.82780085679653]
];

L.polyline(closedRoadCoords, {
    color: '#E60000',
    weight: 7,
    opacity: 0.9
}).addTo(map).bindPopup("<b>ถนนข้าวเหนียว</b><br>🚫 ปิดการจราจร");

// ==========================================
// 6. ถนนเดินรถทางเดียว (One Way) - สีน้ำเงินสว่าง/ขาว
// ==========================================
const antPathOptions = {
    "delay": 1000,          // อนิเมชั่นช้ามาก
    "dashArray": [2, 15],   // รอยปะถี่
    "weight": 6,            // ปรับเส้นให้หนาขึ้นเล็กน้อยเพื่อให้เห็นสีชัด
    "color": "#FFFFFF",     // สีพื้นหลังเส้น (สีขาวตามที่ขอ)
    "pulseColor": "#0703fc", // สีน้ำเงินสว่าง (Bright Blue)
    "paused": false,
    "reverse": false
};

function addOneWayRoad(coords, title) {
    L.polyline.antPath(coords, antPathOptions).addTo(map).bindPopup(title);
}

// วาดเส้นตามพิกัดเดิม
addOneWayRoad([[16.430630117959158, 102.83393084954284], [16.413435340521765, 102.83230136209767]], "ถ.หน้าเมือง (One Way ลงใต้)");
addOneWayRoad([[16.413410196889533, 102.83390695303456], [16.430427455358263, 102.83551202402492]], "ถ.กลางเมือง (One Way ขึ้นเหนือ)");
addOneWayRoad([[16.425690229282985, 102.83337331303535], [16.426572045447383, 102.8265380468853]], "ถ.รื่นรมย์ (One Way ตะวันตก)");
addOneWayRoad([[16.4288121055052, 102.82655115995854], [16.420952043566356, 102.82411801361377]], "ถ.ดรุณสำราญ (One Way ลงใต้)");
addOneWayRoad([[16.41339039536673, 102.83232797139702], [16.413393379252348, 102.83515038046185]], "ถ.เหล่านาดี (One Way มุ่งหน้าบึงแก่นนคร)");
addOneWayRoad([[16.43040440588915, 102.83555893562193], [16.43064366518606, 102.83390937467006]], "จุดเชื่อมต่อถนนหน้าเมือง");
addOneWayRoad([[16.42106567345773, 102.82391467746132], [16.42145135270463, 102.82063734257405]], "จุดเชื่อมต่อถนนมิตรภาพ");

// ==========================================
// 7. กล่องสัญลักษณ์ (Legend)
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
// 8. พิกัดปัจจุบัน (User Location)
// ==========================================
let userMarker, userCircle;
const locateControl = L.control({ position: 'topleft' });

locateControl.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = `<a href="#" class="locate-button" title="หาตำแหน่งของฉัน" onclick="findMyLocation(event)">📍</a>`;
    return div;
};
locateControl.addTo(map);

function findMyLocation(e) {
    if (e) e.preventDefault();
    map.locate({ setView: true, maxZoom: 16 });
}

map.on('locationfound', function(e) {
    if (userMarker) map.removeLayer(userMarker);
    if (userCircle) map.removeLayer(userCircle);
    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        iconSize: [25, 41], iconAnchor: [12, 41]
    });
    userMarker = L.marker(e.latlng, {icon: userIcon}).addTo(map).bindPopup("คุณอยู่ที่นี่").openPopup();
    userCircle = L.circle(e.latlng, e.accuracy, { color: '#2196F3', fillOpacity: 0.1 }).addTo(map);
});

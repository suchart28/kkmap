// 1. กำหนดจุดศูนย์กลางแผนที่
const map = L.map('map').setView([16.426, 102.831], 15);

// 2. Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | สงกรานต์ขอนแก่น'
}).addTo(map);

// ==========================================
// 3. ถนนที่ปิดการจราจร (สีแดง)
// ==========================================
const closedRoadCoords = [
    [16.43208706515419, 102.8236686865473], 
    [16.430630117959158, 102.83393084954284]
];

L.polyline(closedRoadCoords, {
    color: '#E60000',
    weight: 6, // ปรับลดความหนาลงเล็กน้อยให้ดูสะอาดตา
    opacity: 0.9
}).addTo(map).bindPopup("<b>ถนนข้าวเหนียว</b><br>🚫 ปิดการจราจร");

// ==========================================
// 4. ถนนเดินรถทางเดียว (One Way) + Animation + หัวลูกศร
// ==========================================

const antPathOptions = {
    "delay": 600,
    "dashArray": [5, 15], // ปรับให้ถี่ขึ้น (เส้นสั้น 5, ช่องว่าง 15)
    "weight": 4,          // ปรับให้เส้นบางลงตามคำขอ
    "color": "#FFFFFF",
    "pulseColor": "#8CC63F",
    "paused": false,
    "reverse": false
};

// ฟังก์ชันช่วยวาดเส้นพร้อมหัวลูกศร
function addOneWayRoad(coords, title) {
    // วาดเส้นเคลื่อนไหว
    const path = L.polyline.antPath(coords, antPathOptions).addTo(map).bindPopup(title);
    
    // เพิ่มหัวลูกศรกำกับทิศทาง (ไม่เคลื่อนไหวแต่ช่วยยืนยันหัวลูกศร)
    L.polylineDecorator(path, {
        patterns: [
            {
                offset: '10%', // จุดเริ่มต้นลูกศรแรก
                repeat: '100px', // ระยะห่างระหว่างลูกศร
                symbol: L.Symbol.arrowHead({
                    pixelSize: 10,
                    polygon: false,
                    pathOptions: { stroke: true, color: '#4d8a00', weight: 2 }
                })
            }
        ]
    }).addTo(map);
}

// อัปเดตเส้นทางตามพิกัดที่คุณให้มา
addOneWayRoad([
    [16.430630117959158, 102.83393084954284], 
    [16.413435340521765, 102.83230136209767]
], "ถ.หน้าเมือง (One Way ลงใต้)");

addOneWayRoad([
    [16.413410196889533, 102.83390695303456], 
    [16.430427455358263, 102.83551202402492]
], "ถ.กลางเมือง (One Way ขึ้นเหนือ)");

addOneWayRoad([
    [16.425690229282985, 102.83337331303535], 
    [16.426572045447383, 102.8265380468853]
], "ถ.รื่นรมย์ (One Way ตะวันตก)");

addOneWayRoad([
    [16.4288121055052, 102.82655115995854], 
    [16.420952043566356, 102.82411801361377]
], "ถ.ดรุณสำราญ (One Way ลงใต้)");

addOneWayRoad([
    [16.41339039536673, 102.83232797139702], 
    [16.413393379252348, 102.83515038046185]
], "ถ.เหล่านาดี (One Way มุ่งหน้าบึงแก่นนคร)");

addOneWayRoad([
    [16.43040440588915, 102.83555893562193], 
    [16.43064366518606, 102.83390937467006]
], "จุดเชื่อมต่อถนนหน้าเมือง");

// ==========================================
// 5. กล่องสัญลักษณ์ (Legend)
// ==========================================
const legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = `
        <h4 style="margin: 0 0 10px 0; text-align: center;">สัญลักษณ์</h4>
        <div class="legend-item"><span class="color-box red-line"></span> ห้ามผ่าน (ปิดถนน)</div>
        <div class="legend-item"><span class="color-box green-dashed"></span> One Way (ตามทิศลูกศร)</div>
    `;
    return div;
};
legend.addTo(map);

// ==========================================
// 6. พิกัดปัจจุบัน (User Location)
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

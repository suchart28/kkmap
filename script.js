// 1. กำหนดจุดศูนย์กลางแผนที่ไปที่จังหวัดขอนแก่น
const map = L.map('map').setView([16.426, 102.831], 15);

// 2. เรียกใช้ OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors | สร้างสำหรับงานสงกรานต์ขอนแก่น'
}).addTo(map);

// ==========================================
// 3. กำหนดพิกัดถนนที่ ปิดการจราจร (สีแดง)
// ==========================================
const closedRoadCoords = [
    [16.43208706515419, 102.8236686865473], // แยกมิตรภาพ (ใกล้เซ็นทรัล)
    [16.430630117959158, 102.83393084954284]  // ปรับพิกัดให้ชนพอดีกับแยกศรีจันทร์
];

const closedRoad = L.polyline(closedRoadCoords, {
    color: '#E60000',
    weight: 8,
    opacity: 0.9
}).addTo(map);

closedRoad.bindPopup("<b>ถนนข้าวเหนียว (ถ.ศรีจันทร์)</b><br>🚫 ห้ามผ่าน<br>ปิด 9 เม.ย. 69 เวลา 21.00 น.<br>ถึง 16 เม.ย. 69 เวลา 12.00 น.");

// ==========================================
// 4. กำหนดพิกัดถนน เดินรถทางเดียว (One Way - Animation สีเขียว)
// ==========================================

// ตั้งค่า Style ของเส้น Animation
const antPathOptions = {
    "delay": 400,          // ความเร็วในการวิ่ง
    "dashArray": [15, 30], // ขนาดของเส้นปะ
    "weight": 6,           // ความหนาของเส้น
    "color": "#FFFFFF",    // สีพื้นหลังเส้น
    "pulseColor": "#0b00a8", // สีของเส้นที่วิ่ง
    "paused": false,
    "reverse": false
};

// ถ.หน้าเมือง (วิ่งลงใต้)
L.polyline.antPath([
    [16.430630117959158, 102.83393084954284], // แยกศรีจันทร์
    [16.413435340521765, 102.83230136209767]  // แยกล่านาดี
], antPathOptions).addTo(map).bindPopup("ถ.หน้าเมือง (One Way ลงใต้)");

// ถ.กลางเมือง (วิ่งขึ้นเหนือ)
L.polyline.antPath([
    [16.413410196889533, 102.83390695303456], // แยกล่านาดี
    [16.430427455358263, 102.83551202402492]  // แยกศรีจันทร์
], antPathOptions).addTo(map).bindPopup("ถ.กลางเมือง (One Way ขึ้นเหนือ)");

// ถ.รื่นรมย์ (วิ่งไปทางซ้าย/ตะวันตก)
L.polyline.antPath([
    [16.425690229282985, 102.83337331303535], // แยกกลางเมือง
    [16.426572045447383, 102.8265380468853]  // แยกใกล้สถานีรถไฟ
], antPathOptions).addTo(map).bindPopup("ถ.รื่นรมย์ (One Way ตะวันตก)");

// ถ.ดรุณสำราญ (วิ่งลงใต้)
L.polyline.antPath([
    [16.4288121055052, 102.82655115995854], // แยกศรีจันทร์
    [16.420952043566356, 102.82411801361377]  // ไปทาง ถ.บ้านกอก
], antPathOptions).addTo(map).bindPopup("ถ.ดรุณสำราญ (One Way ลงใต้)");

// ถ.เหล่านาดี (วิ่งไปทางขวา/บึงแก่นนคร)
L.polyline.antPath([
    [16.41339039536673, 102.83232797139702], // แยกหน้าเมือง
    [16.413393379252348, 102.83515038046185]  // มุ่งหน้าบึงแก่นนคร
], antPathOptions).addTo(map).bindPopup("ถ.เหล่านาดี (One Way มุ่งหน้าบึงแก่นนคร)");

// ถ.ช่วงถนนหน้าเมืองตัดผ่านด้านบนไปยังมิตรภาพ (ตามลูกศรบนสุด)
L.polyline.antPath([
    [16.43040440588915, 102.83555893562193], 
    [16.43064366518606, 102.83390937467006]  
], antPathOptions).addTo(map);

// หนองวัด - บ้านกอก
L.polyline.antPath([
    [16.421035749252265, 102.82388016111702], 
    [16.421427376996874, 102.82069045923163]  
], antPathOptions).addTo(map);

// ==========================================
// 5. เพิ่มจุดสังเกต (Landmarks)
// ==========================================
const landmarks = [
    { name: "เซ็นทรัล ขอนแก่น", coords: [16.4326, 102.8239] },
    { name: "ศาลหลักเมือง", coords: [16.4310, 102.8285] },
    { name: "สถานีรถไฟขอนแก่น", coords: [16.4262, 102.8230] },
    { name: "แฟรี่พลาซ่า", coords: [16.4215, 102.8325] },
    { name: "เทศบาลนครขอนแก่น", coords: [16.4300, 102.8300] }
];

landmarks.forEach(place => {
    L.marker(place.coords).addTo(map).bindPopup(`<b>${place.name}</b>`);
});

// ==========================================
// 6. เพิ่มกล่องสัญลักษณ์ (Legend)
// ==========================================
const legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = `
        <h4 style="margin: 0 0 10px 0; text-align: center;">สัญลักษณ์</h4>
        <div class="legend-item"><span class="color-box red-line"></span> ห้ามผ่าน (ปิดถนน)</div>
        <div class="legend-item"><span class="color-box green-dashed"></span> เดินรถทางเดียว (One Way)</div>
    `;
    return div;
};
legend.addTo(map);

// ==========================================
// 7. ฟังก์ชันแสดงพิกัดปัจจุบัน (User Location)
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
    const radius = e.accuracy;

    if (userMarker) map.removeLayer(userMarker);
    if (userCircle) map.removeLayer(userCircle);

    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    userMarker = L.marker(e.latlng, {icon: userIcon}).addTo(map)
        .bindPopup("📍 คุณอยู่ที่นี่").openPopup();

    userCircle = L.circle(e.latlng, radius, {
        color: '#2196F3',
        fillColor: '#2196F3',
        fillOpacity: 0.15
    }).addTo(map);
});

map.on('locationerror', function(e) {
    alert("ไม่สามารถเข้าถึงพิกัดของคุณได้ กรุณาลองตรวจสอบการตั้งค่า Browser หรือเปิด GPS: " + e.message);
});

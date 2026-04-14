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
// 7. ถนนเดินรถทางเดียว (One Way)
// ==========================================
const antPathOptions = {
    "delay": 2000,          
    "dashArray": [2, 15],   
    "weight": 5,            
    "color": "#FFFFFF",     
    "pulseColor": "#E60000", 
    "paused": false,
    "reverse": false
};

function addOneWayRoad(coords, title) {
    L.polyline.antPath(coords, antPathOptions).addTo(map).bindPopup(title);
}

addOneWayRoad([[16.430630117959158, 102.83393084954284], [16.413435340521765, 102.83230136209767]], "ถ.หน้าเมือง (One Way ลงใต้)");
addOneWayRoad([[16.413410196889533, 102.83390695303456], [16.430427455358263, 102.83551202402492]], "ถ.กลางเมือง (One Way ขึ้นเหนือ)");
addOneWayRoad([[16.425690229282985, 102.83337331303535], [16.426572045447383, 102.8265380468853]], "ถ.รื่นรมย์ (One Way ตะวันตก)");
addOneWayRoad([[16.426424888773887, 102.82574935799803], [16.420952043566356, 102.82411801361377]], "ถ.ดรุณสำราญ (One Way ลงใต้)");
addOneWayRoad([[16.41339039536673, 102.83232797139702], [16.413393379252348, 102.83515038046185]], "ถ.เหล่านาดี (One Way มุ่งหน้าบึงแก่นนคร)");
addOneWayRoad([[16.43040440588915, 102.83555893562193], [16.43064366518606, 102.83390937467006]], "จุดเชื่อมต่อถนนหน้าเมือง");
addOneWayRoad([[16.42106567345773, 102.82391467746132], [16.42145135270463, 102.82063734257405]], "จุดเชื่อมต่อถนนมิตรภาพ");

// ==========================================
// 8. ถนนเดินรถปกติ (สีเขียว)
// ==========================================
const normalRoadOptions = {
    color: '#00C853', // สีเขียวสดใส
    weight: 6,
    opacity: 0.9
};

// ฟังก์ชันสำหรับวาดเส้นทางเดินรถปกติ
function addNormalRoad(coords, title) {
    L.polyline(coords, normalRoadOptions).addTo(map).bindPopup(title);
}

// ⚠️ ใส่พิกัดของถนนเส้นปกติที่คุณต้องการที่นี่ (ด้านล่างนี้เป็นพิกัดตัวอย่าง)
addNormalRoad([[16.430468870878887, 102.8355642121243],[16.429697546492847, 102.84134507354537]], "ถนนเดินรถปกติ 2 ทาง");
addNormalRoad([[16.430717671233467, 102.83396274032296],[16.434248231523974, 102.834305570534]], "ถนนเดินรถปกติ 2 ทาง");
addNormalRoad([[16.430553257495006, 102.83552351883705],[16.434023246824353, 102.83601971999757]], "ถนนเดินรถปกติ 2 ทาง");
addNormalRoad([[16.420818963375638, 102.82401718976625],[16.41565223039998, 102.82251507616866]], "ถนนเดินรถปกติ 2 ทาง");
addNormalRoad([[16.419130693898822, 102.82366821387994],[16.417311421587623, 102.83251399395469]], "ถนนเดินรถปกติ 2 ทาง");
addNormalRoad([[16.415594012802817, 102.82260611338499],[16.41341084428344, 102.83233191960782]], "ถนนเดินรถปกติ 2 ทาง");
addNormalRoad([[16.413352626008358, 102.83390989779195],[16.406599200908335, 102.83313608169622]], "ถนนเดินรถปกติ 2 ทาง");


// ==========================================
// 9. ระบบติดตามพิกัด GPS แบบ Real-time
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

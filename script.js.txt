// script.js
function convertUTM() {
    let utmValues = document.getElementById('utmInput').value.trim().split(" ");
    if (utmValues.length !== 2) {
        document.getElementById('output').value = "Please enter both Easting and Northing separated by a space.";
        return;
    }
    let easting = parseFloat(utmValues[0]);
    let northing = parseFloat(utmValues[1]);
    let zone = 40; // Default zone for UAE
    
    let latLon = utmToLatLon(easting, northing, zone);
    document.getElementById('output').value = `${latLon.latitude}, ${latLon.longitude}`;
}

function copyOutput() {
    let outputField = document.getElementById('output');
    outputField.select();
    document.execCommand('copy');
}

function clearOutput() {
    document.getElementById('utmInput').value = "";
    document.getElementById('output').value = "";
}

function utmToLatLon(easting, northing, zoneNumber, northernHemisphere = true) {
    const k0 = 0.9996;
    const a = 6378137;
    const eccSquared = 0.00669438;
    const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
    
    let x = easting - 500000;
    let y = northing;
    if (!northernHemisphere) y -= 10000000;
    
    let longOrigin = (zoneNumber - 1) * 6 - 180 + 3;
    
    let m = y / k0;
    let mu = m / (a * (1 - eccSquared / 4 - 3 * eccSquared ** 2 / 64 - 5 * eccSquared ** 3 / 256));
    
    let phi1Rad = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
        + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
        + (151 * e1 ** 3 / 96) * Math.sin(6 * mu);
    let n = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) ** 2);
    let t = Math.tan(phi1Rad) ** 2;
    let c = eccSquared * Math.cos(phi1Rad) ** 2 / (1 - eccSquared);
    let r = a * (1 - eccSquared) / ((1 - eccSquared * Math.sin(phi1Rad) ** 2) ** 1.5);
    let d = x / (n * k0);
    
    let lat = phi1Rad - (n * Math.tan(phi1Rad) / r) * (d ** 2 / 2 - (5 + 3 * t + 10 * c - 4 * c ** 2 - 9 * eccSquared) * d ** 4 / 24 + (61 + 90 * t + 298 * c + 45 * t ** 2 - 252 * eccSquared - 3 * c ** 2) * d ** 6 / 720);
    lat = lat * (180 / Math.PI);
    
    let lon = (d - (1 + 2 * t + c) * d ** 3 / 6 + (5 - 2 * c + 28 * t - 3 * c ** 2 + 8 * eccSquared + 24 * t ** 2) * d ** 5 / 120) / Math.cos(phi1Rad);
    lon = longOrigin + lon * (180 / Math.PI);
    
    return { latitude: lat, longitude: lon };
}

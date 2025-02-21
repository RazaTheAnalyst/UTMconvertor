let bulkResults = [];

function convertUTM() {
    let utmValues = document.getElementById('utmInput').value.trim().split(" ");
    let zone = parseInt(document.getElementById('zoneInput').value);

    if (utmValues.length !== 2) {
        document.getElementById('output').value = "Please enter both Easting and Northing separated by a space.";
        return;
    }

    let easting = parseFloat(utmValues[0]);
    let northing = parseFloat(utmValues[1]);

    if (isNaN(easting) || isNaN(northing)) {
        document.getElementById('output').value = "Please enter valid numeric values for Easting and Northing.";
        return;
    }

    let latLon = utmToLatLon(easting, northing, zone);

    if (latLon) {
        document.getElementById('output').value = `${latLon.latitude.toFixed(6)}, ${latLon.longitude.toFixed(6)}`;
    } else {
        document.getElementById('output').value = "Error: Conversion failed. Please check the values.";
    }
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

// Handle Bulk File Upload
function handleFileUpload() {
    const fileInput = document.getElementById('bulkUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file first!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        processCSV(csvData);
    };

    reader.readAsText(file);
}

// Process CSV file content
function processCSV(csvData) {
    const lines = csvData.split("\n");
    bulkResults = [];

    lines.forEach((line, index) => {
        const values = line.split(",");
        if (values.length === 2) {
            const easting = parseFloat(values[0].trim());
            const northing = parseFloat(values[1].trim());
            const latLon = utmToLatLon(easting, northing, 40); // Assuming zone 40 for simplicity

            if (latLon) {
                // Keep Easting, Northing, Latitude, Longitude on the same line
                bulkResults.push([easting, northing, latLon.latitude.toFixed(6), latLon.longitude.toFixed(6)]);
            }
        }
    });

    if (bulkResults.length > 0) {
        document.getElementById("downloadBtn").disabled = false;
        alert("Bulk data processed successfully. You can now download the output.");
    } else {
        alert("No valid UTM data found.");
    }
}

// Download Bulk Output as CSV
function downloadCSV() {
    const header = "Easting,Northing,Latitude,Longitude\n";
    let csvContent = header;

    bulkResults.forEach(row => {
        // The UTM coordinates (Easting, Northing) are now in front of the converted Latitude and Longitude
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "utm_to_lat_lon.csv";
    link.click();
}

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');
const os = require('os'); // OS အမျိုးအစား သိဖို့

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const DATA_FILE = 'network_data.json';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getPing() {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'ping -n 2 1.1.1.1' : 'ping -c 2 1.1.1.1';
    try {
        const output = execSync(cmd).toString();
        const match = output.match(/time=([\d.]+)/);
        return match ? parseFloat(match[1]) : null;
    } catch (e) { return null; }
}

async function getNetworkDetails() {
    try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        
        let ispName = data.connection && data.connection.isp ? data.connection.isp : "Unknown";
        const domain = data.connection && data.connection.domain ? data.connection.domain.toLowerCase() : "";
        const ispLower = ispName.toLowerCase();
        
        // ISP နာမည်များကို အတိအကျ ပြောင်းလဲခြင်း
        if (domain.includes('mytel') || ispLower.includes('telecom international')) {
            ispName = "Mytel";
        } else if (domain.includes('mpt') || ispLower.includes('myanma posts')) {
            ispName = "MPT";
        } else if (domain.includes('nine') || domain.includes('u9') || ispLower.includes('ooredoo')) {
            ispName = "U9";
        } else if (domain.includes('atom') || ispLower.includes('telenor')) {
            ispName = "ATOM";
        }

        const isMobile = ispLower.includes('mobile') || ispLower.includes('cell') || ispLower.includes('lte');
        
        // VPN စစ်ဆေးခြင်း (Myanmar မဟုတ်ရင် VPN လို့ ယူဆမယ်)
        const isVpn = data.country_code !== "MM";

        return { 
            name: ispName, 
            type: isMobile ? "Mobile Data" : "Wi-Fi",
            ip: data.ip || "Unknown",
            region: data.region || "Unknown",
            vpn: isVpn
        };
    } catch (e) { 
        return { name: "Offline", type: "Offline", ip: "None", region: "None", vpn: false }; 
    }
}

async function logData(location) {
    console.log(`\n[${new Date().toLocaleTimeString()}] Running test for: ${location}...`);
    
    const latency = getPing();
    const isOnline = latency !== null;
    const netDetails = isOnline ? await getNetworkDetails() : { name: "Offline", type: "Offline", ip: "None", region: "None", vpn: false };

    const newEntry = {
        timestamp: new Date().toISOString(),
        member_name: config.member_name,
        location_zone: location,
        
        // 🌐 Network & Routing Data 
        provider: netDetails.name,
        connection_type: netDetails.type,
        public_ip: netDetails.ip,
        routing_region: netDetails.region,
        is_vpn_active: netDetails.vpn,
        
        // 💻 Device Data
        os_platform: os.platform(), // 'win32' (Windows), 'linux' (Ubuntu), 'darwin' (Mac)
        
        // ⚡ Performance Data
        latency_ms: latency,
        status: isOnline ? "Connected" : "Timeout"
    };

    try {
        let data = [];
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf8');
            data = content ? JSON.parse(content) : [];
        }
        data.push(newEntry);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        
        const vpnTag = netDetails.vpn ? " [VPN Active 🌍]" : "";
        console.log(`✅ Logged: ${latency ? latency + 'ms' : 'Timeout'} | ${netDetails.name}${vpnTag}`);
    } catch (err) { console.error("❌ Error writing:", err.message); }
}

console.log("--- Net Tracker CLI (Advanced Mode) ---");
rl.question('Enter Current Location (e.g. Library, Dorm, Cafe): ', (location) => {
    const loc = location.trim() || "Unknown";
    console.log(`\nTracking started for: ${config.member_name} @ ${loc}`);
    console.log("Keep this terminal open! (Press Ctrl+C to stop)");
    
    logData(loc);
    setInterval(() => logData(loc), 480000); // 8 minutes
    rl.close();
});
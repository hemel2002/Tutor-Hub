const os = require('os');

const getWirelessIP = function getWirelessIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    // Adjusting for macOS (en0, en1, etc.)
    if (
      name.toLowerCase().includes('wlan') || // Linux
      name.toLowerCase().includes('wi-fi') || // Windows
      name.toLowerCase().startsWith('en') // macOS
    ) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost'; // Fallback to localhost if no wireless IP is found
};

module.exports = getWirelessIP;

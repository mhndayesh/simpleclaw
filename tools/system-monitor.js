import os from 'os';

console.log('=== REAL-TIME SYSTEM MONITOR ===');
console.log('Monitoring system resources (press Ctrl+C to stop):\n');

function formatBytes(bytes) {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
}

function monitorSystem() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usagePercent = (usedMem / totalMem * 100).toFixed(1);
    
    const loadavg = os.loadavg();
    
    console.clear();
    console.log('Memory Usage:');
    console.log(`Used: ${formatBytes(usedMem)} | Free: ${formatBytes(freeMem)} | Total: ${formatBytes(totalMem)}`);
    console.log(`Usage: ${usagePercent}%`);
    console.log('\nCPU Load Average (1, 5, 15 min):', loadavg.map(l => l.toFixed(2)).join(', '));
    console.log(`Uptime: ${Math.round(os.uptime() / 60)} minutes`);
    console.log('\nPress Ctrl+C to stop monitoring...');
}

// Run once immediately
monitorSystem();

// Optional: Set up interval for continuous monitoring (commented out to avoid spamming)
// setInterval(monitorSystem, 2000);
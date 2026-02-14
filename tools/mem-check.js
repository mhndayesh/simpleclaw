import os from "os";

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

export function getMemoryStats() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = ((used / total) * 100).toFixed(2);
    return {
        total,
        free,
        used,
        usagePercent: parseFloat(usagePercent),
        totalFormatted: formatBytes(total),
        freeFormatted: formatBytes(free),
        usedFormatted: formatBytes(used)
    };
}

export function printMemoryStats() {
    const stats = getMemoryStats();
    console.log("\n=== System Memory Usage ===");
    console.log("Total Memory : " + stats.totalFormatted + " (" + stats.total.toLocaleString() + " bytes)");
    console.log("Free Memory  : " + stats.freeFormatted + " (" + stats.free.toLocaleString() + " bytes)");
    console.log("Used Memory  : " + stats.usedFormatted + " (" + stats.used.toLocaleString() + " bytes)");
    console.log("Usage        : " + stats.usagePercent + "%");
    console.log("===========================\n");
    if (stats.usagePercent > 90) console.log("WARNING: Memory usage is critically high!");
    else if (stats.usagePercent > 75) console.log("Notice: Memory usage is elevated.");
}

printMemoryStats();

export default { getMemoryStats, printMemoryStats };

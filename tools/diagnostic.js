import os from 'os';

console.log('System Information:');
console.log('Platform:', os.platform());
console.log('Architecture:', os.arch());
console.log('CPU Cores:', os.cpus().length);
console.log('Total Memory:', Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB');
console.log('Free Memory:', Math.round(os.freemem() / 1024 / 1024 / 1024) + 'GB');
console.log('Uptime:', Math.round(os.uptime() / 60) + ' minutes');
console.log('Current User:', os.userInfo().username);
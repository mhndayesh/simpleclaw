import fs from 'fs';
import path from 'path';

console.log('=== FILE SYSTEM ANALYSIS ===');
console.log('Current directory:', process.cwd());

// Get file statistics for the current directory
try {
    const files = fs.readdirSync('.');
    console.log('\nFiles and directories in current location:');
    
    const fileStats = files.map(file => {
        const stats = fs.statSync(file);
        return {
            name: file,
            type: stats.isDirectory() ? 'DIR' : 'FILE',
            size: stats.isDirectory() ? 'N/A' : stats.size + ' bytes',
            modified: stats.mtime.toLocaleString()
        };
    });
    
    fileStats.forEach(item => {
        console.log(`${item.type.padEnd(4)} ${item.name.padEnd(25)} ${item.size.toString().padEnd(10)} ${item.modified}`);
    });
    
    const directories = fileStats.filter(item => item.type === 'DIR').length;
    const filesCount = fileStats.filter(item => item.type === 'FILE').length;
    
    console.log(`\nSummary: ${directories} directories, ${filesCount} files`);
    
} catch (error) {
    console.log('Error reading directory:', error.message);
}
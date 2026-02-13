const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function backupSystem() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup_${timestamp}`;
    
    console.log(`Creating backup directory: ${backupDir}`);
    fs.mkdirSync(backupDir);
    
    // Backup src directory
    console.log('Backing up src directory...');
    fs.cpSync('src', path.join(backupDir, 'src'), { recursive: true });
    
    // Backup storage directory
    console.log('Backing up storage directory...');
    fs.cpSync('storage', path.join(backupDir, 'storage'), { recursive: true });
    
    // Backup tools directory
    console.log('Backing up tools directory...');
    fs.cpSync('tools', path.join(backupDir, 'tools'), { recursive: true });
    
    // Backup markdown files
    console.log('Backing up documentation...');
    const files = fs.readdirSync('.').filter(f => f.endsWith('.md'));
    files.forEach(file => {
        fs.copyFileSync(file, path.join(backupDir, file));
    });
    
    // Backup package files
    console.log('Backing up configuration files...');
    const configFiles = fs.readdirSync('.').filter(f => f.startsWith('package') || f === 'tsconfig.json');
    configFiles.forEach(file => {
        fs.copyFileSync(file, path.join(backupDir, file));
    });
    
    console.log('\nBackup completed successfully!');
    console.log(`Backup location: ${backupDir}`);
    console.log('\nTo restore: copy the backup directory contents back to the project root.');
}

backupSystem();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PROGRAMS_PATH = 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs';

function getAllShortcuts(dir) {
    let results = [];
    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(getAllShortcuts(fullPath));
        } else if (item.endsWith('.lnk')) {
            results.push({
                name: path.parse(item).name,
                path: fullPath
            });
        }
    });

    return results;
}

function createShortcutTile(shortcut) {
    const tile = document.createElement('div');
    tile.className = 'icon-text-container';

    tile.innerHTML = `
    <div class="icon-text-container">
        <div class="icon"></div>
        <div class="text">${shortcut.name}</div>
    </div>
    `;

    tile.addEventListener('click', () => {
        exec(`start "" "${shortcut.path}"`, (error) => {
            if (error) {
                console.error('Error launching shortcut:', error);
            }
        });
    });

    tile.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        addAppTile(shortcut.name, shortcut.path);
    });

    return tile;
}

function displayShortcuts() {
    const grid = document.getElementById('shortcutsGrid');
    const shortcuts = getAllShortcuts(PROGRAMS_PATH);

    shortcuts.forEach(shortcut => {
        const tile = createShortcutTile(shortcut);
        grid.appendChild(tile);
    });
}

// Initialize the grid
displayShortcuts();
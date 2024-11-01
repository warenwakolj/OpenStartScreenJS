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

let currentContextMenu = null;

function createContextMenu(shortcut) {
    let contextMenu = document.getElementById('contextMenu');
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.id = 'contextMenu';
        contextMenu.className = 'context-menu';
        contextMenu.innerHTML = `
            <div class="context-menu-content">
                <button id="pinAppBtn" class="context-menu-btn">Pin to Start</button>
            </div>
        `;
        document.body.appendChild(contextMenu);

        contextMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        document.addEventListener('click', () => {
            hideContextMenu();
        });

        const pinBtn = document.getElementById('pinAppBtn');
        pinBtn.addEventListener('click', () => {
            addAppTile(currentContextMenu.shortcut.name, currentContextMenu.shortcut.path);
            hideContextMenu();
        });
    }

    return contextMenu;
}

function showContextMenu(shortcut, event) {
    const contextMenu = createContextMenu(shortcut);
    contextMenu.shortcut = shortcut;
    currentContextMenu = contextMenu;
    
    // Position and show the context menu
    contextMenu.style.bottom = '0';
    contextMenu.style.transform = 'translateY(0)';
    contextMenu.style.opacity = '1';
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu) {
        contextMenu.style.bottom = '-80px';
        contextMenu.style.transform = 'translateY(100%)';
        contextMenu.style.opacity = '0';
    }
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
        showContextMenu(shortcut, e);
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

displayShortcuts();
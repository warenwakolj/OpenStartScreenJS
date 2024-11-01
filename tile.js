let tileCount = 0;
let currentGrid;

function addAppTile(appName, appPath) {
    if (!currentGrid || currentGrid.children.length >= 8) {
        addGrid();
    }
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = appName;
    tile.draggable = true;
    tile.dataset.path = appPath;
    
    tile.addEventListener('click', () => {
        exec(`start "" "${appPath}"`, (error) => {
            if (error) {
                console.error('Error launching shortcut:', error);
            }
        });
    });
    
    addEventListeners(tile);
    currentGrid.appendChild(tile);
    document.getElementById("gridsContainer").scrollLeft = document.getElementById("gridsContainer").scrollWidth;

    saveTileLayout();
}

function saveTileLayout() {
    const grids = document.querySelectorAll('.grid');
    const layout = [];
    
    grids.forEach(grid => {
        const gridData = [];
        grid.querySelectorAll('.tile').forEach(tile => {
            gridData.push({
                name: tile.textContent,
                path: tile.dataset.path
            });
        });
        layout.push(gridData);
    });

    localStorage.setItem('tileLayout', JSON.stringify(layout));
}

function loadTileLayout() {
    const savedLayout = localStorage.getItem('tileLayout');
    if (savedLayout) {
        const layout = JSON.parse(savedLayout);
        const gridsContainer = document.getElementById('gridsContainer');
        gridsContainer.innerHTML = '';
        
        layout.forEach((gridData, index) => {
            const newGrid = document.createElement('div');
            newGrid.className = 'grid';
            newGrid.style.animationDelay = `${index * 0.1}s`;
            gridsContainer.appendChild(newGrid);

            gridData.forEach(tileData => {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.textContent = tileData.name;
                tile.draggable = true;
                tile.dataset.path = tileData.path;
                
                tile.addEventListener('click', () => {
                    exec(`start "" "${tileData.path}"`, (error) => {
                        if (error) {
                            console.error('Error launching shortcut:', error);
                        }
                    });
                });
                
                addEventListeners(tile);
                newGrid.appendChild(tile);
            });
        });

        currentGrid = gridsContainer.lastElementChild;
    } else {
        addGrid(); 
    }
}

function addGrid() {
    currentGrid = document.createElement("div");
    currentGrid.className = "grid";

    const existingGrids = document.querySelectorAll('.grid').length;
    currentGrid.style.animationDelay = `${existingGrids * 0.1}s`;
    
    document.getElementById("gridsContainer").appendChild(currentGrid);
}
function addEventListeners(tile) {
    tile.addEventListener("mousedown", handleMouseDown);
    tile.addEventListener("mouseup", handleMouseUp);
    tile.addEventListener("dragstart", handleDragStart);
    tile.addEventListener("dragover", handleDragOver);
    tile.addEventListener("drop", handleDrop);
    tile.addEventListener("dragend", handleDragEnd);
}

let draggedTile = null;
let pressTimeout;

function handleMouseDown(event) {
    const tile = event.target;
    pressTimeout = setTimeout(() => {
        tile.classList.add("pressed");
    }, 50);
}

function handleMouseUp(event) {
    clearTimeout(pressTimeout);
    event.target.classList.remove("pressed");
}

function handleDragStart(event) {
    draggedTile = event.target;
    event.dataTransfer.effectAllowed = "move";
    draggedTile.classList.add("dragging");
    document.querySelectorAll(".tile").forEach(tile => {
        if (tile !== draggedTile) {
            tile.classList.add("shrink");
        }
    });
    setTimeout(() => {
        draggedTile.style.visibility = "hidden";
    }, 0);
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

function handleDrop(event) {
    event.preventDefault();
    if (event.target.className.includes("tile") && event.target !== draggedTile) {
        let tempContent = event.target.textContent;
        let tempPath = event.target.dataset.path;
        
        event.target.textContent = draggedTile.textContent;
        event.target.dataset.path = draggedTile.dataset.path;
        
        draggedTile.textContent = tempContent;
        draggedTile.dataset.path = tempPath;

        saveTileLayout();
    }
}

function handleDragEnd(event) {
    if (draggedTile) {
        draggedTile.style.visibility = "visible";
        draggedTile.classList.remove("dragging");
    }

    document.querySelectorAll(".tile").forEach(tile => {
        tile.classList.remove("shrink");
        tile.classList.remove("pressed"); 
    });
    draggedTile = null;
}

document.addEventListener('DOMContentLoaded', () => {
    loadTileLayout();
});

document.querySelector('.grids-container').addEventListener('scroll', function(e) {
    const scrollPosition = e.target.scrollLeft;
    const firstPage = document.querySelector('.page:nth-child(1)');
    firstPage.style.backgroundPosition = `${-scrollPosition * 0.2}px center`;
});
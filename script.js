// Logic Grid Puzzle Helper - Main JavaScript
class LogicGridHelper {
    constructor() {
        this.gridSize = 4;
        this.categories = [];
        this.categoryItems = {}; // Store actual item names for each category
        this.clues = [];
        this.gridData = {};
        
        this.initializeEventListeners();
        
        // Initialize slider fill effect
        this.initializeSliderFill();
    }
    
    initializeEventListeners() {
        // Grid setup - first step
        document.getElementById('create-grid').addEventListener('click', () => {
            this.setupCategories();
        });
        
        // Grid generation - second step
        document.getElementById('generate-grid').addEventListener('click', () => {
            this.createGrid();
        });
        
        // Grid size change
        document.getElementById('grid-size').addEventListener('input', (e) => {
            this.gridSize = parseInt(e.target.value);
            // Update the display values
            document.getElementById('grid-size-value').textContent = this.gridSize;
            document.getElementById('grid-size-value-2').textContent = this.gridSize;
            
            // Update slider fill effect
            const slider = e.target;
            const min = parseInt(slider.min);
            const max = parseInt(slider.max);
            const value = parseInt(slider.value);
            const percentage = ((value - min) / (max - min)) * 100;
            
            slider.style.background = `linear-gradient(to right, #1e3a8a 0%, #1e3a8a ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
        });
        
        // Add clue functionality
        document.getElementById('add-clue').addEventListener('click', () => {
            this.addClue();
        });
        
        // Tool buttons
        document.getElementById('clear-grid').addEventListener('click', () => {
            this.clearGrid();
        });
        
        document.getElementById('save-progress').addEventListener('click', () => {
            this.saveProgress();
        });
        
        document.getElementById('load-progress').addEventListener('click', () => {
            this.loadProgress();
        });
        
        document.getElementById('export-grid').addEventListener('click', () => {
            this.exportGrid();
        });
    }
    
    setupCategories() {
        const categoriesInput = document.getElementById('categories').value;
        if (!categoriesInput.trim()) {
            alert('Please enter categories for your puzzle (e.g., Owners, Breeds, Colors)');
            return;
        }
        
        this.categories = categoriesInput.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);
        
        if (this.categories.length < 2) {
            alert('Please enter at least 2 categories separated by commas');
            return;
        }
        
        if (this.categories.length > 6) {
            alert('Maximum 6 categories are supported for optimal display');
            return;
        }
        
        this.showItemsSetup();
    }
    
    showItemsSetup() {
        const itemsSetup = document.getElementById('items-setup');
        const itemsContainer = document.getElementById('items-container');
        
        itemsContainer.innerHTML = '';
        
        this.categories.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-items';
            categoryDiv.innerHTML = `
                <h4>${category}</h4>
                <div class="items-inputs">
                    ${Array.from({length: this.gridSize}, (_, i) => `
                        <input type="text" class="item-input" data-category="${index}" data-index="${i}" 
                               placeholder="${category} ${i + 1}" />
                    `).join('')}
                </div>
            `;
            itemsContainer.appendChild(categoryDiv);
        });
        
        itemsSetup.style.display = 'block';
    }
    
    createGrid() {
        // Collect all item inputs
        this.categoryItems = {};
        let allFieldsFilled = true;
        
        this.categories.forEach((category, catIndex) => {
            this.categoryItems[catIndex] = [];
            const inputs = document.querySelectorAll(`[data-category="${catIndex}"]`);
            
            inputs.forEach((input, itemIndex) => {
                const value = input.value.trim();
                if (!value) {
                    allFieldsFilled = false;
                    return;
                }
                this.categoryItems[catIndex][itemIndex] = value;
            });
        });
        
        if (!allFieldsFilled) {
            alert('Please fill in all item names for each category');
            return;
        }
        
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = this.generateGridHTML();
        
        this.attachGridEventListeners();
        
        // Hide items setup
        document.getElementById('items-setup').style.display = 'none';
    }
    
    generateGridHTML() {
        const size = this.gridSize;
        const numCategories = this.categories.length;
        let html = '<div class="logic-grid">';
        
        // Calculate column and row categories based on the algorithm
        // Columns: first cat + cats 3,4,5... (skip cat 2)
        const columnCats = [0]; // Start with first category
        for (let i = 2; i < numCategories; i++) {
            columnCats.push(i);
        }
        
        // Rows: second cat + reverse of columns (excluding first cat)
        const rowCats = [1]; // Start with second category
        const reversedCols = [...columnCats.slice(1)].reverse(); // Get cats 3,4,5... and reverse
        rowCats.push(...reversedCols);
        
        // Create N×N grid structure
        html += '<table class="unified-grid-table">';
        
        // Generate category headers (top row)
        html += '<tr class="main-category-header">';
        html += '<th class="corner-cell"></th>';
        html += '<th class="corner-cell"></th>';
        for (let colIdx = 0; colIdx < columnCats.length; colIdx++) {
            const cat = columnCats[colIdx];
            html += `<th class="main-category-name" colspan="${size}">${this.categories[cat]}</th>`;
        }
        html += '</tr>';
        
        // Generate item headers (second row)
        html += '<tr class="main-item-header">';
        html += '<th class="corner-cell"></th>';
        html += '<th class="corner-cell"></th>';
        for (let colIdx = 0; colIdx < columnCats.length; colIdx++) {
            const cat = columnCats[colIdx];
            for (let item = 0; item < size; item++) {
                const itemName = this.categoryItems[cat] ? this.categoryItems[cat][item] : `${this.categories[cat]} ${item + 1}`;
                html += `<th class="main-item-name">${itemName}</th>`;
            }
        }
        html += '</tr>';
        
        // Generate data rows (N-1 rows following the algorithm)
        for (let rowIdx = 0; rowIdx < rowCats.length; rowIdx++) {
            const rowCat = rowCats[rowIdx];
            
            for (let rowItem = 0; rowItem < size; rowItem++) {
                html += '<tr>';
                
                // Row category header (only for first item of each category)
                if (rowItem === 0) {
                    html += `<th class="row-main-category" rowspan="${size}">${this.categories[rowCat]}</th>`;
                }
                
                // Row item header
                const rowItemName = this.categoryItems[rowCat] ? this.categoryItems[rowCat][rowItem] : `${this.categories[rowCat]} ${rowItem + 1}`;
                html += `<th class="row-main-item">${rowItemName}</th>`;
                
                // Generate cells for each column category
                for (let colIdx = 0; colIdx < columnCats.length; colIdx++) {
                    const colCat = columnCats[colIdx];
                    
                    for (let colItem = 0; colItem < size; colItem++) {
                        
                        // Compare row position vs column position in the generated grid
                        // Upper left triangle including diagonal (rowIdx <= colIdx)
                        if (rowIdx + colIdx <= numCategories - 2) {
                            const catA = colCat;
                            const catB = rowCat;
                            
                            html += `<td class="grid-cell" data-cat-a="${catA}" data-cat-b="${catB}" data-row="${colItem}" data-col="${rowItem}">
                                <div class="cell-content">
                                    <button class="cell-btn unknown" data-state="unknown">?</button>
                                </div>
                            </td>`;
                        } else {
                            html += `<td class="blocked-cell">(${rowIdx},${colIdx})</td>`;
                        }
                    }
                }
                html += '</tr>';
            }
        }
        
        html += '</table>';
        
        // Legend
        html += '<div class="grid-legend">';
        html += '<h3>Legend:</h3>';
        html += '<div class="legend-items">';
        html += '<div class="legend-item"><span class="legend-color unknown"></span> Unknown</div>';
        html += '<div class="legend-item"><span class="legend-color yes"></span> Yes</div>';
        html += '<div class="legend-item"><span class="legend-color no"></span> No</div>';
        html += '<div class="legend-item"><span class="legend-color blocked"></span> Same Category</div>';
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        
        return html;
    }
    
    generateSingleGridHTML(catAIndex, catBIndex, size) {
        const catA = this.categories[catAIndex];
        const catB = this.categories[catBIndex];
        
        let html = `<div class="single-grid" data-cat-a="${catAIndex}" data-cat-b="${catBIndex}">`;
        html += `<h4 class="grid-title">${catA} vs ${catB}</h4>`;
        
        // Create grid table
        html += '<table class="grid-table">';
        
        // Header row
        html += '<tr class="grid-header">';
        html += '<th class="corner-cell"></th>';
        for (let i = 0; i < size; i++) {
            const itemName = this.categoryItems[catAIndex] ? this.categoryItems[catAIndex][i] : `${catA} ${i + 1}`;
            html += `<th class="header-cell">${itemName}</th>`;
        }
        html += '</tr>';
        
        // Data rows
        for (let i = 0; i < size; i++) {
            html += '<tr>';
            const itemName = this.categoryItems[catBIndex] ? this.categoryItems[catBIndex][i] : `${catB} ${i + 1}`;
            html += `<th class="row-header">${itemName}</th>`;
            for (let j = 0; j < size; j++) {
                html += `<td class="grid-cell" data-cat-a="${catAIndex}" data-cat-b="${catBIndex}" data-row="${i}" data-col="${j}">
                    <div class="cell-content">
                        <button class="cell-btn unknown" data-state="unknown">?</button>
                    </div>
                </td>`;
            }
            html += '</tr>';
        }
        
        html += '</table>';
        html += '</div>';
        
        return html;
    }
    
    attachGridEventListeners() {
        const cellButtons = document.querySelectorAll('.cell-btn');
        cellButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Only allow left-click if not currently a cross
                if (btn.dataset.state !== 'no') {
                    this.setCell(btn, 'yes');
                }
            });
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                // If currently a cross, right click returns to unknown
                if (btn.dataset.state === 'no') {
                    this.setCell(btn, 'unknown');
                } else {
                    this.setCell(btn, 'no');
                }
            });
        });
    }
    
    setCell(button, newState) {
        // Set cell state and update UI
        switch (newState) {
            case 'yes':
                button.textContent = '✓';
                button.className = 'cell-btn yes';
                break;
            case 'no':
                button.textContent = '✗';
                button.className = 'cell-btn no';
                break;
            default:
                button.textContent = '?';
                button.className = 'cell-btn unknown';
                newState = 'unknown';
                break;
        }
        button.dataset.state = newState;

        // Save grid state
        const cell = button.closest('.grid-cell');
        const catA = cell.dataset.catA;
        const catB = cell.dataset.catB;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        const gridKey = `${catA}-${catB}`;
        if (!this.gridData[gridKey]) this.gridData[gridKey] = {};
        if (!this.gridData[gridKey][row]) this.gridData[gridKey][row] = {};
        this.gridData[gridKey][row][col] = newState;

        // If set to ✓, cross all other cells in same row and col
        if (newState === 'yes') {
            this.crossRowCol(catA, catB, row, col);
        }
    }

    crossRowCol(catA, catB, row, col) {
        // Cross all other cells in the same row and column for this grid
        const gridKey = `${catA}-${catB}`;
        // Cross row
        for (let c = 0; c < this.gridSize; c++) {
            if (c != col) {
                const cell = document.querySelector(`.grid-cell[data-cat-a="${catA}"][data-cat-b="${catB}"][data-row="${row}"][data-col="${c}"] .cell-btn`);
                if (cell && cell.dataset.state !== 'yes') {
                    this.setCell(cell, 'no');
                }
            }
        }
        // Cross column
        for (let r = 0; r < this.gridSize; r++) {
            if (r != row) {
                const cell = document.querySelector(`.grid-cell[data-cat-a="${catA}"][data-cat-b="${catB}"][data-row="${r}"][data-col="${col}"] .cell-btn`);
                if (cell && cell.dataset.state !== 'yes') {
                    this.setCell(cell, 'no');
                }
            }
        }
    }
    
    toggleCell(button) {
        const currentState = button.dataset.state;
        let newState;
        
        switch (currentState) {
            case 'unknown':
                newState = 'yes';
                button.textContent = '✓';
                button.className = 'cell-btn yes';
                break;
            case 'yes':
                newState = 'no';
                button.textContent = '✗';
                button.className = 'cell-btn no';
                break;
            case 'no':
                newState = 'unknown';
                button.textContent = '?';
                button.className = 'cell-btn unknown';
                break;
        }
        
        button.dataset.state = newState;
        
        // Save grid state
        const cell = button.closest('.grid-cell');
        const catA = cell.dataset.catA;
        const catB = cell.dataset.catB;
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        
        const gridKey = `${catA}-${catB}`;
        if (!this.gridData[gridKey]) {
            this.gridData[gridKey] = {};
        }
        if (!this.gridData[gridKey][row]) {
            this.gridData[gridKey][row] = {};
        }
        this.gridData[gridKey][row][col] = newState;
    }
    
    addClue() {
        const clueText = prompt('Enter your clue:');
        if (clueText && clueText.trim()) {
            this.clues.push(clueText.trim());
            this.updateCluesDisplay();
        }
    }
    
    updateCluesDisplay() {
        const cluesContainer = document.getElementById('clues-container');
        
        if (this.clues.length === 0) {
            cluesContainer.innerHTML = '<div class="clue-placeholder"><p>Add your puzzle clues here to keep track of them</p></div>';
            return;
        }
        
        let html = '';
        this.clues.forEach((clue, index) => {
            html += `<div class="clue-item">
                <div class="clue-text">${clue}</div>
                <button class="delete-clue" data-index="${index}">×</button>
            </div>`;
        });
        
        cluesContainer.innerHTML = html;
        
        // Attach delete listeners
        document.querySelectorAll('.delete-clue').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.clues.splice(index, 1);
                this.updateCluesDisplay();
            });
        });
    }
    
    clearGrid() {
        if (confirm('Are you sure you want to clear the grid? This will remove all progress.')) {
            this.gridData = {};
            this.categoryItems = {};
            const gridContainer = document.getElementById('grid-container');
            gridContainer.innerHTML = `
                <div class="grid-placeholder">
                    <div class="placeholder-icon">🧩</div>
                    <p>Click "Setup Categories" to start creating your logic puzzle</p>
                </div>
            `;
            document.getElementById('categories').value = '';
            document.getElementById('items-setup').style.display = 'none';
            this.clues = [];
            this.updateCluesDisplay();
        }
    }
    
    saveProgress() {
        const saveData = {
            gridSize: this.gridSize,
            categories: this.categories,
            categoryItems: this.categoryItems,
            clues: this.clues,
            gridData: this.gridData,
            timestamp: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(saveData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `logic-puzzle-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    loadProgress() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        this.gridSize = data.gridSize;
                        this.categories = data.categories;
                        this.categoryItems = data.categoryItems || {};
                        this.clues = data.clues;
                        this.gridData = data.gridData;
                        
                        // Update UI
                        document.getElementById('grid-size').value = this.gridSize;
                        document.getElementById('categories').value = this.categories.join(', ');
                        document.getElementById('items-setup').style.display = 'none';
                        
                        this.createGrid();
                        this.restoreGridState();
                        this.updateCluesDisplay();
                        
                        alert('Progress loaded successfully!');
                    } catch (error) {
                        alert('Error loading file. Please make sure it\'s a valid save file.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }
    
    restoreGridState() {
        // Restore the state of all grid cells
        Object.keys(this.gridData).forEach(gridKey => {
            const gridData = this.gridData[gridKey];
            Object.keys(gridData).forEach(row => {
                Object.keys(gridData[row]).forEach(col => {
                    const state = gridData[row][col];
                    const [catA, catB] = gridKey.split('-');
                    const cell = document.querySelector(`[data-cat-a="${catA}"][data-cat-b="${catB}"][data-row="${row}"][data-col="${col}"]`);
                    if (cell) {
                        const button = cell.querySelector('.cell-btn');
                        if (button) {
                            button.dataset.state = state;
                            button.className = `cell-btn ${state}`;
                            switch (state) {
                                case 'yes': button.textContent = '✓'; break;
                                case 'no': button.textContent = '✗'; break;
                                default: button.textContent = '?'; break;
                            }
                        }
                    }
                });
            });
        });
    }
    
    exportGrid() {
        if (!this.categories.length) {
            alert('Please create a grid first before exporting.');
            return;
        }
        
        let exportText = `Logic Grid Puzzle - ${new Date().toLocaleDateString()}\n`;
        exportText += `Grid Size: ${this.gridSize}x${this.gridSize}\n`;
        exportText += `Categories: ${this.categories.join(', ')}\n`;
        exportText += `Number of Category Pairs: ${this.categories.length * (this.categories.length - 1) / 2}\n\n`;
        
        // Export category items
        exportText += 'Category Items:\n';
        this.categories.forEach((category, index) => {
            exportText += `${category}: `;
            if (this.categoryItems[index]) {
                exportText += this.categoryItems[index].join(', ');
            } else {
                exportText += Array.from({length: this.gridSize}, (_, i) => `${category} ${i + 1}`).join(', ');
            }
            exportText += '\n';
        });
        exportText += '\n';
        
        exportText += 'Clues:\n';
        this.clues.forEach((clue, index) => {
            exportText += `${index + 1}. ${clue}\n`;
        });
        
        exportText += '\nGrid States:\n';
        for (let catA = 0; catA < this.categories.length; catA++) {
            for (let catB = catA + 1; catB < this.categories.length; catB++) {
                exportText += `\n${this.categories[catA]} vs ${this.categories[catB]}:\n`;
                
                // Header row
                exportText += '        ';
                for (let j = 0; j < this.gridSize; j++) {
                    const itemName = this.categoryItems[catA] ? this.categoryItems[catA][j] : `${this.categories[catA]} ${j + 1}`;
                    exportText += `${itemName.padEnd(12)} `;
                }
                exportText += '\n';
                
                const gridKey = `${catA}-${catB}`;
                for (let i = 0; i < this.gridSize; i++) {
                    const rowItemName = this.categoryItems[catB] ? this.categoryItems[catB][i] : `${this.categories[catB]} ${i + 1}`;
                    exportText += `${rowItemName.padEnd(8)} `;
                    
                    for (let j = 0; j < this.gridSize; j++) {
                        const state = this.gridData[gridKey] && this.gridData[gridKey][i] && this.gridData[gridKey][i][j] || 'unknown';
                        let symbol;
                        switch (state) {
                            case 'yes': symbol = '✓'; break;
                            case 'no': symbol = '✗'; break;
                            default: symbol = '?'; break;
                        }
                        exportText += `${symbol.padEnd(12)} `;
                    }
                    exportText += '\n';
                }
            }
        }
        
        const textBlob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(textBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `logic-puzzle-export-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    initializeSliderFill() {
        const slider = document.getElementById('grid-size');
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const value = parseInt(slider.value);
        const percentage = ((value - min) / (max - min)) * 100;
        
        slider.style.background = `linear-gradient(to right, #1e3a8a 0%, #1e3a8a ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LogicGridHelper();
});

// Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
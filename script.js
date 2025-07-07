// Logic Grid Puzzle Helper - Main JavaScript
class LogicGridHelper {
    constructor() {
        this.gridSize = 4;
        this.categories = [];
        this.clues = [];
        this.gridData = {};
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Grid creation
        document.getElementById('create-grid').addEventListener('click', () => {
            this.createGrid();
        });
        
        // Grid size change
        document.getElementById('grid-size').addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
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
    
    createGrid() {
        const categoriesInput = document.getElementById('categories').value;
        if (!categoriesInput.trim()) {
            alert('Please enter categories for your puzzle (e.g., Names, Ages, Colors)');
            return;
        }
        
        this.categories = categoriesInput.split(',').map(cat => cat.trim());
        
        if (this.categories.length < 2) {
            alert('Please enter at least 2 categories separated by commas');
            return;
        }
        
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = this.generateGridHTML();
        
        this.attachGridEventListeners();
    }
    
    generateGridHTML() {
        const size = this.gridSize;
        let html = '<div class="logic-grid">';
        
        // Create grid table
        html += '<table class="grid-table">';
        
        // Header row
        html += '<tr class="grid-header">';
        html += '<th class="corner-cell"></th>';
        for (let i = 0; i < size; i++) {
            html += `<th class="header-cell">${this.categories[0]} ${i + 1}</th>`;
        }
        html += '</tr>';
        
        // Data rows
        for (let i = 0; i < size; i++) {
            html += '<tr>';
            html += `<th class="row-header">${this.categories[1] || 'Category'} ${i + 1}</th>`;
            for (let j = 0; j < size; j++) {
                html += `<td class="grid-cell" data-row="${i}" data-col="${j}">
                    <div class="cell-content">
                        <button class="cell-btn unknown" data-state="unknown">?</button>
                    </div>
                </td>`;
            }
            html += '</tr>';
        }
        
        html += '</table>';
        
        // Legend
        html += '<div class="grid-legend">';
        html += '<h3>Legend:</h3>';
        html += '<div class="legend-items">';
        html += '<div class="legend-item"><span class="legend-color unknown"></span> Unknown</div>';
        html += '<div class="legend-item"><span class="legend-color yes"></span> Yes</div>';
        html += '<div class="legend-item"><span class="legend-color no"></span> No</div>';
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        
        return html;
    }
    
    attachGridEventListeners() {
        const cellButtons = document.querySelectorAll('.cell-btn');
        cellButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleCell(e.target);
            });
        });
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
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        
        if (!this.gridData[row]) {
            this.gridData[row] = {};
        }
        this.gridData[row][col] = newState;
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
            const gridContainer = document.getElementById('grid-container');
            gridContainer.innerHTML = `
                <div class="grid-placeholder">
                    <div class="placeholder-icon">🧩</div>
                    <p>Click "Create New Grid" to start solving your logic puzzle</p>
                </div>
            `;
            document.getElementById('categories').value = '';
            this.clues = [];
            this.updateCluesDisplay();
        }
    }
    
    saveProgress() {
        const saveData = {
            gridSize: this.gridSize,
            categories: this.categories,
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
                        this.clues = data.clues;
                        this.gridData = data.gridData;
                        
                        // Update UI
                        document.getElementById('grid-size').value = this.gridSize;
                        document.getElementById('categories').value = this.categories.join(', ');
                        
                        this.createGrid();
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
    
    exportGrid() {
        if (!this.categories.length) {
            alert('Please create a grid first before exporting.');
            return;
        }
        
        let exportText = `Logic Grid Puzzle - ${new Date().toLocaleDateString()}\n`;
        exportText += `Grid Size: ${this.gridSize}x${this.gridSize}\n`;
        exportText += `Categories: ${this.categories.join(', ')}\n\n`;
        
        exportText += 'Clues:\n';
        this.clues.forEach((clue, index) => {
            exportText += `${index + 1}. ${clue}\n`;
        });
        
        exportText += '\nGrid State:\n';
        for (let i = 0; i < this.gridSize; i++) {
            let row = '';
            for (let j = 0; j < this.gridSize; j++) {
                const state = this.gridData[i] && this.gridData[i][j] || 'unknown';
                switch (state) {
                    case 'yes': row += '✓ '; break;
                    case 'no': row += '✗ '; break;
                    default: row += '? '; break;
                }
            }
            exportText += row + '\n';
        }
        
        const textBlob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(textBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `logic-puzzle-export-${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        
        URL.revokeObjectURL(url);
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
let selectedElement = null;
let itemCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized.');

    // Handle delete key (if not editing an input)
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            deleteSelected();
        }
    });

    // Deselect when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.draggable-item') && !e.target.closest('aside')) {
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
                updateEditorPanel();
            }
        }
    });

    // Editor inputs event listeners
    document.getElementById('edit-name').addEventListener('input', (e) => {
        if (selectedElement) selectedElement.innerText = e.target.value;
    });
    document.getElementById('edit-color').addEventListener('input', (e) => {
        if (selectedElement) selectedElement.style.backgroundColor = e.target.value;
    });
    document.getElementById('edit-width').addEventListener('input', (e) => {
        if (selectedElement) selectedElement.style.width = e.target.value;
    });
    document.getElementById('edit-height').addEventListener('input', (e) => {
        if (selectedElement) selectedElement.style.height = e.target.value;
    });
    document.getElementById('edit-shape').addEventListener('change', (e) => {
        if (selectedElement) selectedElement.style.borderRadius = e.target.value;
    });
    document.getElementById('edit-rotation').addEventListener('input', (e) => {
        if (selectedElement) {
            selectedElement.dataset.rotation = e.target.value;
            selectedElement.style.transform = `rotate(${e.target.value}deg)`;
        }
    });
    document.getElementById('edit-bg-image').addEventListener('input', (e) => {
        if (selectedElement) {
            const val = e.target.value.trim();
            if (val) {
                selectedElement.style.backgroundImage = `url('${val}')`;
                selectedElement.style.backgroundSize = 'cover';
                selectedElement.style.backgroundPosition = 'center';
            } else {
                selectedElement.style.backgroundImage = '';
            }
        }
    });
});

window.addFurniture = (name, color, width, height, shape, extraClass = '') => {
    const container = document.getElementById('plan-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `draggable-item ${extraClass}`;
    el.innerText = name;
    el.id = `item-${itemCounter++}`;

    // Styles
    el.style.backgroundColor = color;
    el.style.width = width;
    el.style.height = height;
    el.style.borderRadius = shape;
    el.dataset.rotation = "0";

    // Initial position in center
    el.style.left = '45%';
    el.style.top = '45%';

    container.appendChild(el);
    makeDraggable(el);
    selectElement(el);
};

window.addEraser = () => {
    // A mask/eraser is basically a white rectangle with no border that blends into the bg
    addFurniture('', '#ffffff', '10%', '10%', '0px', 'eraser-mask');
};

window.deleteSelected = () => {
    if (selectedElement) {
        selectedElement.remove();
        selectedElement = null;
        updateEditorPanel();
    }
};

window.clearProject = () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie obiekty z planu?')) {
        const container = document.getElementById('plan-container');
        const items = container.querySelectorAll('.draggable-item');
        items.forEach(item => item.remove());
        selectedElement = null;
        updateEditorPanel();
    }
};

window.saveProject = () => {
    const container = document.getElementById('plan-container');
    const items = container.querySelectorAll('.draggable-item');
    const projectData = [];

    items.forEach(item => {
        projectData.push({
            id: item.id,
            text: item.innerText,
            className: item.className,
            left: item.style.left,
            top: item.style.top,
            width: item.style.width,
            height: item.style.height,
            backgroundColor: item.style.backgroundColor,
            borderRadius: item.style.borderRadius,
            backgroundImage: item.style.backgroundImage,
            rotation: item.dataset.rotation || "0"
        });
    });

    localStorage.setItem('planManagerProject', JSON.stringify(projectData));
    alert('Projekt został zapisany!');
};

window.loadProject = () => {
    const data = localStorage.getItem('planManagerProject');
    if (!data) {
        alert('Brak zapisanego projektu.');
        return;
    }

    const projectData = JSON.parse(data);
    const container = document.getElementById('plan-container');

    // Clear current items
    const items = container.querySelectorAll('.draggable-item');
    items.forEach(item => item.remove());
    selectedElement = null;
    updateEditorPanel();

    let maxId = 0;

    projectData.forEach(itemData => {
        const el = document.createElement('div');
        el.className = itemData.className.replace('selected', '').trim();
        el.innerText = itemData.text;
        el.id = itemData.id;

        el.style.left = itemData.left;
        el.style.top = itemData.top;
        el.style.width = itemData.width;
        el.style.height = itemData.height;
        el.style.backgroundColor = itemData.backgroundColor;
        el.style.borderRadius = itemData.borderRadius;
        el.style.backgroundImage = itemData.backgroundImage || '';
        if (el.style.backgroundImage) {
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
        }

        el.dataset.rotation = itemData.rotation;
        el.style.transform = `rotate(${itemData.rotation}deg)`;

        container.appendChild(el);
        makeDraggable(el);

        // Update maxId so new items don't collide
        const idNum = parseInt(itemData.id.replace('item-', ''));
        if (!isNaN(idNum) && idNum >= maxId) {
            maxId = idNum + 1;
        }
    });

    itemCounter = maxId;
    alert('Projekt został wczytany!');
};

// Convert rgb to hex for color input
function rgbToHex(rgb) {
    if (!rgb) return '#ffffff';
    if (rgb.startsWith('#')) return rgb;
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#ffffff';
    return "#" + (1 << 24 | parseInt(match[1]) << 16 | parseInt(match[2]) << 8 | parseInt(match[3])).toString(16).slice(1);
}

// Extract URL from backgroundImage string
function extractUrl(bgImage) {
    if (!bgImage || bgImage === 'none') return '';
    const match = bgImage.match(/^url\(['"]?(.*?)['"]?\)$/);
    return match ? match[1] : '';
}

function updateEditorPanel() {
    const panel = document.getElementById('editor-panel');
    if (!selectedElement) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');
    document.getElementById('edit-name').value = selectedElement.innerText;
    document.getElementById('edit-color').value = rgbToHex(selectedElement.style.backgroundColor);
    document.getElementById('edit-width').value = selectedElement.style.width;
    document.getElementById('edit-height').value = selectedElement.style.height;
    document.getElementById('edit-shape').value = selectedElement.style.borderRadius;
    document.getElementById('edit-rotation').value = selectedElement.dataset.rotation || "0";
    document.getElementById('edit-bg-image').value = extractUrl(selectedElement.style.backgroundImage);
}

function selectElement(el) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedElement = el;
    el.classList.add('selected');
    updateEditorPanel();
}

function makeDraggable(element) {
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, initialLeft, initialTop;

    element.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent deselecting
        selectElement(element);

        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        startY = e.clientY;

        const style = window.getComputedStyle(element);
        initialLeft = parseFloat(style.left);
        initialTop = parseFloat(style.top);

        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        // If the mouse has moved at least a bit, flag it
        if (Math.abs(e.clientX - startX) > 2 || Math.abs(e.clientY - startY) > 2) {
            hasMoved = true;
        }

        if (!hasMoved) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const parent = element.parentElement;
        if (parent) {
            const parentRect = parent.getBoundingClientRect();
            const elemRect = element.getBoundingClientRect();

            if (newLeft < 0) newLeft = 0;
            if (newTop < 0) newTop = 0;
            if (newLeft + elemRect.width > parentRect.width) {
                newLeft = parentRect.width - elemRect.width;
            }
            if (newTop + elemRect.height > parentRect.height) {
                newTop = parentRect.height - elemRect.height;
            }
        }

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';

            if (hasMoved) {
                const parent = element.parentElement;
                if (parent) {
                    const parentRect = parent.getBoundingClientRect();
                    const currentLeft = parseFloat(element.style.left);
                    const currentTop = parseFloat(element.style.top);

                    // Only convert back to percentages if it was moved (meaning it's currently in px)
                    if (element.style.left.includes('px')) {
                        element.style.left = `${(currentLeft / parentRect.width) * 100}%`;
                        element.style.top = `${(currentTop / parentRect.height) * 100}%`;
                    }
                }
            }
        }
    });
}

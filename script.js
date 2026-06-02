let selectedElement = null;
let itemCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized.');

    // Handle delete key
    document.addEventListener('keydown', (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
            selectedElement.remove();
            selectedElement = null;
        }
    });

    // Deselect when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.draggable-item') && !e.target.closest('button')) {
            if (selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
            }
        }
    });
});

window.addFurniture = (name, styleClass) => {
    const container = document.getElementById('plan-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `draggable-item ${styleClass}`;
    el.innerText = name;
    el.id = `item-${itemCounter++}`;

    // Initial position in center
    el.style.left = '45%';
    el.style.top = '45%';

    container.appendChild(el);
    makeDraggable(el);
    selectElement(el);
};

function selectElement(el) {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedElement = el;
    el.classList.add('selected');
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

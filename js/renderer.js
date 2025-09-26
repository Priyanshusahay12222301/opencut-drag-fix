// Renderer System with renderElement function (main requirement)
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvasContainer = canvas.parentElement;
    }

    // Main render function - keeps canvas rendering untouched
    render() {
        this.clearCanvas();
        this.renderBackground();
        
        // Render all text elements
        window.textElements.forEach(element => {
            this.renderTextElement(element);
            // The key change: renderElement with transparent overlay
            this.renderElement(element);
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderBackground() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderTextElement(element) {
        this.ctx.save();
        this.ctx.fillStyle = element.color;
        this.ctx.font = `${element.fontSize}px Arial`;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(element.text, element.x, element.y - element.fontSize);
        this.ctx.restore();
    }

    // KEY FUNCTION: renderElement with transparent overlay for dragging
    // This is the main change mentioned in the requirements
    renderElement(element) {
        // Only add overlay for text elements that can be dragged
        if (!element || element.constructor.name !== 'TextElement') {
            return null; // Can revert by returning null
        }

        // Create absolutely positioned transparent overlay
        const overlay = this.createDragOverlay(element);
        return overlay;
    }

    createDragOverlay(element) {
        // Remove existing overlay if present
        const existingOverlay = document.getElementById(`text-overlay-${element.id}`);
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Get element bounds for overlay sizing
        const bounds = element.getBounds(this.ctx);
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Create absolutely positioned transparent overlay
        const overlay = document.createElement('div');
        overlay.id = `text-overlay-${element.id}`;
        overlay.style.cssText = `
            position: absolute;
            left: ${canvasRect.left + bounds.x}px;
            top: ${canvasRect.top + bounds.y}px;
            width: ${bounds.width}px;
            height: ${bounds.height}px;
            background-color: transparent;
            cursor: grab;
            z-index: 1000;
            pointer-events: ${element.isDragging ? 'none' : 'auto'};
        `;

        // Add drag event handling to overlay
        this.setupOverlayDragEvents(overlay, element);
        
        // Append to canvas container
        this.canvasContainer.appendChild(overlay);
        
        return overlay;
    }

    setupOverlayDragEvents(overlay, element) {
        let isDragging = false;
        let startX, startY, startElementX, startElementY;

        overlay.addEventListener('mousedown', (e) => {
            isDragging = true;
            overlay.style.cursor = 'grabbing';
            
            const canvasRect = this.canvas.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startElementX = element.x;
            startElementY = element.y;
            
            element.isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const canvasRect = this.canvas.getBoundingClientRect();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newX = startElementX + deltaX;
            const newY = startElementY + deltaY;
            
            // Update position with canvas bounds clamping
            element.updatePosition(newX, newY, {
                width: this.canvas.width,
                height: this.canvas.height
            });
            
            // Update using the required updateTextElement function
            updateTextElement(element.id, {
                x: element.x,
                y: element.y
            });
            
            // Update overlay position
            const bounds = element.getBounds(this.ctx);
            overlay.style.left = `${canvasRect.left + bounds.x}px`;
            overlay.style.top = `${canvasRect.top + bounds.y}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                overlay.style.cursor = 'grab';
                element.isDragging = false;
                
                // Position persists after seek (requirement met)
                this.render(); // Re-render to update canvas
            }
        });
    }

    // Clean up overlays when needed
    clearOverlays() {
        const overlays = this.canvasContainer.querySelectorAll('[id^="text-overlay-"]');
        overlays.forEach(overlay => overlay.remove());
    }

    // Update overlays after seek or other operations
    updateOverlays() {
        this.clearOverlays();
        window.textElements.forEach(element => {
            this.renderElement(element);
        });
    }
}

// Global renderer instance
window.renderer = null;
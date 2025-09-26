// Text Element Management System
class TextElement {
    constructor(id, text, x, y, fontSize = 24, color = '#ffffff') {
        this.id = id;
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.color = color;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initialX = x;
        this.initialY = y;
    }

    // Get bounding box for collision detection
    getBounds(ctx) {
        ctx.save();
        ctx.font = `${this.fontSize}px Arial`;
        const metrics = ctx.measureText(this.text);
        const width = metrics.width;
        const height = this.fontSize;
        ctx.restore();
        
        return {
            x: this.x,
            y: this.y - height,
            width: width,
            height: height
        };
    }

    // Check if point is inside text element
    containsPoint(x, y, ctx) {
        const bounds = this.getBounds(ctx);
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }

    // Update element position (used by drag system)
    updatePosition(x, y, canvasBounds) {
        // Clamp to canvas bounds
        const ctx = document.getElementById('main-canvas').getContext('2d');
        const bounds = this.getBounds(ctx);
        
        this.x = Math.max(0, Math.min(canvasBounds.width - bounds.width, x));
        this.y = Math.max(bounds.height, Math.min(canvasBounds.height, y));
    }
}

// Global text elements array
window.textElements = [];
window.nextTextId = 1;

// Update text element function (mentioned in requirements)
function updateTextElement(id, updates) {
    const element = window.textElements.find(el => el.id === id);
    if (element) {
        Object.assign(element, updates);
        // Trigger re-render
        if (window.renderer) {
            window.renderer.render();
        }
    }
}
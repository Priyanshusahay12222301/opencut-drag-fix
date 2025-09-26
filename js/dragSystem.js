// Drag System for Text Elements
class DragSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.isDragging = false;
        this.dragTarget = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    findTextElementAt(x, y) {
        const ctx = this.canvas.getContext('2d');
        // Check from top to bottom (reverse order for proper layering)
        for (let i = window.textElements.length - 1; i >= 0; i--) {
            const element = window.textElements[i];
            if (element.containsPoint(x, y, ctx)) {
                return element;
            }
        }
        return null;
    }

    onMouseDown(event) {
        const pos = this.getMousePos(event);
        const element = this.findTextElementAt(pos.x, pos.y);
        
        if (element) {
            this.isDragging = true;
            this.dragTarget = element;
            element.isDragging = true;
            element.dragStartX = pos.x - element.x;
            element.dragStartY = pos.y - element.y;
            this.lastMouseX = pos.x;
            this.lastMouseY = pos.y;
            
            this.canvas.style.cursor = 'grabbing';
            event.preventDefault();
        }
    }

    onMouseMove(event) {
        const pos = this.getMousePos(event);
        
        if (this.isDragging && this.dragTarget) {
            const newX = pos.x - this.dragTarget.dragStartX;
            const newY = pos.y - this.dragTarget.dragStartY;
            
            // Update position with canvas bounds clamping
            this.dragTarget.updatePosition(newX, newY, {
                width: this.canvas.width,
                height: this.canvas.height
            });
            
            // Update using the required updateTextElement function
            updateTextElement(this.dragTarget.id, {
                x: this.dragTarget.x,
                y: this.dragTarget.y
            });
            
            event.preventDefault();
        } else {
            // Change cursor on hover
            const element = this.findTextElementAt(pos.x, pos.y);
            this.canvas.style.cursor = element ? 'grab' : 'default';
        }
        
        this.lastMouseX = pos.x;
        this.lastMouseY = pos.y;
    }

    onMouseUp(event) {
        if (this.isDragging && this.dragTarget) {
            this.dragTarget.isDragging = false;
            this.dragTarget = null;
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        }
    }
}

// Global drag system instance
window.dragSystem = null;
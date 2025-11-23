
import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
    onSave: (signature: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    // Function to set canvas size based on container
    const initializeCanvas = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        // Set actual canvas size to match display size for sharp rendering
        canvas.width = rect.width;
        canvas.height = 200; // Fixed height

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.strokeStyle = '#f9fafb'; // Match text-primary color
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Use ResizeObserver for robust responsiveness to both window resize and sidebar toggles
        const resizeObserver = new ResizeObserver(() => {
            initializeCanvas();
            // Reset state on resize as canvas is cleared
            setHasDrawn(false);
        });

        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        
        const pos = getEventPosition(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        
        const pos = getEventPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
    };
    
    const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;

        if ('touches' in e.nativeEvent) {
             clientX = e.nativeEvent.touches[0].clientX;
             clientY = e.nativeEvent.touches[0].clientY;
        } else {
             clientX = (e.nativeEvent as MouseEvent).clientX;
             clientY = (e.nativeEvent as MouseEvent).clientY;
        }
        
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas && hasDrawn) {
            onSave(canvas.toDataURL('image/png'));
        }
    };

    return (
        <div ref={containerRef} className="w-full">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-secondary border border-border rounded-md block touch-none w-full" // touch-none prevents scrolling
                style={{ height: '200px' }}
            />
            <div className="flex justify-end space-x-2 mt-2">
                <button type="button" onClick={handleClear} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded text-sm">Clear</button>
                <button type="button" onClick={handleSave} disabled={!hasDrawn} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 rounded text-sm disabled:bg-gray-500 disabled:cursor-not-allowed">Save Signature</button>
            </div>
        </div>
    );
};

export default SignaturePad;

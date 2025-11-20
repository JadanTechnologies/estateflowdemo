import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
    onSave: (signature: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    const getContext = () => canvasRef.current?.getContext('2d');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Set canvas dimensions based on container size for responsiveness
        const rect = canvas.parentElement!.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = 200; // Fixed height
        
        const ctx = getContext();
        if (!ctx) return;
        ctx.strokeStyle = '#f9fafb';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = getContext();
        if (!ctx) return;
        
        const pos = getEventPosition(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const ctx = getContext();
        if (!ctx) return;
        
        const pos = getEventPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = getContext();
        if (!ctx) return;
        ctx.closePath();
        setIsDrawing(false);
    };
    
    const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        
        if (e.nativeEvent instanceof MouseEvent) {
             return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        }
        // Touch event
        const touch = (e.nativeEvent as TouchEvent).touches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }

    const handleClear = () => {
        const canvas = canvasRef.current;
        const ctx = getContext();
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
        <div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-secondary border border-border rounded-md w-full"
            />
            <div className="flex justify-end space-x-2 mt-2">
                <button type="button" onClick={handleClear} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded text-sm">Clear</button>
                <button type="button" onClick={handleSave} disabled={!hasDrawn} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-3 rounded text-sm disabled:bg-gray-500 disabled:cursor-not-allowed">Save Signature</button>
            </div>
        </div>
    );
};

export default SignaturePad;
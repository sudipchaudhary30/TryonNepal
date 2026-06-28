import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { fabric } from 'fabric';

export type FabricTool = 'select' | 'draw' | 'text' | 'rect' | 'circle' | 'image' | 'eraser';

export interface FabricCanvasHandle {
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  exportAsPNG: () => string;
  exportAsJSON: () => object;
}

interface FabricCanvasProps {
  template: string;
  activeTool: FabricTool;
  strokeColor: string;
  fillColor: string;
  brushSize: number;
  opacity: number;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
}

function cloneState(canvas: fabric.Canvas): string {
  return JSON.stringify(canvas.toJSON());
}

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(function FabricCanvas(
  { template, activeTool, strokeColor, fillColor, brushSize, opacity, onHistoryChange },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<fabric.Object | null>(null);

  const pushHistory = (canvas: fabric.Canvas) => {
    const snapshot = cloneState(canvas);
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(snapshot);
    historyIndexRef.current = historyRef.current.length - 1;
    onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyRef.current.length - 1);
  };

  const applySnapshot = (snapshot: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) {
      return;
    }

    canvas.loadFromJSON(snapshot, () => {
      canvas.renderAll();
      onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyRef.current.length - 1);
    });
  };

  useImperativeHandle(ref, () => ({
    undo: () => {
      if (historyIndexRef.current <= 0) {
        return;
      }
      historyIndexRef.current -= 1;
      applySnapshot(historyRef.current[historyIndexRef.current]);
    },
    redo: () => {
      if (historyIndexRef.current >= historyRef.current.length - 1) {
        return;
      }
      historyIndexRef.current += 1;
      applySnapshot(historyRef.current[historyIndexRef.current]);
    },
    clearCanvas: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) {
        return;
      }
      canvas.getObjects().forEach((object) => canvas.remove(object));
      canvas.backgroundColor = '#FFFFFF';
      canvas.renderAll();
      pushHistory(canvas);
    },
    exportAsPNG: () => fabricCanvasRef.current?.toDataURL({ format: 'png' }) ?? '',
    exportAsJSON: () => fabricCanvasRef.current?.toJSON() ?? {},
  }));

  useEffect(() => {
    const canvasElement = canvasElRef.current;
    const containerElement = containerRef.current;
    if (!canvasElement || !containerElement) {
      return;
    }

    const canvas = new fabric.Canvas(canvasElement, {
      backgroundColor: '#FFFFFF',
      preserveObjectStacking: true,
      selection: true,
      uniScaleTransform: true,
    });

    fabricCanvasRef.current = canvas;

    const resizeCanvas = () => {
      const { width, height } = containerElement.getBoundingClientRect();
      canvas.setWidth(Math.max(320, Math.floor(width)));
      canvas.setHeight(Math.max(480, Math.floor(height)));
      canvas.calcOffset();
      canvas.renderAll();
    };

    resizeCanvas();

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(containerElement);

    const syncHistory = () => {
      pushHistory(canvas);
    };

    canvas.on('object:added', syncHistory);
    canvas.on('object:modified', syncHistory);
    canvas.on('object:removed', syncHistory);

    canvas.on('mouse:down', (event) => {
      const pointer = canvas.getPointer(event.e);
      if (activeTool === 'text') {
        const text = new fabric.IText('Tap to edit', {
          left: pointer.x,
          top: pointer.y,
          fill: strokeColor,
          fontSize: 28,
          opacity,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        return;
      }

      if (activeTool === 'rect') {
        shapeStartRef.current = { x: pointer.x, y: pointer.y };
        currentShapeRef.current = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 1,
          height: 1,
          fill: fillColor,
          opacity,
          stroke: strokeColor,
          strokeWidth: 2,
        });
        canvas.add(currentShapeRef.current);
        return;
      }

      if (activeTool === 'circle') {
        shapeStartRef.current = { x: pointer.x, y: pointer.y };
        currentShapeRef.current = new fabric.Ellipse({
          left: pointer.x,
          top: pointer.y,
          rx: 1,
          ry: 1,
          fill: fillColor,
          opacity,
          stroke: strokeColor,
          strokeWidth: 2,
        });
        canvas.add(currentShapeRef.current);
      }
    });

    canvas.on('mouse:move', (event) => {
      if (!shapeStartRef.current || !currentShapeRef.current) {
        return;
      }

      const pointer = canvas.getPointer(event.e);
      const start = shapeStartRef.current;
      const width = pointer.x - start.x;
      const height = pointer.y - start.y;

      if (currentShapeRef.current instanceof fabric.Rect) {
        currentShapeRef.current.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width < 0 ? pointer.x : start.x,
          top: height < 0 ? pointer.y : start.y,
        });
      }

      if (currentShapeRef.current instanceof fabric.Ellipse) {
        currentShapeRef.current.set({
          rx: Math.abs(width) / 2,
          ry: Math.abs(height) / 2,
          left: width < 0 ? pointer.x : start.x,
          top: height < 0 ? pointer.y : start.y,
          originX: 'left',
          originY: 'top',
        });
      }

      canvas.renderAll();
    });

    canvas.on('mouse:up', () => {
      shapeStartRef.current = null;
      currentShapeRef.current = null;
    });

    if (activeTool === 'draw' || activeTool === 'eraser') {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#FFFFFF' : strokeColor;
    } else {
      canvas.isDrawingMode = false;
    }

    canvas.backgroundColor = '#FFFFFF';
    canvas.add(
      new fabric.Text(`Template: ${template}`, {
        left: 24,
        top: 24,
        fontSize: 18,
        fill: '#111111',
        opacity: 0.35,
        selectable: false,
        evented: false,
      }),
    );
    canvas.renderAll();
    pushHistory(canvas);

    return () => {
      observer.disconnect();
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [activeTool, brushSize, fillColor, opacity, strokeColor, template]);

  return (
    <div ref={containerRef} className="h-full w-full min-h-[70vh] overflow-hidden rounded-3xl border border-white/10 bg-white">
      <canvas ref={canvasElRef} />
    </div>
  );
});

export default FabricCanvas;

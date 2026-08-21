import { useMemo, useRef, useState } from 'react';

import FabricCanvas, { type FabricCanvasHandle, type FabricTool } from '@/components/design/FabricCanvas';
import Button from '@/components/ui/Button';

const templates = ['tshirt', 'kurta', 'pants', 'jacket', 'sherwani', 'daura-suruwal'] as const;
const tools: FabricTool[] = ['select', 'draw', 'text', 'rect', 'circle', 'image', 'eraser'];

export default function Design() {
  const [template, setTemplate] = useState<(typeof templates)[number]>('tshirt');
  const [designName, setDesignName] = useState('Untitled Design');
  const [activeTool, setActiveTool] = useState<FabricTool>('select');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#111111');
  const [fillColor, setFillColor] = useState('#e8ff47');
  const [brushSize, setBrushSize] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const canvasRef = useRef<FabricCanvasHandle>(null);

  const subtitle = useMemo(() => `Template: ${template}`, [template]);

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_minmax(0,1fr)_320px] lg:px-6">
      <aside className="rounded-2xl border border-white/10 bg-card p-4">
        <h2 className="font-display text-2xl font-bold text-white">Tools</h2>
        <div className="mt-4 grid gap-2">
          {tools.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => setActiveTool(tool)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                activeTool === tool ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-black/20 text-white/80'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Button variant="ghost" onClick={() => canvasRef.current?.undo()} disabled={!canUndo}>
            Undo
          </Button>
          <Button variant="ghost" onClick={() => canvasRef.current?.redo()} disabled={!canRedo}>
            Redo
          </Button>
          <Button variant="danger" onClick={() => canvasRef.current?.clearCanvas()}>
            Clear
          </Button>
        </div>
      </aside>

      <section className="rounded-2xl border border-white/10 bg-card p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Design Studio</h1>
            <p className="mt-2 text-sm text-white/60">{subtitle}</p>
          </div>
          <input
            value={designName}
            onChange={(event) => setDesignName(event.target.value)}
            className="w-full max-w-xs rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-accent"
          />
        </div>
        <FabricCanvas
          ref={canvasRef}
          template={template}
          activeTool={activeTool}
          strokeColor={strokeColor}
          fillColor={fillColor}
          brushSize={brushSize}
          opacity={opacity}
          onHistoryChange={(undo, redo) => {
            setCanUndo(undo);
            setCanRedo(redo);
          }}
        />
      </section>

      <aside className="rounded-2xl border border-white/10 bg-card p-4">
        <h2 className="font-display text-2xl font-bold text-white">Templates</h2>
        <div className="mt-4 grid gap-2">
          {templates.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTemplate(item)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                template === item ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-black/20 text-white/80'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Stroke Color</label>
            <input type="color" value={strokeColor} onChange={(event) => setStrokeColor(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-black/20" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Fill Color</label>
            <input type="color" value={fillColor} onChange={(event) => setFillColor(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-black/20" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Brush Size</label>
            <input type="range" min="1" max="40" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} className="w-full" />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/50">Opacity</label>
            <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="w-full" />
          </div>
          <Button className="w-full">Save Design</Button>
          <Button variant="ghost" className="w-full" onClick={() => canvasRef.current?.exportAsPNG()}>
            Export PNG
          </Button>
        </div>
      </aside>
    </div>
  );
}

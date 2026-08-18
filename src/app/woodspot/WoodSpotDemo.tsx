"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from "react";
import tabuaBase from "./assets/tabua-base.png";

const MAX_LOGO_DIMENSION = 1000;
const DEBOUNCE_MS = 150;
const MAX_COLOR_DISTANCE = Math.sqrt(3 * 255 * 255);
const INITIAL_LOGO_WIDTH_RATIO = 0.28;
const ZOOM_STEP = 0.05;
const MIN_LOGO_SIZE = 40;

type LogoBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function WoodSpotDemo() {
  const boardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardImgRef = useRef<HTMLImageElement | null>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });
  const isDraggingRef = useRef(false);
  const boxRef = useRef<LogoBox | null>(null);
  const defaultBoxRef = useRef<LogoBox | null>(null);

  const [boardReady, setBoardReady] = useState(false);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  const [tolerance, setTolerance] = useState(20);
  const [box, setBox] = useState<LogoBox | null>(null);
  const [, forceRedraw] = useState(0);

  useEffect(() => {
    boxRef.current = box;
  }, [box]);

  // Carrega a imagem base da tábua uma única vez.
  useEffect(() => {
    let cancelled = false;
    loadImage(tabuaBase.src).then((img) => {
      if (cancelled) return;
      boardImgRef.current = img;
      setBoardReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = boardCanvasRef.current;
    const boardImg = boardImgRef.current;
    if (!canvas || !boardImg) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(boardImg, 0, 0, canvas.width, canvas.height);

    const processed = processedCanvasRef.current;
    const currentBox = boxRef.current;
    if (processed && currentBox) {
      ctx.drawImage(
        processed,
        currentBox.x,
        currentBox.y,
        currentBox.width,
        currentBox.height
      );
    }
  }, []);

  useEffect(() => {
    redraw();
  }, [redraw, boardReady, box]);

  // Recalcula a imagem processada (fundo removido + preto) sempre que a
  // tolerância muda, com debounce para não travar o slider.
  useEffect(() => {
    if (!hasLogo) return;
    const timer = setTimeout(() => {
      processLogo(tolerance);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tolerance, hasLogo]);

  function processLogo(toleranceValue: number) {
    const original = originalImageDataRef.current;
    if (!original) return;

    const { width, height, data } = original;
    const out = new Uint8ClampedArray(data);

    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    const thresholdDistance = (toleranceValue / 100) * MAX_COLOR_DISTANCE;
    const thresholdSq = thresholdDistance * thresholdDistance;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const distSq = dr * dr + dg * dg + db * db;

      if (a === 0 || distSq < thresholdSq) {
        out[i + 3] = 0;
      } else {
        out[i] = 0;
        out[i + 1] = 0;
        out[i + 2] = 0;
        out[i + 3] = a;
      }
    }

    let processedCanvas = processedCanvasRef.current;
    if (!processedCanvas) {
      processedCanvas = document.createElement("canvas");
      processedCanvasRef.current = processedCanvas;
    }
    processedCanvas.width = width;
    processedCanvas.height = height;
    const pctx = processedCanvas.getContext("2d");
    if (!pctx) return;
    pctx.putImageData(new ImageData(out, width, height), 0, 0);

    forceRedraw((n) => n + 1);
    redraw();
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Envie um arquivo PNG ou JPG.");
      return;
    }

    const dataUrl = await readFileAsDataURL(file);
    setOriginalPreview(dataUrl);

    const img = await loadImage(dataUrl);

    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (width > MAX_LOGO_DIMENSION || height > MAX_LOGO_DIMENSION) {
      const ratio = Math.min(
        MAX_LOGO_DIMENSION / width,
        MAX_LOGO_DIMENSION / height
      );
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const naturalCanvas = document.createElement("canvas");
    naturalCanvas.width = width;
    naturalCanvas.height = height;
    const nctx = naturalCanvas.getContext("2d");
    if (!nctx) return;
    nctx.drawImage(img, 0, 0, width, height);
    originalImageDataRef.current = nctx.getImageData(0, 0, width, height);

    const board = boardCanvasRef.current;
    const boardWidth = board?.width ?? 700;
    const boardHeight = board?.height ?? 900;
    const initialWidth = boardWidth * INITIAL_LOGO_WIDTH_RATIO;
    const initialHeight = initialWidth * (height / width);

    const initialBox: LogoBox = {
      x: (boardWidth - initialWidth) / 2,
      y: (boardHeight - initialHeight) / 2,
      width: initialWidth,
      height: initialHeight,
    };
    defaultBoxRef.current = initialBox;
    setBox(initialBox);

    setHasLogo(true);
    processLogo(tolerance);
  }

  function getCanvasCoords(clientX: number, clientY: number) {
    const canvas = boardCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function isInsideBox(x: number, y: number, b: LogoBox) {
    return x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height;
  }

  function scaleBox(current: LogoBox, factor: number): LogoBox {
    const canvas = boardCanvasRef.current;
    const canvasWidth = canvas?.width ?? current.width;
    const canvasHeight = canvas?.height ?? current.height;
    const aspect = current.height / current.width;
    const newWidth = clamp(current.width * factor, MIN_LOGO_SIZE, canvasWidth);
    const newHeight = newWidth * aspect;
    const cx = current.x + current.width / 2;
    const cy = current.y + current.height / 2;

    return {
      x: clamp(cx - newWidth / 2, 0, Math.max(0, canvasWidth - newWidth)),
      y: clamp(cy - newHeight / 2, 0, Math.max(0, canvasHeight - newHeight)),
      width: newWidth,
      height: newHeight,
    };
  }

  function handleZoomIn() {
    setBox((current) => (current ? scaleBox(current, 1 + ZOOM_STEP) : current));
  }

  function handleZoomOut() {
    setBox((current) => (current ? scaleBox(current, 1 - ZOOM_STEP) : current));
  }

  function handleResetSize() {
    if (defaultBoxRef.current) {
      setBox({ ...defaultBoxRef.current });
    }
  }

  function handlePointerDown(e: PointerEvent<HTMLCanvasElement>) {
    if (!box) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    if (!isInsideBox(x, y, box)) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = { dx: x - box.x, dy: y - box.y };
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (!isDraggingRef.current || !box) return;
    const canvas = boardCanvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    const nextX = clamp(
      x - dragOffsetRef.current.dx,
      0,
      canvas.width - box.width
    );
    const nextY = clamp(
      y - dragOffsetRef.current.dy,
      0,
      canvas.height - box.height
    );
    setBox({ ...box, x: nextX, y: nextY });
  }

  function handlePointerUp(e: PointerEvent<HTMLCanvasElement>) {
    isDraggingRef.current = false;
    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
  }

  // Zoom da logo via scroll do mouse (abordagem mais simples que um handle
  // de resize dedicado). Precisa de listener nativo com passive:false para
  // poder cancelar o scroll da página enquanto o usuário ajusta o tamanho.
  useEffect(() => {
    const canvas = boardCanvasRef.current;
    if (!canvas) return;

    function handleWheel(e: WheelEvent) {
      const current = boxRef.current;
      if (!current || !canvas) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      if (!isInsideBox(x, y, current)) return;

      e.preventDefault();
      const factor = e.deltaY > 0 ? 1 - ZOOM_STEP : 1 + ZOOM_STEP;
      setBox(scaleBox(current, factor));
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [boardReady]);

  function handleDownload() {
    const board = boardCanvasRef.current;
    const boardImg = boardImgRef.current;
    const processed = processedCanvasRef.current;
    if (!board || !boardImg) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = board.width;
    exportCanvas.height = board.height;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(boardImg, 0, 0, exportCanvas.width, exportCanvas.height);
    if (processed && box) {
      ctx.drawImage(processed, box.x, box.y, box.width, box.height);
    }

    // toBlob (assíncrono, binário) em vez de toDataURL: no Safari iOS,
    // uma data URL grande (a tábua é 2000x2000px) faz o navegador tratar o
    // clique como navegação de página para a URL "data:", travando a UI
    // por vários segundos em vez de só disparar o download.
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "preview-gravacao.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-800">
          WoodSpot - Preview de gravação
        </h1>
      </header>

      <section className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col gap-3 sm:w-64">
          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            Logo (PNG ou JPG)
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              className="rounded border border-neutral-300 bg-white p-2 text-sm"
            />
          </label>

          {originalPreview && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">
                Logo original (antes do processamento):
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalPreview}
                alt="Prévia da logo original enviada"
                className="max-h-32 w-full rounded border border-neutral-200 object-contain bg-white p-2"
              />
            </div>
          )}

          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            Tolerância de remoção de fundo ({tolerance})
            <input
              type="range"
              min={0}
              max={100}
              value={tolerance}
              disabled={!hasLogo}
              onChange={(e) => setTolerance(Number(e.target.value))}
            />
          </label>
          <p className="text-xs text-neutral-400">
            Remove o fundo comparando cada pixel com a cor do canto superior
            esquerdo da imagem. Funciona melhor com fundos sólidos e
            uniformes.
          </p>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">Zoom da logo</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={!hasLogo}
                className="flex-1 rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-40"
              >
                -
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={!hasLogo}
                className="flex-1 rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-40"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={handleResetSize}
              disabled={!hasLogo}
              className="rounded border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 disabled:opacity-40"
            >
              Tamanho padrão
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasLogo}
            className="mt-2 rounded bg-neutral-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Baixar preview
          </button>

          {hasLogo && (
            <p className="text-xs text-neutral-400">
              Arraste a logo sobre a tábua para posicionar. Use o scroll do
              mouse ou os botões de zoom para redimensionar.
            </p>
          )}
        </div>

        <div className="flex-1">
          <canvas
            ref={boardCanvasRef}
            width={tabuaBase.width}
            height={tabuaBase.height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full max-w-md touch-none rounded border border-neutral-200 bg-white"
            style={{ cursor: hasLogo ? "grab" : "default" }}
          />
        </div>
      </section>
    </main>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

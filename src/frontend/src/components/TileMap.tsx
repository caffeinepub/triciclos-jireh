import { useCallback, useEffect, useRef, useState } from "react";

// --- Mercator projection helpers ---
const DEG2RAD = Math.PI / 180;
const TILE_SIZE = 256;

function lngToTileX(lng: number, zoom: number) {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number) {
  const r = lat * DEG2RAD;
  return (
    ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** zoom
  );
}

function tileXToLng(tx: number, zoom: number) {
  return (tx / 2 ** zoom) * 360 - 180;
}

function tileYToLat(ty: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * ty) / 2 ** zoom;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

type LatLng = [number, number];

interface MapMarker {
  id: string;
  position: LatLng;
  color: string;
  label: string;
  popupText?: string;
}

interface TileMapProps {
  center: LatLng;
  zoom?: number;
  height?: number | string;
  markers?: MapMarker[];
  onClick?: (latlng: LatLng) => void;
  crosshairCursor?: boolean;
  routePolyline?: LatLng[] | null;
  routeDistanceKm?: number | null;
}

export default function TileMap({
  center,
  zoom: initialZoom = 14,
  height = 280,
  markers = [],
  onClick,
  crosshairCursor = false,
  routePolyline = null,
  routeDistanceKm = null,
}: TileMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({
    w: 360,
    h: typeof height === "number" ? height : 280,
  });
  const [activePopup, setActivePopup] = useState<string | null>(null);

  // Pan/zoom state
  const [viewCenter, setViewCenter] = useState<LatLng>(center);
  const [zoom, setZoom] = useState(initialZoom);

  // Sync center when prop changes (initial mount or external reset)
  const prevCenter = useRef(center);
  useEffect(() => {
    if (
      prevCenter.current[0] !== center[0] ||
      prevCenter.current[1] !== center[1]
    ) {
      setViewCenter(center);
      prevCenter.current = center;
    }
  }, [center]);

  // Drag state
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    startCenter: LatLng;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = size;

  const cx = lngToTileX(viewCenter[1], zoom);
  const cy = latToTileY(viewCenter[0], zoom);
  const originPixelX = cx * TILE_SIZE - w / 2;
  const originPixelY = cy * TILE_SIZE - h / 2;

  const tileXStart = Math.floor(originPixelX / TILE_SIZE);
  const tileYStart = Math.floor(originPixelY / TILE_SIZE);
  const tileXEnd = Math.ceil((originPixelX + w) / TILE_SIZE);
  const tileYEnd = Math.ceil((originPixelY + h) / TILE_SIZE);

  const maxTile = 2 ** zoom;
  const tiles: { tx: number; ty: number; left: number; top: number }[] = [];
  for (let tx = tileXStart; tx < tileXEnd; tx++) {
    for (let ty = tileYStart; ty < tileYEnd; ty++) {
      const left = tx * TILE_SIZE - originPixelX;
      const top = ty * TILE_SIZE - originPixelY;
      tiles.push({
        tx: ((tx % maxTile) + maxTile) % maxTile,
        ty,
        left,
        top,
      });
    }
  }

  function latlngToPixel(lat: number, lng: number) {
    const px = lngToTileX(lng, zoom) * TILE_SIZE - originPixelX;
    const py = latToTileY(lat, zoom) * TILE_SIZE - originPixelY;
    return { x: px, y: py };
  }

  // Zoom with scroll wheel
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setZoom((z) => Math.min(18, Math.max(3, z + delta)));
  }, []);

  // Zoom buttons
  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.min(18, z + 1));
  };
  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.max(3, z - 1));
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (crosshairCursor) return; // in pick mode, no drag
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startCenter: viewCenter,
    };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dragRef.current?.isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      // Recompute using tile math
      const startCX = lngToTileX(dragRef.current.startCenter[1], zoom);
      const startCY = latToTileY(dragRef.current.startCenter[0], zoom);
      const newTX = startCX - dx / TILE_SIZE;
      const newTY = startCY - dy / TILE_SIZE;
      setViewCenter([tileYToLat(newTY, zoom), tileXToLng(newTX, zoom)]);
    },
    [zoom],
  );

  const handleMouseUp = () => {
    if (dragRef.current) dragRef.current.isDragging = false;
  };

  // Touch support
  const touchRef = useRef<{
    startX: number;
    startY: number;
    startCenter: LatLng;
    dist?: number;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (crosshairCursor) return;
    if (e.touches.length === 1) {
      touchRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startCenter: viewCenter,
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      touchRef.current = {
        startX: 0,
        startY: 0,
        startCenter: viewCenter,
        dist,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchRef.current) return;
    e.preventDefault();
    if (e.touches.length === 1 && !crosshairCursor) {
      const dx = e.touches[0].clientX - touchRef.current.startX;
      const dy = e.touches[0].clientY - touchRef.current.startY;
      const startCX = lngToTileX(touchRef.current.startCenter[1], zoom);
      const startCY = latToTileY(touchRef.current.startCenter[0], zoom);
      const newTX = startCX - dx / TILE_SIZE;
      const newTY = startCY - dy / TILE_SIZE;
      setViewCenter([tileYToLat(newTY, zoom), tileXToLng(newTX, zoom)]);
    } else if (e.touches.length === 2 && touchRef.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const ratio = newDist / touchRef.current.dist;
      const deltaZoom = Math.log2(ratio);
      setZoom((z) => Math.min(18, Math.max(3, z + deltaZoom)));
      touchRef.current.dist = newDist;
    }
  };

  const handleTouchEnd = () => {
    touchRef.current = null;
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (dragRef.current?.isDragging) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const worldTileX = (px + originPixelX) / TILE_SIZE;
      const worldTileY = (py + originPixelY) / TILE_SIZE;
      const lat = tileYToLat(worldTileY, zoom);
      const lng = tileXToLng(worldTileX, zoom);
      onClick([lat, lng]);
    },
    [onClick, originPixelX, originPixelY, zoom],
  );

  // Build SVG polyline points string
  let polylinePoints = "";
  if (routePolyline && routePolyline.length >= 2) {
    polylinePoints = routePolyline
      .map((ll) => {
        const { x, y } = latlngToPixel(ll[0], ll[1]);
        return `${x},${y}`;
      })
      .join(" ");
  }

  // Midpoint of polyline for distance label
  let midPoint: { x: number; y: number } | null = null;
  if (routePolyline && routePolyline.length >= 2) {
    const mid = routePolyline[Math.floor(routePolyline.length / 2)];
    midPoint = latlngToPixel(mid[0], mid[1]);
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: map canvas
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: "100%",
        height,
        position: "relative",
        overflow: "hidden",
        cursor: crosshairCursor
          ? "crosshair"
          : dragRef.current?.isDragging
            ? "grabbing"
            : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {tiles.map(({ tx, ty, left, top }) => (
        <img
          key={`${tx}-${ty}`}
          src={`https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left,
            top,
            width: TILE_SIZE,
            height: TILE_SIZE,
            imageRendering: "pixelated",
          }}
        />
      ))}

      {/* SVG overlay for route polyline */}
      {polylinePoints && (
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 5,
          }}
          width={w}
          height={h}
        >
          {/* Shadow */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Main route line */}
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#D32F2F"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrow heads along the route */}
          {routePolyline &&
            routePolyline.length >= 4 &&
            (() => {
              const arrows: React.ReactNode[] = [];
              const step = Math.max(1, Math.floor(routePolyline.length / 5));
              for (let i = step; i < routePolyline.length - 1; i += step) {
                const p1 = latlngToPixel(
                  routePolyline[i - 1][0],
                  routePolyline[i - 1][1],
                );
                const p2 = latlngToPixel(
                  routePolyline[i][0],
                  routePolyline[i][1],
                );
                const angle =
                  Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
                arrows.push(
                  <polygon
                    key={i}
                    points="0,-4 8,0 0,4"
                    fill="#D32F2F"
                    transform={`translate(${p2.x},${p2.y}) rotate(${angle})`}
                  />,
                );
              }
              return arrows;
            })()}
          {/* Distance label at midpoint */}
          {midPoint && routeDistanceKm !== null && (
            <>
              <rect
                x={midPoint.x - 28}
                y={midPoint.y - 14}
                width={56}
                height={18}
                rx={9}
                fill="#D32F2F"
              />
              <text
                x={midPoint.x}
                y={midPoint.y - 2}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontWeight="bold"
                fontFamily="sans-serif"
              >
                {routeDistanceKm.toFixed(1)} km
              </text>
            </>
          )}
        </svg>
      )}

      {markers.map((m) => {
        const { x, y } = latlngToPixel(m.position[0], m.position[1]);
        return (
          // biome-ignore lint/a11y/useKeyWithClickEvents: map marker
          <div
            key={m.id}
            onClick={(e) => {
              e.stopPropagation();
              setActivePopup(activePopup === m.id ? null : m.id);
            }}
            style={{
              position: "absolute",
              left: x - 14,
              top: y - 28,
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: m.color,
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                border: "3px solid white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  transform: "rotate(45deg)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 11,
                  lineHeight: 1,
                }}
              >
                {m.label}
              </span>
            </div>
            {activePopup === m.id && m.popupText && (
              <div
                style={{
                  position: "absolute",
                  bottom: 36,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "white",
                  padding: "4px 8px",
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  whiteSpace: "nowrap",
                  fontSize: 12,
                  fontWeight: 500,
                  zIndex: 20,
                }}
              >
                {m.popupText}
              </div>
            )}
          </div>
        );
      })}

      {/* Zoom controls */}
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <button
          type="button"
          onClick={zoomIn}
          style={{
            width: 30,
            height: 30,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "6px 6px 0 0",
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            lineHeight: 1,
          }}
        >
          +
        </button>
        <button
          type="button"
          onClick={zoomOut}
          style={{
            width: 30,
            height: 30,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "0 0 6px 6px",
            borderTop: "none",
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            lineHeight: 1,
          }}
        >
          −
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 6,
          fontSize: 10,
          color: "#333",
          background: "rgba(255,255,255,0.75)",
          padding: "1px 4px",
          borderRadius: 3,
          zIndex: 20,
        }}
      >
        © OpenStreetMap
      </div>
    </div>
  );
}

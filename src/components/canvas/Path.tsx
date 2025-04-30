import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "~/utils";

export default function Path({
  x,
  y,
  stroke = "#CCC",
  fill = "#000",
  opacity = 1,
  points,
  onPointerDown,
}: {
  x: number;
  y: number;
  stroke?: string;
  fill?: string;
  opacity?: number;
  points: number[][];
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  const strokePoints = getStroke(points, {
    size: 16,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  const strokePath = getSvgPathFromStroke(strokePoints);
  const transform = `translate(${x}px, ${y}px)`;

  return (
    <g className="group">
      {/* Hover Outline */}
      <path
        className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        transform={transform}
        d={strokePath}
        fill="none"
        stroke="#0b99ff"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main Path */}
      <path
        onPointerDown={onPointerDown}
        transform={transform}
        d={strokePath}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        opacity={opacity}
      />
    </g>
  );
}

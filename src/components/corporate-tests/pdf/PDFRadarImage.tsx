/**
 * PDF Radar Image
 * PRD-054: Radar em SVG puro para PDF (primitivos react-pdf)
 */

import { Svg, Polygon, Circle, Line, Text as SvgText } from '@react-pdf/renderer';
import type { DimensionScores, GaugeProDimension } from '@/types/gaugePro';

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];
const LABELS = ['Dom', 'Soc', 'Rit', 'Con', 'Rel'];
const CENTER = 100;
const RADIUS = 80;

function getPoint(dimIndex: number, value: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * dimIndex) / 5 - Math.PI / 2;
  const r = (value / 100) * RADIUS;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function polygonPoints(scores: DimensionScores): string {
  return DIMENSIONS.map((dim, i) => {
    const p = getPoint(i, scores[dim]);
    return `${p.x},${p.y}`;
  }).join(' ');
}

function gridPoints(level: number): string {
  return DIMENSIONS.map((_, i) => {
    const p = getPoint(i, level);
    return `${p.x},${p.y}`;
  }).join(' ');
}

interface PDFRadarImageProps {
  scores: DimensionScores;
  idealWeights?: Record<GaugeProDimension, number>;
  size?: number;
}

export function PDFRadarImage({ scores, idealWeights, size = 200 }: PDFRadarImageProps) {
  return (
    <Svg viewBox="0 0 200 200" style={{ width: size, height: size }}>
      {/* Grid */}
      {[25, 50, 75, 100].map(level => (
        <Polygon
          key={level}
          points={gridPoints(level)}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          fill="none"
        />
      ))}

      {/* Axis Lines */}
      {DIMENSIONS.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <Line key={i} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={0.5} />
        );
      })}

      {/* Ideal Profile (if provided) */}
      {idealWeights && (
        <Polygon
          points={DIMENSIONS.map((dim, i) => {
            const p = getPoint(i, idealWeights[dim] * 50);
            return `${p.x},${p.y}`;
          }).join(' ')}
          stroke="#94a3b8"
          strokeWidth={1}
          strokeDasharray="4,4"
          fill="#94a3b8"
          fillOpacity={0.05}
        />
      )}

      {/* Score Polygon */}
      <Polygon
        points={polygonPoints(scores)}
        stroke="#0891b2"
        strokeWidth={1.5}
        fill="#0891b2"
        fillOpacity={0.15}
      />

      {/* Score Points */}
      {DIMENSIONS.map((dim, i) => {
        const p = getPoint(i, scores[dim]);
        return <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#0891b2" />;
      })}

      {/* Labels */}
      {DIMENSIONS.map((_, i) => {
        const p = getPoint(i, 115);
        return (
          <SvgText
            key={i}
            x={p.x}
            y={p.y + 3}
            style={{ fontSize: 8, fill: '#374151', textAnchor: 'middle' }}
          >
            {LABELS[i]}
          </SvgText>
        );
      })}
    </Svg>
  );
}

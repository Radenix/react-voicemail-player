import React, { useRef, useLayoutEffect, useState } from "react";
import useAudioPeaks from "./hooks/useAudioPeaks";

export default function AudioVisualization({
  audioData,
  progress,
}: {
  audioData: AudioBuffer | null;
  progress: number;
}) {
  const svgRef = useRef<SVGSVGElement>();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const barWidth = 2;
  const barGap = 1;
  const barCount = Math.round(width / (barWidth + barGap));
  const peaks = useAudioPeaks(audioData, barCount);

  const { current: clipPathId } = useRef<string>(
    Math.random().toString(36).substring(2)
  );

  const renderBars = () => {
    const result = [];
    for (let i = 0; i < peaks.length; i++) {
      const barHeight = Math.max(Math.floor(peaks[i] * height), 1);
      const barX = i * (barWidth + barGap);
      const barY = height - barHeight;

      result.push(
        <rect
          key={i}
          x={barX}
          y={barY}
          width={barWidth}
          height={barHeight}
          fill="transparent"
        ></rect>
      );
    }
    return result;
  };

  useLayoutEffect(() => {
    const bbox = svgRef.current.getBoundingClientRect();
    setWidth(bbox.width);
    setHeight(bbox.height);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      let w, h;
      if (entry.borderBoxSize) {
        w = entry.borderBoxSize[0].inlineSize;
        h = entry.borderBoxSize[0].blockSize;
      } else {
        w = entry.contentRect.width;
        h = entry.contentRect.height;
      }

      setWidth(w);
      setHeight(h);
    });
    observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <svg className="rvmp-viz-container" ref={svgRef}>
      <defs>
        <clipPath id={clipPathId}>{renderBars()}</clipPath>
      </defs>
      <g clipPath={`url(#${clipPathId})`}>
        <rect className="rvmp-viz-bg" width={width} height={height}></rect>
        <rect
          className="rvmp-viz-progress"
          x={progress * width - width}
          y="0"
          width={width}
          height={height}
        />
      </g>
    </svg>
  );
}

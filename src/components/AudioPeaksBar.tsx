import React, {
  useRef,
  useLayoutEffect,
  useState,
  memo,
  useEffect,
  useCallback,
} from "react";
import useAudioPeaks from "../hooks/useAudioPeaks";

export interface AudioPeaksBarProps {
  audioData: AudioBuffer | null;
  progress: number;
  barAlignment: "top" | "middle" | "bottom";
  onProgressChange: (progress: number) => void;
}

type Size = { width: number; height: number };

const BAR_WIDTH = 2;
const BAR_GAP = 2;
const MIN_BAR_HEIGHT = 2;

export default memo(function AudioPeaksBar({
  audioData,
  progress,
  barAlignment,
  onProgressChange,
}: AudioPeaksBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(containerRef);

  const barCount = Math.round(width / (BAR_WIDTH + BAR_GAP));
  const peaks = useAudioPeaks(audioData, barCount);

  const { current: clipPathId } = useRef<string>(
    `rvmp_clip_path_${Math.random().toString(36).substring(2)}`
  );

  const onDragStart = useCallback(
    (startEvent: React.PointerEvent) => {
      if (startEvent.button !== 0) {
        return;
      }

      const { left, width } = startEvent.currentTarget.getBoundingClientRect();
      const originX = startEvent.clientX;
      const offsetX = originX - left;
      let hasMoved = false;

      const onDragMove = (moveEvent: PointerEvent) => {
        hasMoved = true;
        const movementX = moveEvent.clientX - originX + offsetX;
        onProgressChange(movementX / width);
      };
      const onDragEnd = (endEvent: PointerEvent) => {
        if (endEvent.button !== 0) {
          return;
        }
        if (!hasMoved) {
          onProgressChange(offsetX / width);
        }
        document.removeEventListener("pointermove", onDragMove);
        document.removeEventListener("pointerup", onDragEnd);
        document.removeEventListener("pointercancel", onDragEnd);
      };

      document.addEventListener("pointermove", onDragMove);
      document.addEventListener("pointerup", onDragEnd);
      document.addEventListener("pointercancel", onDragEnd);
    },
    [onProgressChange]
  );

  const renderBars = () => {
    const halfHeight = (height - MIN_BAR_HEIGHT) / 2;
    const result = [];

    for (let i = 0; i < peaks.length; i++) {
      const topBarHeight = Math.floor(peaks[i][0] * halfHeight);
      const bottomBarHeight = Math.floor(peaks[i][1] * halfHeight);

      const barHeight = topBarHeight + bottomBarHeight + MIN_BAR_HEIGHT;
      const barX = i * (BAR_WIDTH + BAR_GAP);
      let barY;
      if (barAlignment === "top") {
        barY = 0;
      } else if (barAlignment === "bottom") {
        barY = height - barHeight;
      } else {
        // middle
        barY = halfHeight - topBarHeight;
      }

      result.push(
        <rect
          key={i}
          x={barX}
          y={barY}
          width={BAR_WIDTH}
          height={barHeight}
          rx={BAR_WIDTH / 2}
          ry={BAR_WIDTH / 2}
          fill="transparent"
        />
      );
    }
    return result;
  };

  return (
    <div
      data-testid="rvmp-peaks-bar"
      onPointerDown={onDragStart}
      ref={containerRef}
    >
      <svg className={prefixClassName("peaks")}>
        <defs>
          <clipPath id={clipPathId}>{renderBars()}</clipPath>
        </defs>
        <g clipPath={`url(#${clipPathId})`}>
          <rect
            className={prefixClassName("peaks-bg")}
            width={width}
            height={height}
          ></rect>
          <rect
            className={prefixClassName("peaks-progress")}
            x={progress * width - width}
            y="0"
            width={width}
            height={height}
          />
        </g>
      </svg>
    </div>
  );
});

function useElementSize(ref: React.RefObject<HTMLElement>): Size {
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      console.error(
        "[react-voicemail-player]: Cannot determine element size because the given ref is not attached to the element"
      );
      return;
    }
    const bbox = ref.current!.getBoundingClientRect();
    setSize({ width: bbox.width, height: bbox.height });
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      console.error(
        "[react-voicemail-player]: Cannot observe element size because the given ref is not attached to the element"
      );
      return;
    }

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

      setSize({ width: w, height: h });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return size;
}

function prefixClassName(name: string) {
  return `VoicemailPlayer-${name}`;
}

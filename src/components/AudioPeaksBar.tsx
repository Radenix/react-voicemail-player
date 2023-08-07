import React, {
  useRef,
  useLayoutEffect,
  useState,
  RefObject,
  memo,
  useEffect,
} from "react";
import useAudioPeaks from "../hooks/useAudioPeaks";
import useAudioData from "../hooks/useAudioData";

export interface AudioPeaksBarProps {
  audioElement: HTMLAudioElement | null;
  progress: number;
  onClick: (relativeX: number) => void;
}

const BAR_WIDTH = 2;
const BAR_GAP = 1;
const MIN_BAR_HEIGHT = 1;

export default memo(function AudioPeaksBar({
  audioElement,
  progress,
  onClick,
}: AudioPeaksBarProps) {
  const containerRef = useRef<HTMLDivElement>();
  const { width, height } = useElementSize(containerRef);
  const [audioData] = useAudioData(audioElement);

  const barCount = Math.round(width / (BAR_WIDTH + BAR_GAP));
  const peaks = useAudioPeaks(audioData, barCount);

  const { current: clipPathId } = useRef<string>(
    `rvmp_clip_path_${Math.random().toString(36).substring(2)}`
  );

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onClick(event.nativeEvent.offsetX / width);
  };

  const renderBars = () => {
    const result = [];
    for (let i = 0; i < peaks.length; i++) {
      const barHeight = Math.max(Math.floor(peaks[i] * height), MIN_BAR_HEIGHT);
      const barX = i * (BAR_WIDTH + BAR_GAP);
      const barY = height - barHeight;
      // y coordinate of a bar that is just outside the canvas
      const barOutsideY = height + barHeight - MIN_BAR_HEIGHT;

      result.push(
        <rect
          key={i}
          x={barX}
          y={barY}
          width={BAR_WIDTH}
          height={barHeight}
          fill="transparent"
        >
          <animate
            attributeName="y"
            // MIN_BAR_HEIGHT pixels of the bar should always be visible
            from={barOutsideY - MIN_BAR_HEIGHT}
            to={barY}
            dur="250ms"
            repeatCount="1"
          />
        </rect>
      );
    }
    return result;
  };

  return (
    <div onClick={handleClick} ref={containerRef}>
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

type Size = { width: number; height: number };

function useElementSize(ref: RefObject<HTMLElement>): Size {
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const bbox = ref.current.getBoundingClientRect();
    setSize({ width: bbox.width, height: bbox.height });
  }, []);

  useEffect(() => {
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
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return size;
}

function prefixClassName(name: string) {
  return `VoicemailPlayer-${name}`;
}

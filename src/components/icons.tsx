import React, { memo } from "react";

export interface IconProps {
  className?: string;
}

export const PauseIcon = memo(({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 18 18">
    <path d="M 11,4.5 C 11,4.22386 11.33585,4 11.75,4 h 1.5 C 13.66415,4 14,4.22386 14,4.5 v 9 c 0,0.2761 -0.33585,0.5 -0.75,0.5 h -1.5 C 11.33585,14 11,13.7761 11,13.5 Z" />
    <path d="M 5.75,4 C 5.33579,4 5,4.22386 5,4.5 v 9 C 5,13.7761 5.33579,14 5.75,14 h 1.5 C 7.66421,14 8,13.7761 8,13.5 v -9 C 8,4.22386 7.66421,4 7.25,4 Z" />
  </svg>
));

export const PlayIcon = memo(({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 18 18">
    <path d="M5.49807 4.13509C5.80639 3.95617 6.18664 3.9549 6.49614 4.13176L13.4961 8.13176C13.8077 8.3098 14 8.64114 14 9C14 9.35886 13.8077 9.6902 13.4961 9.86824L6.49614 13.8682C6.18664 14.0451 5.80639 14.0438 5.49807 13.8649C5.18976 13.686 5 13.3565 5 13V5C5 4.64353 5.18976 4.31401 5.49807 4.13509Z" />
  </svg>
));

import type { CSSProperties } from "react";

export interface WayglimBackgroundProps {
  className?: string;
  style?: CSSProperties;
  layout?: "fill" | "block";
  paused?: boolean;
  label?: string;
}

export default function WayglimBackground(
  props: WayglimBackgroundProps,
): React.JSX.Element;

import type { CSSProperties } from "react";

export interface FooterWayglimBackgroundProps {
  className?: string;
  style?: CSSProperties;
  layout?: "fill" | "block";
  paused?: boolean;
  label?: string;
}

export default function FooterWayglimBackground(
  props: FooterWayglimBackgroundProps,
): React.JSX.Element;

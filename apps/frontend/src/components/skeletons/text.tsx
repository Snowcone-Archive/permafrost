import random from "random";
import styles from "./animation.module.css";

interface TextSkeletonProps {
  textSize: string;
  widthRange: [number, number];
  transparency?: number;
  className?: string;
}

export default function TextSkeleton(props: TextSkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${props.className}`}
      style={{
        width: random.int(props.widthRange[0], props.widthRange[1]) + "px",
        height: props.textSize,
        opacity: props.transparency,
      }}
    ></span>
  );
}

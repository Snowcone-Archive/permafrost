export default function Loader({
  className,
  color = "#fff",
  children,
  condition = false,
  center = false,
}: {
  className?: string;
  color?: string;
  children?: React.ReactNode;
  condition?: boolean;
  center?: boolean;
}) {
  return children && condition ? (
    children
  ) : (
    <div className={center ? "flex justify-center" : ""}>
      <div
        className={`w-6 h-6 block rounded-full animate-spin ${className}`}
        style={{
          borderStyle: "solid",
          borderWidth: "3px",
          borderColor: `${color} transparent ${color} transparent`,
        }}
      ></div>
    </div>
  );
}

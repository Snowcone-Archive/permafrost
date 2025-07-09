import { usePermafrost } from "@/contexts/PermafrostContext";
import Icon, { type IconProps } from "./Icon";

export default function ApplicationIcon({
  id,
  cacheBuster,
  ...props
}: Omit<IconProps, "src"> & { cacheBuster?: string; id?: string }) {
  const permafrost = usePermafrost();

  return (
    <Icon
      src={`${permafrost.endpoint}/applications/${id}/icon?${cacheBuster}`}
      {...props}
    />
  );
}

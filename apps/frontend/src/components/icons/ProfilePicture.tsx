import { usePermafrost } from "@/contexts/PermafrostContext";
import Icon, { type IconProps } from "./Icon";

export default function ProfilePicture({
  id,
  cacheBuster,
  ...props
}: Omit<IconProps, "src"> & { id?: string; cacheBuster?: string }) {
  const permafrost = usePermafrost();

  return (
    <Icon
      src={`${permafrost.endpoint}/users/${id}/avatar?${cacheBuster}`}
      {...props}
    />
  );
}

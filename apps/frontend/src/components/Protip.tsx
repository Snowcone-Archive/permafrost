import { OutlinedIcon } from "@/components/OutlinedIcon";

export default function Protip() {
  return (
    <p className="text-xs text-[#ffffff77] mt-1">
      <OutlinedIcon icon="lightbulb" /> Protip: You can bypass this prompt by
      holding <kbd>Shift</kbd> while clicking the button.
    </p>
  );
}

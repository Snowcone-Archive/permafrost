import Button from "@/components/inputs/Button";
import Prompt from "@/components/Prompt";

export default function DeletionConfirmation({
  visible,
  setVisible,
  onConfirm,
  title,
  message,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => unknown;
  onConfirm: () => unknown;
  title: string;
  message: string;
}) {
  return (
    <Prompt
      visible={visible}
      buttons={
        <>
          <Button
            shape="slim"
            color="secondary"
            variant="flat"
            onClick={() => {
              setVisible(false);
            }}
          >
            Cancel
          </Button>
          <Button
            shape="slim"
            color="danger"
            variant="flat"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="flex flex-col">
        <h2 className="font-bold text-2xl">{title}</h2>
        <p>{message}</p>
      </div>
    </Prompt>
  );
}

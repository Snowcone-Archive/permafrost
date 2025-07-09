import type { Error } from "@snowflake-software/permafrost-js";
import EventEmitter from "events";
import type { NotificationProps } from "./Notification";

export type NotificationArray = {
  emitter: NotificationEmitter;
  delta: number;
  message: NotificationProps;
}[];

export class NotificationEmitter extends EventEmitter {}

export default class NotificationManager {
  public notifications: NotificationArray = [];
  private setNotifications: (state: NotificationArray) => void;

  constructor(props: {
    setNotifications: (notifications: NotificationArray) => void;
  }) {
    this.setNotifications = props.setNotifications;
  }

  public create(notificationProps: NotificationProps) {
    const emitter = new NotificationEmitter();

    this.notifications.unshift({
      emitter,
      delta: Date.now() * Math.random(),
      message: notificationProps,
    });

    this.setNotifications(this.notifications);

    const remove = () => {
      setTimeout(() => {
        this.notifications = this.notifications.filter(
          (notification) => notification.emitter !== emitter
        );
        this.setNotifications(this.notifications);
      }, 500);
    };

    emitter.on("goodbye", remove);

    return {
      setType: (type: string) => {
        emitter.emit("update", { ...notificationProps, type });
      },
      setText: (text: string) => {
        emitter.emit("update", { ...notificationProps, text });
      },
      setPersistant: () => {},
      setLifetime: () => {},
      remove: () => {
        emitter.emit("remove");
        remove();
      },
    };
  }

  public fromError(err: Error<string>) {
    return this.create({
      type: "error",
      text: err.error.message || err.error.code || "An error occurred",
    });
  }
}

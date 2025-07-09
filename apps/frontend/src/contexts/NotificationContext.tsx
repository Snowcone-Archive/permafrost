import useQuery from "@/utils/useQuery";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import PermafrostNotification from "./notifications/Notification";
import NotificationManagerClass, {
  type NotificationArray,
} from "./notifications/NotificationManager";

const presetMessages = {
  passwordResetSuccess: {
    type: "success",
    text: "Password reset successfully.",
  },
  loginCancelled: {
    type: "info",
    text: "Login cancelled.",
  },
  accountCreated: {
    type: "success",
    text: "Account created successfully, you may now log in.",
  },
  emailVerificationDoesNotExist: {
    type: "error",
    text: "Email verification does not exist.",
  },
  internalError: {
    type: "error",
    text: "An internal error occurred.",
  },
  emailVerified: {
    type: "success",
    text: "Your email has been verified!",
  },
  stateMismatch: {
    type: "warning",
    text: "Please try logging in again.",
  },
  stateExpired: {
    type: "warning",
    text: "Please try logging in again.",
  },
  registrationDisabled: {
    type: "info",
    text: "Registration has been disabled at this time.",
  },
  oauthNotMember: {
    type: "info",
    text: "You must be a Permafrost member to create an account.",
  },
  oauthEmailTaken: {
    type: "error",
    text: "The email provided is already taken.",
  },
  connectedSuccessfully: {
    type: "success",
    text: "OAuth provider connected successfully.",
  },
  oauthAlreadyLinked: {
    type: "info",
    text: "This account is already linked to this OAuth provider.",
  },
  oauthLoginDisabled: {
    type: "info",
    text: "You cannot log in via this provider.",
  },
};

export const MessagesContext = createContext<NotificationManagerClass>(
  new NotificationManagerClass({
    setNotifications: () => {},
  })
);

export const useNotifications = () => {
  return useContext(MessagesContext);
};

export default function NotificationContext({
  children,
}: {
  children: ReactNode;
}) {
  const { message } = useQuery();
  const [notificationsToRender, setNotificationsToRender] =
    useState<NotificationArray>([]);
  const [notificationsUpdate, setNotificationsUpdate] = useState(1);

  const notifications = useRef<NotificationArray>([]);

  const NotificationManager = useRef(
    new NotificationManagerClass({
      setNotifications: (notifs) => {
        notifications.current = notifs;
        setNotificationsUpdate((prev) => prev + 1);
      },
    })
  );

  useEffect(() => {
    if (message && message in presetMessages) {
      NotificationManager.current.create(
        presetMessages[message as keyof typeof presetMessages]
      );
    } else if (message != undefined) {
      NotificationManager.current.create({
        type: "info",
        text: message,
      });
    }
  }, [message]);

  useEffect(() => {
    setNotificationsToRender(notifications.current);
  }, [notificationsUpdate]);

  return (
    <>
      <MessagesContext.Provider value={NotificationManager.current}>
        <div
          className={`fixed left-0 top-8 flex flex-col items-center gap-4 z-50 w-full pointer-events-none`}
        >
          {notificationsToRender.map((props, i) => {
            return <PermafrostNotification key={props.delta} {...props} />;
          })}
        </div>
        {children}
      </MessagesContext.Provider>
    </>
  );
}

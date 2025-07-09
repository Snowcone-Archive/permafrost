import Loader from "./Loader";

export type Props = {
  isLoading: boolean;
  error: Error;
  data: any;
  children: React.ReactNode;
  loaderClassName?: string;
  errorClassName?: string;
  loaderStyle?: React.CSSProperties;
  errorStyle?: React.CSSProperties;
};

export default function SWRContainer(props: Props) {
  return props.isLoading ? (
    <div
      className={`${props.loaderClassName} flex justify-center`}
      style={props.errorStyle}
    >
      <Loader />
    </div>
  ) : props.error ? (
    <div
      className={`text-snowflake-fg-danger ${props.errorClassName}`}
      style={props.errorStyle}
    >
      {props.error.message || "Unknown error"}
    </div>
  ) : props.data !== undefined ? (
    <>{props.children}</>
  ) : null;
}

// Utility component to format date in human readable format

export function HumanDate(props: {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
}) {
  return (
    <>
      {props.date instanceof Date
        ? props.date.toLocaleDateString(undefined, props.options)
        : new Date(props.date).toLocaleDateString(undefined, props.options)}
    </>
  );
}

export function HumanDateTime(props: {
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
}) {
  return (
    <>
      {props.date instanceof Date
        ? props.date.toLocaleString(undefined, props.options)
        : new Date(props.date).toLocaleString(undefined, props.options)}
    </>
  );
}

export default function Blankslate({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="flex items-center justify-center flex-col bg-snowflake-gray-3 p-4 rounded-lg">
      <h2 className="text-2xl font-bold flex items-center gap-2">{title}</h2>
      {description && <p className="text-snowflake-fg-dim">{description}</p>}
    </section>
  );
}

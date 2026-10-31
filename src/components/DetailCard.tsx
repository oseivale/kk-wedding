import { Val } from "./ui";

export function DetailCard({
  title,
  rows,
  mapUrl,
}: {
  title: string;
  rows: [label: string, value: string][];
  mapUrl: string | null;
}) {
  return (
    <section className="detail-card">
      <h2>{title}</h2>
      <dl className="detail-list">
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <dt>{label}</dt>
            <dd>
              <Val v={value} />
            </dd>
          </div>
        ))}
      </dl>
      {mapUrl ? (
        <a className="btn btn--ghost btn--small" href={mapUrl} target="_blank" rel="noopener noreferrer">
          View location on Google Maps
        </a>
      ) : (
        <p className="tbc" style={{ margin: 0 }}>
          Map link will be added once the venue is confirmed.
        </p>
      )}
    </section>
  );
}

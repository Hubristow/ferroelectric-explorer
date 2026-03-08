export default function VizPage({ entry }) {
  const Component = entry.component;
  return (
    <div className="viz-page">
      <Component />
    </div>
  );
}

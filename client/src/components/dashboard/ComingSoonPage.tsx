export function ComingSoonPage({ title }: { title: string }) {
  return (
    <section className="dash-coming-soon">
      <h1>{title}</h1>
      <p>This section is on the roadmap and isn't built yet — check back soon.</p>
    </section>
  );
}

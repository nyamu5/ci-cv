// TODO: implement in Ticket 3.3 — results page with polling.

type Props = { params: Promise<{ id: string }> };

export default async function AnalysisPage({ params }: Props) {
  const { id } = await params;
  return <main>Analysis {id}</main>;
}

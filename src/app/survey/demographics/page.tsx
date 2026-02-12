export default function SurveyPage({
  params,
}: {
  params: { type: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-2xl">Survey: {params.type}</h1>
    </div>
  );
}
export default function SurveyPage({
  params,
}: {
  params: { type: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black">Hello!{params.type}</h1>
    </div>
  );
}
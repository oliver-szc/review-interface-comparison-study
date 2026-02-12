export default async function StudyConditionPage({
  params,
}: {
  params: Promise<{ condition: string }>; // Typed as a Promise
}) {
  const { condition } = await params; // Await the params
  return (
    <div className="p-8">
      <h1 className="text-2xl">Study Interface: {condition}</h1>
    </div>
  );
}
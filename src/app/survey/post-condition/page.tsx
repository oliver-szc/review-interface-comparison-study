import { StudyLayout } from "@/components/layouts/StudyLayout";

export default function SurveyPage({
  params,
}: {
  params: { type: string };
}) {
  return (
    <StudyLayout task="POST-CONDITION SURVEY">
      <div className="">
      </div>
    </StudyLayout>
  );
}
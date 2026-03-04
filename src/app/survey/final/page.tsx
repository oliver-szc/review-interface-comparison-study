import { StudyLayout } from "@/components/layouts/StudyLayout";

export default function SurveyPage({
  params,
}: {
  params: { type: string };
}) {
  return (
    <StudyLayout task="FINAL SURVEY">
      <div className="">
      </div>
    </StudyLayout>
  );
}
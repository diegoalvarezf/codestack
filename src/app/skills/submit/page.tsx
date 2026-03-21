import { redirect } from "next/navigation";

export default function SubmitSkillPage() {
  redirect("/submit?type=prompt");
}

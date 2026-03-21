import { redirect } from "next/navigation";

export default function SubmitAgentPage() {
  redirect("/submit?type=agent");
}

import { CreatePollForm } from "@/modules/create-poll/client";
import { Landing } from "@/modules/landing";

export default function HomePage() {
  return <Landing hero={<CreatePollForm />} />;
}

import { CreatePollForm } from "@/modules/create-poll/client";
import { AppHeader } from "./app-header";
import frame from "./page-frame.module.css";

export default function CreatePollPage() {
  return (
    <div className={frame.frame}>
      <AppHeader />
      <main>
        <CreatePollForm />
      </main>
    </div>
  );
}

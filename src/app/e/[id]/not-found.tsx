import { PageFrame } from "@/shared/ui/page-frame/page-frame";
import { AppHeader } from "../../app-header";
import { PollGone } from "./poll-gone";

export default function PollNotFound() {
  return (
    <>
      <AppHeader />
      <PageFrame>
        <PollGone />
      </PageFrame>
    </>
  );
}

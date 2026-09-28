import { AppHeader } from "../../app-header";
import { PageFrame } from "../../page-frame";
import { PollGone } from "./poll-gone";

export default function PollNotFound() {
  return (
    <PageFrame>
      <AppHeader />
      <PollGone />
    </PageFrame>
  );
}

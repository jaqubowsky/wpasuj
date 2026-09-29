import { AppHeader } from "../../app-header";
import { PageFrame } from "../../page-frame";
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

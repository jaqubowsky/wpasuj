import { findMyAnswer } from "@/modules/answer-poll";
import { AnswerBody, AnswerLead, AnswerProvider } from "@/modules/answer-poll/client";
import { findPoll } from "@/modules/create-poll";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import { notFound } from "next/navigation";
import { AppHeader } from "../../app-header";
import frame from "../../page-frame.module.css";
import { answeredCount } from "./answered-count";
import styles from "./poll-page.module.css";
import { PollTabs } from "./poll-tabs";

export default async function PollPage({ params }: PageProps<"/e/[id]">) {
  const { id } = await params;
  const poll = findPoll(id, new Date());
  if (!poll) notFound();
  const mine = await findMyAnswer(id);
  const hours = Array.from({ length: poll.lastHour - poll.firstHour }, (_, index) => poll.firstHour + index);

  return (
    <div className={frame.frame}>
      <AppHeader aside={<Text variant="meta">{answeredCount(poll.respondentCount)}</Text>} />
      <main className={styles.main}>
        <div className={styles.asker}>
          <Avatar name={poll.organiserName} />
          <Text variant="meta">{poll.organiserName} pyta</Text>
        </div>
        <Text as="h1" variant="title">
          {poll.title}
        </Text>
        <div className={styles.tabs}>
          <AnswerProvider pollId={id} dates={poll.dates} hours={hours} mine={mine}>
            <PollTabs
              opening={mine ? "Wszyscy" : "Moje"}
              leads={{ Moje: <AnswerLead />, Wszyscy: null }}
              bodies={{ Moje: <AnswerBody />, Wszyscy: null }}
            />
          </AnswerProvider>
        </div>
      </main>
    </div>
  );
}

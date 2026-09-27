import { findMyAnswer, nameKey } from "@/modules/answer-poll";
import { AnswerBody, AnswerLead, AnswerProvider } from "@/modules/answer-poll/client";
import { findPoll } from "@/modules/create-poll";
import { readResults } from "@/modules/view-results";
import { ResultsBody, ResultsLead, ResultsProvider } from "@/modules/view-results/client";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "../../app-header";
import frame from "../../page-frame.module.css";
import { answeredCount } from "./answered-count";
import styles from "./poll-page.module.css";
import { PollTabs } from "./poll-tabs";
import { ZoneNote } from "./zone-note";

export async function generateMetadata({ params }: PageProps<"/e/[id]">): Promise<Metadata> {
  const { id } = await params;
  const poll = findPoll(id, new Date());
  if (!poll) return {};
  const question = `Kiedy możesz? ${poll.title}`;
  return {
    metadataBase: new URL(process.env.SITE_URL!),
    title: question,
    description: question,
    openGraph: { title: question, description: question },
  };
}

export default async function PollPage({ params }: PageProps<"/e/[id]">) {
  const { id } = await params;
  const now = new Date();
  const poll = findPoll(id, now);
  if (!poll) notFound();
  const mine = await findMyAnswer(id);
  const hours = Array.from({ length: poll.lastHour - poll.firstHour }, (_, index) => poll.firstHour + index);

  return (
    <div className={`${frame.frame} ${styles.page}`}>
      <AppHeader aside={<Text variant="meta">{answeredCount(poll.respondentCount)}</Text>} />
      <main className={styles.main}>
        <div className={styles.head}>
          <div className={styles.asker}>
            <Avatar name={poll.organiserName} tintKey={nameKey(poll.organiserName)} />
            <Text variant="meta">{poll.organiserName} pyta</Text>
          </div>
          <Text as="h1" variant="title">
            {poll.title}
          </Text>
          <ZoneNote pollZone={poll.timeZone} />
        </div>
        <div className={styles.tabs}>
          <AnswerProvider pollId={id} dates={poll.dates} hours={hours} mine={mine}>
            <ResultsProvider pollId={id} initial={readResults(id, poll, now)}>
              <PollTabs
                opening={mine ? "Wszyscy" : "Moje"}
                leads={{ Moje: <AnswerLead />, Wszyscy: <ResultsLead /> }}
                bodies={{ Moje: <AnswerBody />, Wszyscy: <ResultsBody /> }}
              />
            </ResultsProvider>
          </AnswerProvider>
        </div>
      </main>
    </div>
  );
}

import { findMyAnswer } from "@/modules/answer-poll";
import { AnswerBody, AnswerLead, AnswerProvider } from "@/modules/answer-poll/client";
import { clearFinal, deletePoll, findPoll, organiserToken, setFinal } from "@/modules/create-poll";
import { readResults } from "@/modules/view-results";
import { FinalTime, ResultsBody, ResultsLead, ResultsProvider } from "@/modules/view-results/client";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "../../app-header";
import frame from "../../page-frame.module.css";
import { answeredCount } from "./answered-count";
import styles from "./poll-page.module.css";
import { PollTabs } from "./poll-tabs";
import { ZoneNote } from "./zone-note";

export default async function PollPage({ params }: PageProps<"/e/[id]">) {
  const { id } = await params;
  const now = new Date();
  const poll = findPoll(id, now);
  if (!poll) notFound();
  const mine = await findMyAnswer(id);
  const token = await organiserToken(id);
  const organiser = token
    ? {
        title: poll.title,
        token,
        setFinal: setFinal.bind(null, id),
        clearFinal: clearFinal.bind(null, id),
        deletePoll: deletePoll.bind(null, id),
      }
    : undefined;
  const hours = Array.from({ length: poll.lastHour - poll.firstHour }, (_, index) => poll.firstHour + index);

  return (
    <div className={`${frame.frame} ${styles.page}`}>
      <AppHeader aside={<Text variant="meta">{answeredCount(poll.respondentCount)}</Text>} />
      <main className={styles.main}>
        <AnswerProvider pollId={id} dates={poll.dates} hours={hours} mine={mine}>
          <ResultsProvider pollId={id} initial={readResults(id, poll, now)} organiser={organiser}>
            <div className={styles.head}>
              <div className={styles.asker}>
                <Avatar name={poll.organiserName} />
                <Text variant="meta">{poll.organiserName} pyta</Text>
              </div>
              <Text as="h1" variant="title">
                {poll.title}
              </Text>
              <ZoneNote pollZone={poll.timeZone} />
              <FinalTime />
            </div>
            <div className={styles.tabs}>
              <PollTabs
                opening={mine ? "Wszyscy" : "Moje"}
                leads={{ Moje: <AnswerLead />, Wszyscy: <ResultsLead /> }}
                bodies={{ Moje: <AnswerBody />, Wszyscy: <ResultsBody /> }}
              />
            </div>
          </ResultsProvider>
        </AnswerProvider>
      </main>
      <footer className={styles.footer}>
        <Link href="/" className={styles.create}>
          Zrób własną ankietę
        </Link>
      </footer>
    </div>
  );
}

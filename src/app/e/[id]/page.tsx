import { findMyAnswer, nameKey } from "@/modules/answer-poll";
import { AnswerBody, AnswerLead, AnswerProvider } from "@/modules/answer-poll/client";
import { clearFinal, deletePoll, findPoll, organiserToken, setFinal } from "@/modules/create-poll";
import { readResults } from "@/modules/view-results";
import { FinalTime, InviteCard, ResultsBody, ResultsLead, ResultsProvider } from "@/modules/view-results/client";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import { Morph, pollTitleMorph } from "@/shared/morph";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "../../app-header";
import { PageFrame } from "../../page-frame";
import { answeredCount } from "./answered-count";
import "./poll-page.css";
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
    <PageFrame>
      <AppHeader aside={<Text variant="meta">{answeredCount(poll.respondentCount)}</Text>} />
      <main data-poll-main className="pt-1 pb-8">
        <AnswerProvider pollId={id} dates={poll.dates} hours={hours} mine={mine}>
          <ResultsProvider pollId={id} initial={readResults(id, poll, now)} organiser={organiser}>
            <div data-poll-head>
              <div className="mb-2 flex items-center gap-2">
                <Avatar name={poll.organiserName} tintKey={nameKey(poll.organiserName)} />
                <Text variant="meta">{poll.organiserName} pyta</Text>
              </div>
              <Morph name={pollTitleMorph}>
                <Text as="h1" variant="title">
                  {poll.title}
                </Text>
              </Morph>
              <ZoneNote pollZone={poll.timeZone} />
              <FinalTime />
              <InviteCard pollId={id} poll={poll} />
            </div>
            <div data-poll-tabs className="mt-5">
              <PollTabs
                opening={mine ? "Wszyscy" : "Moje"}
                leads={{ Moje: <AnswerLead />, Wszyscy: <ResultsLead /> }}
                bodies={{ Moje: <AnswerBody />, Wszyscy: <ResultsBody /> }}
              />
            </div>
          </ResultsProvider>
        </AnswerProvider>
      </main>
      <footer className="flex justify-center pb-8">
        <Link href="/" className="inline-flex min-h-target items-center text-button font-medium text-muted underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Zrób własną ankietę
        </Link>
      </footer>
    </PageFrame>
  );
}

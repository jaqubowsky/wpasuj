import { findMyAnswer, nameKey } from "@/modules/answer-poll";
import { AnswerBody, AnswerLead, AnswerProvider, AnswerStatus } from "@/modules/answer-poll/client";
import { clearFinal, deletePoll, findPoll, organiserToken, setFinal } from "@/modules/create-poll";
import { readResults } from "@/modules/view-results";
import { BestNow, InviteCard, Invitation, OrganiserCard, PeoplePanel, RespondentCount, ResultsBody, ResultsProvider, SetBadge, UntilSet, WhilePollLives } from "@/modules/view-results/client";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { Text } from "@/shared/ui/text/text";
import { Morph, pollTitleMorph } from "@/shared/morph";
import { siteUrl } from "@/shared/site-url";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "../../app-header";
import { PageFrame } from "../../page-frame";
import { PollGone } from "./poll-gone";
import { PollTabs } from "./poll-tabs";
import { ZoneNote } from "./zone-note";

export async function generateMetadata({ params }: PageProps<"/e/[id]">): Promise<Metadata> {
  const { id } = await params;
  const poll = findPoll(id, new Date());
  if (!poll) return {};
  const question = `Kiedy możesz? ${poll.title}`;
  return {
    metadataBase: await siteUrl(),
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
  const hours = Array.from({ length: poll.hourCount }, (_, index) => poll.firstHour + index);

  return (
    <PageFrame wide>
      <AnswerProvider pollId={id} dates={poll.dates} hours={hours} mine={mine} fixedName={token && poll.organiserName}>
        <ResultsProvider pollId={id} initial={readResults(id, poll, now, (await cookies()).get(id)?.value)} organiser={organiser} organiserKey={nameKey(poll.organiserName)}>
          <AppHeader
            aside={
              <UntilSet invitation={<SetBadge />}>
                <RespondentCount />
              </UntilSet>
            }
          />
          <WhilePollLives gone={<PollGone />}>
            <main className="flex flex-col gap-4 pt-1 pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-10 lg:gap-y-6">
              <div className="grid gap-2 lg:col-span-2">
                <div className="flex min-h-8 items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={poll.organiserName} tintKey={nameKey(poll.organiserName)} />
                    <Text variant="meta">
                      <UntilSet invitation={token ? "Ustalone przez Ciebie" : `Ustalone przez: ${poll.organiserName}`}>{token ? `Pytasz jako ${poll.organiserName}` : `${poll.organiserName} pyta`}</UntilSet>
                    </Text>
                  </div>
                  {token && (
                    <UntilSet invitation={null}>
                      <AnswerStatus />
                    </UntilSet>
                  )}
                </div>
                <Morph name={pollTitleMorph}>
                  <Text as="h1" variant="title">
                    {poll.title}
                  </Text>
                </Morph>
                <ZoneNote pollZone={poll.timeZone} />
                <UntilSet invitation={null}>
                  <InviteCard pollId={id} title={poll.title} />
                </UntilSet>
              </div>
              <UntilSet invitation={<Invitation title={poll.title} />}>
                <div className="contents lg:col-start-2 lg:row-start-2 lg:flex lg:flex-col lg:gap-4" data-poll-panel>
                  <BestNow />
                  <OrganiserCard />
                  <PeoplePanel />
                </div>
                <div className="lg:col-start-1 lg:row-start-2">
                  <PollTabs opening={mine ? "Wszyscy" : "Moje"} leads={{ Moje: <AnswerLead /> }} bodies={{ Moje: <AnswerBody />, Wszyscy: <ResultsBody /> }} />
                </div>
              </UntilSet>
            </main>
            <footer className="flex justify-center pb-8">
              <Link href="/" className="inline-flex min-h-11 items-center text-base font-medium text-muted underline underline-offset-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                Zrób własną ankietę
              </Link>
            </footer>
          </WhilePollLives>
        </ResultsProvider>
      </AnswerProvider>
    </PageFrame>
  );
}

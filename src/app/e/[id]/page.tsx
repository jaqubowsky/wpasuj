import { findMyAnswer, nameKey } from "@/modules/answer-poll";
import { AnswerBody, AnswerLead, AnswerProvider, AnswerStatus } from "@/modules/answer-poll/client";
import { clearFinal, deletePoll, findPoll, organiserToken, setFinal } from "@/modules/create-poll";
import { readResults } from "@/modules/view-results";
import {
  BestNow,
  InviteCard,
  Invitation,
  OrganiserCard,
  PeoplePanel,
  RespondentCount,
  ResultsBody,
  ResultsProvider,
  SetBadge,
  SettledPoster,
  UntilSet,
  WhilePollLives,
} from "@/modules/view-results/client";
import { Avatar } from "@/shared/ui/avatar/avatar";
import { PageFrame } from "@/shared/ui/page-frame/page-frame";
import { PollPoster } from "@/shared/ui/poll-poster/poll-poster";
import { SiteLinks } from "@/shared/ui/site-links/site-links";
import { TextLink } from "@/shared/ui/text-link/text-link";
import { pollTitleMorph } from "@/shared/morph";
import { siteUrl } from "@/shared/site-url";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AppHeader } from "../../app-header";
import { PollGone } from "./poll-gone";
import { PollTabs } from "./poll-tabs";
import { RefreshAfterSave } from "./refresh-after-save";
import { ZoneNote } from "./zone-note";
import "./poll-page.css";

const unlisted = { index: false, follow: false };

export async function generateMetadata({ params }: PageProps<"/e/[id]">): Promise<Metadata> {
  const { id } = await params;
  const poll = findPoll(id, new Date());

  if (!poll) return { robots: unlisted };

  const question = `Kiedy możesz? ${poll.title}`;

  return {
    metadataBase: siteUrl(),
    title: question,
    description: question,
    openGraph: { title: question, description: question },
    robots: unlisted,
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

  const tone = token ? "ink" : "coral";

  return (
    <AnswerProvider pollId={id} dates={poll.dates} hours={hours} mine={mine} fixedName={token && poll.organiserName}>
      <ResultsProvider
        pollId={id}
        initial={readResults(id, poll, now, (await cookies()).get(id)?.value)}
        organiser={organiser}
        organiserKey={nameKey(poll.organiserName)}
      >
        <RefreshAfterSave />
        <AppHeader
          aside={
            <UntilSet invitation={<SetBadge />}>
              {token && (
                <WhilePollLives gone={null}>
                  <AnswerStatus />
                </WhilePollLives>
              )}
            </UntilSet>
          }
        />
        <WhilePollLives
          gone={
            <PageFrame>
              <PollGone />
            </PageFrame>
          }
        >
          <main>
            <UntilSet
              invitation={
                <SettledPoster
                  eyebrow={
                    <>
                      <Avatar name={poll.organiserName} tintKey={nameKey(poll.organiserName)} />
                      <span>{poll.title}</span>
                    </>
                  }
                  setBy={token ? "Ustalone przez Ciebie" : `Ustalone przez: ${poll.organiserName}`}
                />
              }
            >
              <PollPoster
                tone={tone}
                eyebrow={
                  <>
                    <Avatar name={poll.organiserName} tintKey={nameKey(poll.organiserName)} />
                    <span>{token ? `Pytasz jako ${poll.organiserName}` : `${poll.organiserName} pyta`}</span>
                  </>
                }
                title={poll.title}
                morph={pollTitleMorph}
              >
                <RespondentCount ground={tone} />
              </PollPoster>
            </UntilSet>
            <PageFrame wide>
              <div className="lg:pt-8">
                <div className="grid gap-2 pt-1 pb-3 empty:hidden lg:pb-5">
                  <ZoneNote pollZone={poll.timeZone} />
                  <UntilSet invitation={null}>
                    <InviteCard pollId={id} title={poll.title} />
                  </UntilSet>
                </div>
                <div className="flex flex-col gap-4 pt-1 pb-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-x-10 lg:gap-y-6">
                  <UntilSet invitation={<Invitation title={poll.title} timeZone={poll.timeZone} />}>
                    <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-4" data-poll-panel>
                      <BestNow />
                      <OrganiserCard />
                      <PeoplePanel />
                    </div>
                    <div className="lg:col-start-1 lg:row-start-1">
                      <PollTabs
                        opening={mine ? "Wszyscy" : "Moje"}
                        leads={{ Moje: <AnswerLead /> }}
                        bodies={{ Moje: <AnswerBody />, Wszyscy: <ResultsBody /> }}
                      />
                    </div>
                  </UntilSet>
                </div>
              </div>
            </PageFrame>
          </main>
          <footer className="flex flex-col items-center gap-2 pb-8">
            <div className="flex" data-poll-footer-invite>
              <TextLink href="/">Zrób własną ankietę</TextLink>
            </div>
            <SiteLinks />
          </footer>
        </WhilePollLives>
      </ResultsProvider>
    </AnswerProvider>
  );
}

import { PosterCard } from "@/shared/ui/poster-card/poster-card";
import { posters } from "../../domain/posters";
import "./wall.css";

const lanes = [
  { name: "front", posters },
  { name: "back", posters: [...posters.slice(6), ...posters.slice(0, 6)] },
];

function Lane({ items }: { items: typeof posters }) {
  return items.map((poster) => (
    <div key={poster.title} className="odd:-rotate-3 even:rotate-2">
      <PosterCard {...poster} size="large" />
    </div>
  ));
}

export function Wall() {
  return (
    <section aria-labelledby="wall-heading" className="overflow-hidden bg-accent pt-27.5 pb-30 text-ink" data-wall>
      <h2
        id="wall-heading"
        className="m-0 mb-14 px-5 text-center font-display text-5xl font-extrabold tracking-tighter text-balance lg:text-8xl"
      >
        Na grill, na urodziny,
        <br />
        na <em className="text-paper not-italic">wszystko</em>
      </h2>
      {lanes.map((lane) => (
        <div key={lane.name} className="flex w-max py-3" data-wall-lane={lane.name} data-idle-motion>
          <div className="flex gap-5.5 pr-5.5">
            <Lane items={lane.posters} />
          </div>
          <div className="flex gap-5.5 pr-5.5" aria-hidden="true" inert>
            <Lane items={lane.posters} />
          </div>
        </div>
      ))}
    </section>
  );
}

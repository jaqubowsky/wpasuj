import type { OrganiserProblem as Problem } from "./use-is-organiser";

const problems: Record<Problem, string> = {
  invalid: "Nie udało się ustalić terminu. Odśwież stronę i spróbuj jeszcze raz.",
  "not-organiser": "To urządzenie nie jest już organizatorem tej ankiety. Otwórz na nim link organizatora.",
  failed: "Nie udało się. Sprawdź internet i spróbuj jeszcze raz.",
};

export function OrganiserProblem({ problem }: { problem: Problem }) {
  return (
    <p className="m-0 text-sm text-accent-ink" role="alert">
      {problems[problem]}
    </p>
  );
}

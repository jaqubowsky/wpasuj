import styles from "./results.module.css";
import type { OrganiserProblem as Problem } from "./use-is-organiser";

const problems: Record<Problem, string> = {
  invalid: "Nie udało się ustalić terminu. Odśwież stronę i spróbuj jeszcze raz.",
  "not-organiser": "To urządzenie nie jest już organizatorem tej ankiety.",
  failed: "Nie udało się. Sprawdź internet i spróbuj jeszcze raz.",
};

export function OrganiserProblem({ problem }: { problem: Problem }) {
  return (
    <p className={styles.problem} role="alert">
      {problems[problem]}
    </p>
  );
}

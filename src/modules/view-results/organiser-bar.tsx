"use client";

import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Text } from "@/shared/ui/text/text";
import { useId } from "react";
import styles from "./organiser-bar.module.css";
import { useOrganiserBar, type BarNotice } from "./use-organiser-bar";

const notices: Record<BarNotice, string> = {
  "reminder-copied": "Wiadomość skopiowana. Wklej ją na grupę.",
  "link-copied": "Link skopiowany.",
  "organiser-link-copied": "Link organizatora skopiowany.",
  "not-copied": "Nie udało się skopiować. Spróbuj jeszcze raz.",
};

type OrganiserBarProps = Parameters<typeof useOrganiserBar>[0] & { onDelete: () => void };

export function OrganiserBar({ onDelete, ...input }: OrganiserBarProps) {
  const bar = useOrganiserBar(input);
  const menuId = useId();

  return (
    <div className={styles.bar} data-organiser-bar>
      <div className={styles.row}>
        <Button onClick={bar.remind}>Przypomnij</Button>
        <Button aria-expanded={bar.menuOpen} aria-controls={menuId} onClick={bar.toggleMenu}>
          Więcej
        </Button>
      </div>
      {bar.menuOpen && (
        <div id={menuId}>
          <Card>
            <div className={styles.menu}>
              <Button block onClick={bar.copyLink}>
                Kopiuj link
              </Button>
              <div>
                <Button block onClick={bar.copyOrganiserLink}>
                  Link organizatora
                </Button>
                <p className={styles.note}>
                  Otwórz go na swoim drugim urządzeniu. Nie wysyłaj go na grupę: kto go ma, może ustalić termin i usunąć ankietę.
                </p>
              </div>
              {bar.confirmingDelete ? (
                <div className={styles.confirm}>
                  <Text as="p" variant="body">
                    Usunąć ankietę razem z odpowiedziami? Tego nie da się cofnąć.
                  </Text>
                  <div className={styles.row}>
                    <Button variant="primary" onClick={onDelete}>
                      Tak, usuń
                    </Button>
                    <Button variant="text" onClick={bar.keepPoll}>
                      Nie, zostaw
                    </Button>
                  </div>
                </div>
              ) : (
                <Button block onClick={bar.askToDelete}>
                  Usuń ankietę
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
      <p className={styles.notice} role="status">
        {bar.notice && notices[bar.notice]}
      </p>
    </div>
  );
}

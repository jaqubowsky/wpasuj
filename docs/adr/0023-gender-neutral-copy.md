# ADR 0023: Copy never guesses a name's grammatical gender

- **Status:** Accepted
- **Date:** 2026-09-28
- **Owner:** container
- **Replaces:** `name-clash-copy` (former decision entries)

## Context

Polish past-tense verbs agree with the subject's gender, and the app cannot know a name's gender. The boards write gendered lines.

## Decision

The name clash reads "To Ty, {imię}?" with "Na innym telefonie, {n} godzin" and "Tak, to ja" / "To nie ja", where board NameClash writes "Ola już odpowiedziała" and "Inna Ola" (WPA-42). The same rule gives "Ustalone przez: Kuba" and "Ustalone przez Ciebie" where the boards write "Kuba ustalił termin" (WPA-43).

## Consequences

Copying a board's gendered line misgenders every name of the other gender.

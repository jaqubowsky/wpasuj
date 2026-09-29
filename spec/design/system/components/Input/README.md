# Input

A single line of text: a name. The poll title is `TitleInput`. Wrapped in `wp-field` with its label above.

- The consumer provides the label, the value, and an error line when there is one.
- Text is 16px or larger, so iOS does not zoom on focus; names get `autocomplete="given-name"` and `enterkeyhint="done"`.
- Default: 56px, `surface`, `edge` border, `radius-control`; focus: 2px `ink`; error: 2px `accent-ink` with the message under it in `accent-ink`.
- `compact`: the participant's name on the poll page. Bricolage 800 at `text-2xl` (`lg:text-3xl`) on a 3px `ink` underline, no box; focus thickens the underline to 5px, an error turns it `accent-ink`, as `TitleInput` does. Its label is Onest 14px 600 with the Status on the right.
- Placeholders show an example ("Piwo, planszówki, kino…"), never the label.

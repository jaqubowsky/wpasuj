# Input

A single line of text: the poll title or a name. Wrapped in `wp-field` with its label above.

- The consumer provides the label, the value, and an error line when there is one.
- Text is 16px or larger, so iOS does not zoom on focus; names get `autocomplete="given-name"` and `enterkeyhint="done"`.
- Default: 56px, `surface`, `edge` border, `radius-control`; focus: 2px `ink`; error: 2px `accent-ink` with the message under it in `accent-ink`.
- `data-variant="title"`: the create form's big title field, set in `title` on an ink underline, no box.
- Placeholders show an example ("Piwo, planszówki, kino…"), never the label.

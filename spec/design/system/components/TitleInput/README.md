# TitleInput

The create form's title, set as the section headline: what the group will read at the top of the poll.

- A textarea that grows with its text and wraps (`field-sizing: content`); Enter sends the form, as in a single-line field.
- Display 800, `text-5xl`, `lg:text-8xl`, on a 5px `ink` underline (7px on focus, `accent-ink` with an error line under it in `accent-ink`); no box.
- The label stays for screen readers only; the placeholder asks the question ("Co robimy?").

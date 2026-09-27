import { webApplication } from "../domain/web-application";

export function WebApplicationJsonLd({ home }: { home: URL }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplication(home)).replace(/</g, "\\u003c") }}
    />
  );
}

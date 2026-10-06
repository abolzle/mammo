"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { lookupEvidence, lookupSource, type LoadedContent } from "@/lib/content/load";

export function SourceDrawer({ evidenceIds, content }: { evidenceIds: string[]; content: LoadedContent }) {
  const rows = lookupEvidence(content, evidenceIds);
  if (!rows.length) return null;
  return (
    <Accordion>
      <AccordionItem value="sources">
        <AccordionTrigger className="min-h-11 text-sm">Check the sources for this item</AccordionTrigger>
        <AccordionContent className="space-y-3 text-sm">
          {rows.map((ev) => {
            const src = lookupSource(content, ev.sourceId);
            return (
              <div key={ev.id} className="rounded-md bg-muted/60 p-3">
                <p className="font-medium">{src?.title ?? ev.sourceId}</p>
                <p className="text-muted-foreground">{ev.locator}</p>
                <p className="mt-1">{ev.claim}</p>
                {ev.citation === "quoted_public" && ev.excerpt ? (
                  <blockquote className="mt-2 border-l-2 border-teal pl-3 text-muted-foreground">{ev.excerpt}</blockquote>
                ) : (
                  <p className="mt-2 text-muted-foreground">
                    Mammo explains this point in original wording. Open the source to read the official text.
                  </p>
                )}
                {src ? (
                  <a className="mt-2 inline-block text-teal underline" href={src.url} target="_blank" rel="noreferrer">
                    Open source
                  </a>
                ) : null}
              </div>
            );
          })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

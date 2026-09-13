"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { renderEmailHtml } from "@/lib/markdown";

export function EmailPreview({
  to,
  subject,
  body,
}: {
  to?: string;
  subject: string;
  body: string;
}) {
  return (
    <Tabs defaultValue="desktop">
      <TabsList>
        <TabsTrigger value="desktop">Desktop preview</TabsTrigger>
        <TabsTrigger value="mobile">Mobile preview</TabsTrigger>
      </TabsList>
      <TabsContent value="desktop">
        <PreviewFrame to={to} subject={subject} body={body} className="max-w-2xl" />
      </TabsContent>
      <TabsContent value="mobile">
        <PreviewFrame to={to} subject={subject} body={body} className="max-w-xs" />
      </TabsContent>
    </Tabs>
  );
}

function PreviewFrame({
  to,
  subject,
  body,
  className,
}: {
  to?: string;
  subject: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={`mx-auto rounded-xl border border-border bg-white shadow-sm ${className}`}>
      <div className="space-y-1 border-b border-border px-4 py-3 text-xs text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">To:</span> {to || "recipient@example.com"}
        </p>
        <p>
          <span className="font-medium text-foreground">Subject:</span> {subject || "(no subject)"}
        </p>
      </div>
      <div
        className="prose prose-sm max-w-none px-4 py-4 text-[13.5px] text-foreground [&_p]:mb-3 [&_ul]:mb-3"
        dangerouslySetInnerHTML={{ __html: renderEmailHtml(body) }}
      />
    </div>
  );
}

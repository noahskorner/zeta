import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border">
              <span className="text-sm font-semibold">S</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Sparky Desktop</div>
              <div className="text-xs text-muted-foreground">Local-first tools</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">v0.1</Badge>
            <Button size="sm" variant="outline">
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
          <p className="text-sm text-muted-foreground">
            Quick actions and recent activity. Keep it simple.
          </p>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Start something in one click.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button>New Project</Button>
                <Button variant="secondary">Open Repo</Button>
                <Button variant="outline">Import Tasks</Button>
              </div>

              <Separator className="my-2" />

              <div className="flex items-center gap-2">
                <Input placeholder="Search tasks, files, prompts..." />
                <Button variant="outline">Search</Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Tip: map these to keyboard shortcuts later.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent</CardTitle>
              <CardDescription>Your last few things.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                { name: "NFPA LiNK indexing", meta: "Updated 12m ago", tag: "Work" },
                { name: "Agentic task runner", meta: "Updated 2h ago", tag: "Side" },
                { name: "Golf mobility plan", meta: "Updated yesterday", tag: "Life" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.meta}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.tag}</Badge>
                    <Button size="sm" variant="ghost">
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>At-a-glance metrics (placeholder).</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Stat label="Active tasks" value="12" />
              <Stat label="Queued jobs" value="3" />
              <Stat label="Last sync" value="Local" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Scratchpad (placeholder).</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input placeholder="Write a note..." />
              <Button variant="secondary">Save</Button>
              <p className="text-xs text-muted-foreground">
                Later: persist to a local sqlite/db and show history.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>Ready.</span>
          <span>⌘K to search (soon)</span>
        </div>
      </footer>
    </div>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-muted-foreground">{props.label}</div>
      <div className="mt-1 text-lg font-semibold">{props.value}</div>
    </div>
  );
}

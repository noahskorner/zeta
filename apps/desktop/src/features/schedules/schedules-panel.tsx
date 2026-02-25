import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

const mockedSchedules = [
  {
    id: 'sched-nightly-review',
    name: 'Nightly Repo Review',
    cadence: 'Daily at 1:00 AM',
    status: 'enabled',
    description: 'Scans repository state and surfaces stale task links.',
  },
  {
    id: 'sched-spec-sync',
    name: 'Spec Sync',
    cadence: 'Weekdays at 9:00 AM',
    status: 'enabled',
    description: 'Checks PRODUCT.md drift and recommends spec updates.',
  },
  {
    id: 'sched-task-normalization',
    name: 'Task Cleanup',
    cadence: 'Every Sunday at 3:30 AM',
    status: 'enabled',
    description: 'Normalizes task metadata and closes orphaned references.',
  },
] as const;

export function SchedulesPanel() {
  return (
    <div className="w-full space-y-4">
      <div className="w-full flex items-center justify-between gap-3 rounded-md border p-4">
        <div className="text-sm text-muted-foreground">
          Scheduled jobs that keep specs, tasks, and repository state synchronized.
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockedSchedules.map((schedule) => (
          <Card key={schedule.id} className="gap-2">
            <CardHeader>
              <CardTitle className="text-base">{schedule.name}</CardTitle>
              <CardDescription>{schedule.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <div>cadence: {schedule.cadence}</div>
              <div className="font-mono">id: {schedule.id}</div>
              <div className="pt-2">
                <Badge variant="outline">
                  {schedule.status === 'enabled' ? 'Enabled' : 'Paused'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

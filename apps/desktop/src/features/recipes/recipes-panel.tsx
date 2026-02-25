import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

type MockRecipe = {
  id: string;
  name: string;
  description: string;
  inputs: string[];
  steps: string[];
  outputs: string[];
  stopConditions: string[];
  status: 'Ready' | 'Needs input' | 'Failed';
  updatedAt: string;
};

const mockedRecipes: MockRecipe[] = [
  {
    id: 'recipe-research',
    name: 'ResearchRecipe',
    description: 'Collects context and documents findings for downstream work.',
    inputs: ['task', 'repo', 'constraints', 'prior artifacts'],
    steps: ['run search tools', 'inspect repository files', 'summarize findings'],
    outputs: ['RESEARCH.md'],
    stopConditions: ['needs user input', 'done', 'failed'],
    status: 'Ready',
    updatedAt: '2026-02-24T11:32:00.000Z',
  },
  {
    id: 'recipe-plan',
    name: 'PlanRecipe',
    description: 'Converts research into an implementation-ready plan.',
    inputs: ['RESEARCH.md', 'repo constraints'],
    steps: ['analyze findings', 'draft execution plan', 'validate risks'],
    outputs: ['PLAN.md'],
    stopConditions: ['needs user input', 'done', 'failed'],
    status: 'Needs input',
    updatedAt: '2026-02-24T11:49:00.000Z',
  },
  {
    id: 'recipe-implement',
    name: 'ImplementRecipe',
    description: 'Executes planned changes and records delivery artifacts.',
    inputs: ['PLAN.md', 'repo'],
    steps: ['apply code edits', 'run validation checks', 'publish summary'],
    outputs: ['code changes', 'CHANGELOG.md'],
    stopConditions: ['needs user input', 'done', 'failed'],
    status: 'Ready',
    updatedAt: '2026-02-24T12:10:00.000Z',
  },
];

export function RecipesPanel() {
  const isLoadingRecipes = false;
  const errorMessage: string | null = null;
  const recipes = mockedRecipes;

  return (
    <div className="w-full space-y-4">
      {/* Clarify that recipes define reusable procedures, not models or tool runtimes. */}
      <div className="w-full flex items-center justify-between gap-3 rounded-md border p-4">
        <div className="text-sm text-muted-foreground">
          Recipes define reusable procedures: inputs, steps, outputs, and stop conditions.
        </div>
      </div>

      {/* Surface loading and errors before rendering the list. */}
      {isLoadingRecipes ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">Loading recipes...</CardContent>
        </Card>
      ) : null}
      {errorMessage ? (
        <Card className="border-destructive/50">
          <CardContent className="text-sm text-destructive">
            Failed to load recipes: {errorMessage}
          </CardContent>
        </Card>
      ) : null}

      {/* Render mock recipes in a card grid that mirrors the tools panel layout. */}
      {!isLoadingRecipes && !errorMessage && recipes.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            No recipes have been defined yet.
          </CardContent>
        </Card>
      ) : null}
      {!isLoadingRecipes && !errorMessage && recipes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="gap-2">
              <CardHeader>
                <CardTitle className="text-base">{recipe.name}</CardTitle>
                <CardDescription>{recipe.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div>status: {recipe.status}</div>
                <div>inputs: {recipe.inputs.join(', ')}</div>
                <div>steps: {recipe.steps.join(' -> ')}</div>
                <div>outputs: {recipe.outputs.join(', ')}</div>
                <div>stop: {recipe.stopConditions.join(', ')}</div>
                <div className="font-mono">id: {recipe.id}</div>
                <div>updated: {formatUpdatedAt(recipe.updatedAt)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatUpdatedAt(updatedAt: string): string {
  const parsedDate = new Date(updatedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return updatedAt;
  }

  return parsedDate.toLocaleString();
}

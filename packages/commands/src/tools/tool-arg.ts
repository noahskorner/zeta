export type ToolArgValue = {
  type: 'literal' | 'template';
  value: string;
};

export type ToolArg =
  | { t: 'literal'; v: string }
  | { t: 'template'; v: string }
  | { t: 'flag'; name: string }
  | { t: 'param'; name: string; value: ToolArgValue };

// Keep argument names predictable by ensuring GNU-style -- prefixes.
function normalizeArgName(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return '';
  }

  return trimmedName.startsWith('-') ? trimmedName : `--${trimmedName}`;
}

// Validate and normalize structured tool args before persistence.
export function normalizeToolArgs(args: ToolArg[] | undefined): ToolArg[] | undefined {
  if (!args || args.length === 0) {
    return undefined;
  }

  const normalizedArgs = args
    .map((arg, index): ToolArg => {
      if (arg.t === 'literal' || arg.t === 'template') {
        const value = arg.v.trim();
        if (!value) {
          throw new Error(`Argument ${index + 1} must include a value.`);
        }

        return { t: arg.t, v: value };
      }

      if (arg.t === 'flag') {
        const name = normalizeArgName(arg.name);
        if (!name) {
          throw new Error(`Flag argument ${index + 1} must include a name.`);
        }

        return { t: 'flag', name };
      }

      const name = normalizeArgName(arg.name);
      if (!name) {
        throw new Error(`Param argument ${index + 1} must include a name.`);
      }

      const value = arg.value.value.trim();
      if (!value) {
        throw new Error(`Param argument ${index + 1} must include a value.`);
      }

      return {
        t: 'param',
        name,
        value: {
          type: arg.value.type,
          value,
        },
      };
    })
    .filter(Boolean);

  return normalizedArgs.length > 0 ? normalizedArgs : undefined;
}

// Flatten structured args into argv tokens for spawning processes.
export function renderToolArgs(args: ToolArg[] | undefined): string[] {
  if (!args || args.length === 0) {
    return [];
  }

  return args.flatMap((arg) => {
    if (arg.t === 'literal' || arg.t === 'template') {
      return [arg.v];
    }

    if (arg.t === 'flag') {
      return [arg.name];
    }

    return [arg.name, arg.value.value];
  });
}

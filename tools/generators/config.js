const packageNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const componentNamePattern = /^[A-Z][A-Za-z0-9]*$/;

module.exports = function generator(plop) {
  // Register a reusable generator for React component packages.
  plop.setGenerator("react-package", {
    description: "Scaffold a React component package under packages/",
    prompts: [
      {
        type: "input",
        name: "packageName",
        message: "Package name (kebab-case, without @zeta/):",
        validate(value) {
          return packageNamePattern.test(value)
            ? true
            : "Use kebab-case (letters, numbers, and dashes only).";
        }
      },
      {
        type: "input",
        name: "componentName",
        message: "Root component name (PascalCase):",
        validate(value) {
          return componentNamePattern.test(value)
            ? true
            : "Use PascalCase (for example: TaskCard).";
        }
      },
      {
        type: "input",
        name: "description",
        message: "Package description:",
        default(answers) {
          return `UI components for ${answers.packageName}`;
        }
      },
      {
        type: "confirm",
        name: "includeStyles",
        message: "Include a CSS file scaffold?",
        default: true
      }
    ],
    actions: [
      // Create package-level metadata and TypeScript configuration.
      {
        type: "add",
        path: "packages/{{dashCase packageName}}/package.json",
        templateFile: "tools/generators/templates/react-package/package.json.hbs"
      },
      {
        type: "add",
        path: "packages/{{dashCase packageName}}/tsconfig.json",
        templateFile: "tools/generators/templates/react-package/tsconfig.json.hbs"
      },
      // Create a consistent source layout with component and type exports.
      {
        type: "add",
        path: "packages/{{dashCase packageName}}/src/index.ts",
        templateFile: "tools/generators/templates/react-package/src/index.ts.hbs"
      },
      {
        type: "add",
        path: "packages/{{dashCase packageName}}/src/types.ts",
        templateFile: "tools/generators/templates/react-package/src/types.ts.hbs"
      },
      {
        type: "add",
        path: "packages/{{dashCase packageName}}/src/components/index.ts",
        templateFile: "tools/generators/templates/react-package/src/components/index.ts.hbs"
      },
      {
        type: "add",
        path: "packages/{{dashCase packageName}}/src/components/{{dashCase componentName}}.tsx",
        templateFile: "tools/generators/templates/react-package/src/components/component.tsx.hbs"
      },
      {
        type: "add",
        path: "packages/{{dashCase packageName}}/src/styles.css",
        templateFile: "tools/generators/templates/react-package/src/styles.css.hbs",
        skip(answers) {
          return answers.includeStyles ? false : "Style scaffold disabled";
        }
      }
    ]
  });
};

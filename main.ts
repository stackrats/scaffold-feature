import { Checkbox, Input, Select } from "@cliffy/prompt";
import { ensureDir, exists } from "@std/fs";
import { join } from "@std/path";

function toPascalCase(str: string): string {
  return str.replace(
    /(?:^|-)(\w)/g,
    (_: string, char: string) => char.toUpperCase(),
  );
}

function toCamelCase(str: string): string {
  return str
    .replace(/-([a-z])/g, (_: string, char: string) => char.toUpperCase())
    .replace(/-/g, "");
}

function isKebabCase(str: string): boolean {
  return /^[a-z]+(-[a-z]+)*$/.test(str);
}

function isKebabCasePath(str: string): boolean {
  // Split the string by forward slash or backslash
  const segments = str.split(/[\/\\]+/);
  // Check if each segment is in kebab-case
  return segments.every((segment) => isKebabCase(segment));
}

// Define interfaces for better type safety
interface FileEntry {
  name: string;
  template: string;
}

interface FileToCreate extends FileEntry {
  path: string;
}

type DirectoryConfig = Record<string, FileEntry[]>;

interface GetMethodConfig {
  model: DirectoryConfig;
  collection: DirectoryConfig;
  paginate: DirectoryConfig;
}

interface FileConfig {
  post: DirectoryConfig;
  get: GetMethodConfig;
  put: DirectoryConfig;
  delete: DirectoryConfig;
}

async function main(): Promise<void> {
  let parentDir = "";
  // Prompt for parent directory and enforce kebab-case for each segment
  while (true) {
    parentDir = await Input.prompt({
      message:
        "Enter parent directory (can include multiple slashes for nested dirs):",
    });

    if (isKebabCasePath(parentDir)) {
      break;
    } else {
      console.log(
        "Parent directory must be in kebab-case (e.g., 'my-parent-dir/sub-dir'). Please try again.",
      );
    }
  }

  let featureName = "";
  // Prompt for feature name and enforce kebab-case
  while (true) {
    featureName = await Input.prompt({
      message: "Enter feature name (kebab-case only):",
    });

    if (isKebabCase(featureName)) {
      break;
    } else {
      console.log(
        "Feature name must be in kebab-case (e.g., 'my-feature-name'). Please try again.",
      );
    }
  }

  enum ApiMethodOptions {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
  }

  // Prompt for API method
  const apiMethod = await Select.prompt<ApiMethodOptions>({
    message: "Choose an API method:",
    options: [
      ApiMethodOptions.GET,
      ApiMethodOptions.POST,
      ApiMethodOptions.PUT,
      ApiMethodOptions.DELETE,
    ],
  }) as ApiMethodOptions;

  enum ApiMethodGetReturnTypeOptions {
    MODEL = "model",
    COLLECTION = "collection",
    PAGINATE = "paginate",
  }

  let getReturnType: ApiMethodGetReturnTypeOptions | undefined = undefined;
  if (apiMethod === ApiMethodOptions.GET) {
    // Prompt for GET action return type
    getReturnType = await Select.prompt<ApiMethodGetReturnTypeOptions>({
      message: "Select the GET action return type:",
      options: [
        ApiMethodGetReturnTypeOptions.MODEL,
        ApiMethodGetReturnTypeOptions.COLLECTION,
        ApiMethodGetReturnTypeOptions.PAGINATE,
      ],
    }) as ApiMethodGetReturnTypeOptions;
  }

  // Define root path
  const rootPath = "src/features";

  // Construct the full feature path
  const featurePath = parentDir
    ? join(rootPath, parentDir, featureName)
    : join(rootPath, featureName);

  // Configuration object mapping API methods and additional options to files
  const fileConfig: FileConfig = {
    post: {
      api: [
        {
          name: `api-${featureName}.ts`,
          template: "api-template.ts",
        },
      ],
      lib: [
        {
          name: `map-${featureName}-dto-to-req.ts`,
          template: "map-dto-to-req-template.ts",
        },
        {
          name: `map-${featureName}-rsp-to-dto.ts`,
          template: "map-rsp-to-dto-template.ts",
        },
      ],
      "model/factories": [
        {
          name: `${featureName}-dto-factory.ts`,
          template: "dto-factory-template.ts",
        },
      ],
      "model/types/requests": [
        {
          name: `${toPascalCase(featureName)}Req.ts`,
          template: "req-template.ts",
        },
      ],
      "model/types/responses": [
        {
          name: `${toPascalCase(featureName)}Rsp.ts`,
          template: "rsp-template.ts",
        },
      ],
      "model/types": [
        {
          name: `${toPascalCase(featureName)}Dto.ts`,
          template: "dto-template.ts",
        },
      ],
      "model/validation-rules": [
        {
          name: `${featureName}-validation-rules.ts`,
          template: "validation-rules-template.ts",
        },
      ],
      ui: [
        {
          name: `${toPascalCase(featureName)}.vue`,
          template: "vue-template.vue",
        },
      ],
      __tests__: [
        {
          name: `${featureName}.test.ts`,
          template: "test-template.ts",
        },
      ],
    },
    get: {
      model: {
        api: [
          {
            name: `api-${featureName}.ts`,
            template: "api-template.ts",
          },
        ],
        lib: [
          {
            name: `map-${featureName}-rsp-to-dto.ts`,
            template: "map-rsp-to-dto-template.ts",
          },
        ],
        "model/types/responses": [
          {
            name: `${toPascalCase(featureName)}Rsp.ts`,
            template: "rsp-template.ts",
          },
        ],
        "model/types": [
          {
            name: `${toPascalCase(featureName)}Dto.ts`,
            template: "dto-template.ts",
          },
        ],
        ui: [
          {
            name: `${toPascalCase(featureName)}.vue`,
            template: "vue-template.vue",
          },
        ],
        __tests__: [
          {
            name: `${featureName}.test.ts`,
            template: "test-template.ts",
          },
        ],
      },
      collection: {
        api: [
          {
            name: `api-${featureName}.ts`,
            template: "api-template.ts",
          },
        ],
        "model/types/responses": [
          {
            name: `${toPascalCase(featureName)}Rsp.ts`,
            template: "rsp-template.ts",
          },
        ],
        "model/types": [
          {
            name: `${toPascalCase(featureName)}Dto.ts`,
            template: "dto-template.ts",
          },
        ],
        ui: [
          {
            name: `${toPascalCase(featureName)}.vue`,
            template: "vue-template.vue",
          },
        ],
        __tests__: [
          {
            name: `${featureName}.test.ts`,
            template: "test-template.ts",
          },
        ],
      },
      paginate: {
        api: [
          {
            name: `api-${featureName}.ts`,
            template: "api-template.ts",
          },
        ],
        lib: [
          {
            name: `map-${featureName}-rsp-to-dto.ts`,
            template: "map-rsp-to-dto-template.ts",
          },
        ],
        "model/types/responses": [
          {
            name: `${toPascalCase(featureName)}Rsp.ts`,
            template: "rsp-template.ts",
          },
        ],
        "model/types": [
          {
            name: `${toPascalCase(featureName)}Dto.ts`,
            template: "dto-template.ts",
          },
        ],
        ui: [
          {
            name: `${toPascalCase(featureName)}.vue`,
            template: "vue-template.vue",
          },
        ],
        __tests__: [
          {
            name: `${featureName}.test.ts`,
            template: "test-template.ts",
          },
        ],
      },
    },
    put: {
      api: [
        {
          name: `api-${featureName}.ts`,
          template: "api-template.ts",
        },
      ],
      lib: [
        {
          name: `map-${featureName}-dto-to-req.ts`,
          template: "map-dto-to-req-template.ts",
        },
        {
          name: `map-${featureName}-rsp-to-dto.ts`,
          template: "map-rsp-to-dto-template.ts",
        },
      ],
      "model/factories": [
        {
          name: `${featureName}-dto-factory.ts`,
          template: "dto-factory-template.ts",
        },
      ],
      "model/types/requests": [
        {
          name: `${toPascalCase(featureName)}Req.ts`,
          template: "req-template.ts",
        },
      ],
      "model/types/responses": [
        {
          name: `${toPascalCase(featureName)}Rsp.ts`,
          template: "rsp-template.ts",
        },
      ],
      "model/types": [
        {
          name: `${toPascalCase(featureName)}Dto.ts`,
          template: "dto-template.ts",
        },
      ],
      "model/validation-rules": [
        {
          name: `${featureName}-validation-rules.ts`,
          template: "validation-rules-template.ts",
        },
      ],
      ui: [
        {
          name: `${toPascalCase(featureName)}.vue`,
          template: "vue-template.vue",
        },
      ],
      __tests__: [
        {
          name: `${featureName}.test.ts`,
          template: "test-template.ts",
        },
      ],
    },
    delete: {
      api: [
        {
          name: `api-${featureName}.ts`,
          template: "api-template.ts",
        },
      ],
      "model/types/requests": [
        {
          name: `${toPascalCase(featureName)}Req.ts`,
          template: "req-template.ts",
        },
      ],
      ui: [
        {
          name: `${toPascalCase(featureName)}.vue`,
          template: "vue-template.vue",
        },
      ],
      __tests__: [
        {
          name: `${featureName}.test.ts`,
          template: "test-template.ts",
        },
      ],
    },
  };

  // Determine the method configuration based on API method and return type
  let methodConfig: DirectoryConfig;

  if (apiMethod === "get") {
    if (getReturnType) {
      methodConfig = fileConfig.get[getReturnType];
    } else {
      console.log("No return type specified for GET method.");
      return;
    }
  } else {
    methodConfig = fileConfig[apiMethod];
  }

  if (!methodConfig || Object.keys(methodConfig).length === 0) {
    console.log(
      `No file configuration found for API method "${apiMethod}" with return type "${getReturnType}".`,
    );
    return;
  }

  // Extract available directories from the methodConfig
  const availableDirectories = Object.keys(methodConfig);

  // Define the directories you want to select by default if they exist
  const preferredDefaultDirectories = [
    "api",
    "lib",
    "model/types",
    "model/types/requests",
    "model/types/responses",
    "ui",
  ];

  // Compute default selections
  const defaultSelections = availableDirectories.filter((dir) =>
    preferredDefaultDirectories.includes(dir)
  );

  // Prompt to select directories
  const selectedDirectories: string[] = await Checkbox.prompt({
    message: "Select the directories to include for this feature:",
    options: availableDirectories,
    minOptions: 1,
    default: defaultSelections,
  });

  // Ensure selected directories exist
  for (const dir of selectedDirectories) {
    const fullDirPath = join(featurePath, dir);
    await ensureDir(fullDirPath);
  }

  // Set templates directory based on API method and additional options
  let templatesDir = `./templates/scaffold/feature/${apiMethod.toLowerCase()}`;

  // Adjust templates directory for GET return type
  if (apiMethod === "get" && getReturnType) {
    templatesDir = join(templatesDir, getReturnType);
  }

  // Function to get files based on selected directories and API method
  function getFiles(): FileToCreate[] {
    const files: FileToCreate[] = [];

    for (const dir of selectedDirectories) {
      const dirConfig = methodConfig[dir];

      if (dirConfig) {
        for (const file of dirConfig) {
          files.push({
            path: dir,
            name: file.name,
            template: file.template,
          });
        }
      }
    }

    return files;
  }

  // Get the files to create based on selected directories
  const files = getFiles();

  // Create files
  for (const file of files) {
    const dirPath = join(featurePath, file.path);
    const filePath = join(dirPath, file.name);
    const existsFile = await exists(filePath);

    // Ensure the directory exists
    await ensureDir(dirPath);

    if (!existsFile) {
      // Construct the template path
      let templatePath = join(templatesDir, file.template);

      // Check if the template file exists in the specific templatesDir
      if (!(await exists(templatePath))) {
        // If not, check in the common templates directory
        templatePath = join("./templates/scaffold/feature", file.template);
      }

      let content = "";

      // Check if template file exists
      if (await exists(templatePath)) {
        content = await Deno.readTextFile(templatePath);
        // Replace placeholders in the template
        content = content.replace(/\{\{featurePath\}\}/g, featurePath);
        content = content.replace(/\{\{feature-name\}\}/g, featureName);
        content = content.replace(
          /\{\{FeatureName\}\}/g,
          toPascalCase(featureName),
        );
        content = content.replace(
          /\{\{featureName\}\}/g,
          toCamelCase(featureName),
        );
      } else {
        console.log(`Template ${templatePath} not found. Creating empty file.`);
      }

      await Deno.writeTextFile(filePath, content);
      console.log(`Created file: ${filePath}`);
    } else {
      console.log(`File ${filePath} already exists, skipping.`);
    }
  }

  console.log("Feature scaffolding complete.");
}

await main();

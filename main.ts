import { Checkbox, Input, Select } from "@cliffy/prompt";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";

// Utility Functions
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

function isKebabCaseOrUnderscorePathOrUnderscore(str: string): boolean {
  // Split the string by forward slash or backslash
  const segments = str.split(/[\/\\]+/);
  // Check if each segment is in kebab-case
  return segments.every((segment) => {
    // Allow segments starting with underscore, then check rest for kebab-case
    if (segment.startsWith("_")) {
      return isKebabCase(segment.substring(1));
    }
    // Normal kebab-case check for other segments
    return isKebabCase(segment);
  });
}

// Interfaces for Type Safety
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

enum ApiMethodOptions {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

enum ApiMethodGetReturnTypeOptions {
  MODEL = "model",
  COLLECTION = "collection",
  PAGINATE = "paginate",
}

// Function to Fetch Template Content
async function fetchTemplate(
  templatePath: string,
): Promise<string> {
  try {
    const response = await fetch(templatePath);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch template at ${templatePath}: ${response.statusText}`,
      );
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching template from ${templatePath}:`, error);
    return "";
  }
}

async function main(): Promise<void> {
  // First, prompt for root directory selection
  const rootDirOptions = [
    { name: "@/features/", value: "src/features" },
    { name: "@/shared/features", value: "src/shared/features" },
    { name: "@/", value: "src" },
  ];

  const rootDir = await Select.prompt({
    message: "Select root directory:",
    options: rootDirOptions,
    default: "features",
  });

  let parentDir = "";
  // Prompt for parent directory and enforce kebab-case for each segment
  while (true) {
    parentDir = await Input.prompt({
      message: "Enter subdirectory (optional):",
      default: rootDir + "/",
    });

    // Create dynamic regex pattern from rootDirOptions values
    const dirValues = rootDirOptions.map((opt) => opt.value);
    const dirPattern = new RegExp(`^(${dirValues.join("|")})\\/`);

    // Remove the root directory prefix if user kept it
    parentDir = parentDir.replace(dirPattern, "");

    // Check if parentDir is empty or matches a root option exactly
    if (!parentDir || dirValues.includes(parentDir)) {
      parentDir = ""; // Reset to empty if no subdirectory
      break;
    }

    if (isKebabCaseOrUnderscorePathOrUnderscore(parentDir)) {
      break;
    } else {
      console.log(
        "Directory path must be in kebab-case (e.g., 'my-parent-dir/sub-dir'). Please try again.",
      );
    }
  }

  // Combine the root and parent dir
  const fullPath = parentDir ? `${rootDir}/${parentDir}` : rootDir;

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

  // Prompt for API method
  const apiMethod = await Select.prompt<ApiMethodOptions>({
    message: "Select the API route method:",
    options: [
      ApiMethodOptions.POST,
      ApiMethodOptions.GET,
      ApiMethodOptions.PUT,
      ApiMethodOptions.DELETE,
    ],
  }) as ApiMethodOptions;

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

  // Configuration object mapping API methods and additional options to files
  const fileConfig: FileConfig = {
    post: {
      api: [
        {
          name: `api-${featureName}.ts`,
          template: "api-template.txt",
        },
      ],
      lib: [
        {
          name: `map-${featureName}-dto-to-req.ts`,
          template: "map-dto-to-req-template.txt",
        },
        {
          name: `map-${featureName}-rsp-to-dto.ts`,
          template: "map-rsp-to-dto-template.txt",
        },
      ],
      "model/factories": [
        {
          name: `${featureName}-dto-factory.ts`,
          template: "dto-factory-template.txt",
        },
      ],
      "model/types/requests": [
        {
          name: `${toPascalCase(featureName)}Req.ts`,
          template: "req-template.txt",
        },
      ],
      "model/types/responses": [
        {
          name: `${toPascalCase(featureName)}Rsp.ts`,
          template: "rsp-template.txt",
        },
      ],
      "model/types": [
        {
          name: `${toPascalCase(featureName)}Dto.ts`,
          template: "dto-template.txt",
        },
      ],
      "model/validation-rules": [
        {
          name: `${featureName}-validation-rules.ts`,
          template: "validation-rules-template.txt",
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
          template: "test-template.txt",
        },
      ],
    },
    get: {
      model: {
        api: [
          {
            name: `api-${featureName}.ts`,
            template: "api-template.txt",
          },
        ],
        lib: [
          {
            name: `map-${featureName}-rsp-to-dto.ts`,
            template: "map-rsp-to-dto-template.txt",
          },
        ],
        "model/types/requests": [
          {
            name: `${toPascalCase(featureName)}Req.ts`,
            template: "req-template.txt",
          },
        ],
        "model/types/responses": [
          {
            name: `${toPascalCase(featureName)}Rsp.ts`,
            template: "rsp-template.txt",
          },
        ],
        "model/types": [
          {
            name: `${toPascalCase(featureName)}Dto.ts`,
            template: "dto-template.txt",
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
            template: "test-template.txt",
          },
        ],
      },
      collection: {
        api: [
          {
            name: `api-${featureName}.ts`,
            template: "api-template.txt",
          },
        ],
        "model/types/responses": [
          {
            name: `${toPascalCase(featureName)}Rsp.ts`,
            template: "rsp-template.txt",
          },
        ],
        "model/types": [
          {
            name: `${toPascalCase(featureName)}Dto.ts`,
            template: "dto-template.txt",
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
            template: "test-template.txt",
          },
        ],
      },
      paginate: {
        api: [
          {
            name: `api-${featureName}.ts`,
            template: "api-template.txt",
          },
        ],
        lib: [
          {
            name: `map-${featureName}-rsp-to-dto.ts`,
            template: "map-rsp-to-dto-template.txt",
          },
        ],
        "model/types/requests": [
          {
            name: `${toPascalCase(featureName)}Req.ts`,
            template: "req-template.txt",
          },
        ],
        "model/types/responses": [
          {
            name: `${toPascalCase(featureName)}Rsp.ts`,
            template: "rsp-template.txt",
          },
        ],
        "model/types": [
          {
            name: `${toPascalCase(featureName)}Dto.ts`,
            template: "dto-template.txt",
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
            template: "test-template.txt",
          },
        ],
      },
    },
    put: {
      api: [
        {
          name: `api-${featureName}.ts`,
          template: "api-template.txt",
        },
      ],
      lib: [
        {
          name: `map-${featureName}-dto-to-req.ts`,
          template: "map-dto-to-req-template.txt",
        },
        {
          name: `map-${featureName}-rsp-to-dto.ts`,
          template: "map-rsp-to-dto-template.txt",
        },
      ],
      "model/factories": [
        {
          name: `${featureName}-dto-factory.ts`,
          template: "dto-factory-template.txt",
        },
      ],
      "model/types/requests": [
        {
          name: `${toPascalCase(featureName)}Req.ts`,
          template: "req-template.txt",
        },
      ],
      "model/types/responses": [
        {
          name: `${toPascalCase(featureName)}Rsp.ts`,
          template: "rsp-template.txt",
        },
      ],
      "model/types": [
        {
          name: `${toPascalCase(featureName)}Dto.ts`,
          template: "dto-template.txt",
        },
      ],
      "model/validation-rules": [
        {
          name: `${featureName}-validation-rules.ts`,
          template: "validation-rules-template.txt",
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
          template: "test-template.txt",
        },
      ],
    },
    delete: {
      api: [
        {
          name: `api-${featureName}.ts`,
          template: "api-template.txt",
        },
      ],
      "model/types/requests": [
        {
          name: `${toPascalCase(featureName)}Req.ts`,
          template: "req-template.txt",
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
          template: "test-template.txt",
        },
      ],
    },
  };

  // Determine the method configuration based on API method and return type
  let methodConfig: DirectoryConfig;

  if (apiMethod === ApiMethodOptions.GET) {
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
    options: availableDirectories.map((dir) => ({ name: dir, value: dir })),
    minOptions: 1,
    default: defaultSelections,
  });

  // Ensure selected directories exist
  for (const dir of selectedDirectories) {
    const fullDirPath = join(fullPath, featureName, dir);
    await ensureDir(fullDirPath);
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

  // Base URL for templates (assuming templates are in the same repository)
  const scriptUrl = import.meta.url;
  const baseUrl = new URL(
    `templates/scaffold/feature/${apiMethod}/`,
    scriptUrl,
  );

  // Define root path
  const rootPath = rootDirOptions.find((opt) => opt.value === rootDir)?.name ??
    "";

  // Construct the full feature path
  const featurePath = parentDir
    ? join(rootPath, parentDir, featureName)
    : join(rootPath, featureName);

  // Create files
  for (const file of files) {
    const dirPath = join(fullPath, featureName, file.path);
    const filePath = join(dirPath, file.name);

    try {
      // Check if file already exists
      let existsFile = false;
      try {
        await Deno.stat(filePath);
        existsFile = true;
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          existsFile = false;
        } else {
          throw error;
        }
      }

      if (!existsFile) {
        // Construct the template URL
        const templateUrl = getReturnType
          ? new URL(`${getReturnType}/${file.template}`, baseUrl).href
          : new URL(file.template, baseUrl).href;

        console.log(`Fetching template from: ${templateUrl}`);

        // Fetch the template content
        const templateContent = await fetchTemplate(templateUrl);

        if (templateContent) {
          // Replace placeholders
          let content = templateContent.replace(
            /\{\{featurePath\}\}/g,
            featurePath,
          );
          content = content.replace(/\{\{feature-name\}\}/g, featureName);
          content = content.replace(
            /\{\{FeatureName\}\}/g,
            toPascalCase(featureName),
          );
          content = content.replace(
            /\{\{featureName\}\}/g,
            toCamelCase(featureName),
          );

          // Write the content to the file
          await Deno.writeTextFile(filePath, content);
          console.log(`Created file: ${filePath}`);
        } else {
          console.log(
            `Template "${file.template}" not found. Creating empty file: ${filePath}`,
          );
          await Deno.writeTextFile(filePath, "");
        }
      } else {
        console.log(`File "${filePath}" already exists, skipping.`);
      }
    } catch (error) {
      console.error(`Error creating file "${filePath}":`, error);
    }
  }

  console.log("Feature scaffolding complete.");
}

await main();

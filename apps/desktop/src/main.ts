import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { createProject, listProjects } from '@zeta/commands';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.turbo',
  '.next',
  'dist',
  'node_modules',
  'out',
]);
const MAX_LISTED_FILES = 1000;
const MAX_FILE_BYTES = 200 * 1024;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.on('ready', registerProjectIpcHandlers);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function registerProjectIpcHandlers(): void {
  ipcMain.handle('projects:add', async () => {
    const selectedFolder = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Project Folder',
    });

    if (selectedFolder.canceled || selectedFolder.filePaths.length === 0) {
      return null;
    }

    return createProject({
      folderPath: selectedFolder.filePaths[0],
      dataDir: app.getPath('userData'),
    });
  });

  ipcMain.handle('projects:list', async () => {
    return listProjects(app.getPath('userData'));
  });

  ipcMain.handle('projects:list-files', async (_event, projectPath: string) => {
    return listProjectFiles(projectPath);
  });

  ipcMain.handle(
    'projects:read-file',
    async (_event, projectPath: string, relativeFilePath: string) => {
      return readProjectFile(projectPath, relativeFilePath);
    },
  );
}

async function listProjectFiles(projectPath: string): Promise<string[]> {
  const absoluteProjectPath = path.resolve(projectPath);
  const projectStats = await stat(absoluteProjectPath);

  if (!projectStats.isDirectory()) {
    throw new Error(`Project path is not a directory: ${absoluteProjectPath}`);
  }

  const files: string[] = [];

  async function walkDirectory(directoryPath: string): Promise<void> {
    if (files.length >= MAX_LISTED_FILES) {
      return;
    }

    const entries = await readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      if (files.length >= MAX_LISTED_FILES) {
        break;
      }

      const entryPath = path.join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        if (EXCLUDED_DIRECTORIES.has(entry.name)) {
          continue;
        }

        await walkDirectory(entryPath);
        continue;
      }

      if (entry.isFile()) {
        files.push(path.relative(absoluteProjectPath, entryPath));
      }
    }
  }

  await walkDirectory(absoluteProjectPath);

  return files.sort((first, second) => first.localeCompare(second));
}

async function readProjectFile(
  projectPath: string,
  relativeFilePath: string,
): Promise<{ content: string; isBinary: boolean; truncated: boolean }> {
  const absoluteProjectPath = path.resolve(projectPath);
  const absoluteFilePath = path.resolve(absoluteProjectPath, relativeFilePath);

  if (!isPathWithinDirectory(absoluteProjectPath, absoluteFilePath)) {
    throw new Error('Invalid file path for selected project');
  }

  const fileBuffer = await readFile(absoluteFilePath);
  const isBinary = fileBuffer.includes(0);

  if (isBinary) {
    return {
      content: '',
      isBinary: true,
      truncated: false,
    };
  }

  const truncated = fileBuffer.byteLength > MAX_FILE_BYTES;
  const textBuffer = truncated
    ? fileBuffer.subarray(0, MAX_FILE_BYTES)
    : fileBuffer;

  return {
    content: textBuffer.toString('utf8'),
    isBinary: false,
    truncated,
  };
}

function isPathWithinDirectory(directoryPath: string, targetPath: string): boolean {
  const relativePath = path.relative(directoryPath, targetPath);

  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
}

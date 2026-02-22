import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import {
  AddToolCommand,
  AddToolFacade,
  AddToolRepository,
  AddToolService,
  CreateTaskCommand,
  CreateTaskFacade,
  CreateTaskRepository,
  CreateTaskService,
  CreateProjectCommand,
  CreateProjectFacade,
  CreateProjectRepository,
  CreateProjectService,
  FindProjectsFacade,
  ListTasksFacade,
  ListTasksQuery,
  ListTasksRepository,
  ProjectsRepository,
  Repository,
} from '@zeta/commands';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const MIN_ZOOM_FACTOR = 0.5;
const MAX_ZOOM_FACTOR = 3;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM_FACTOR = 1;

const createWindow = () => {
  console.log('Creating main window...');
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 1200,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Keep renderer in sync with maximize/restore state for custom titlebar controls.
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:maximize-state-changed', true);
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:maximize-state-changed', false);
  });
  // Route renderer popup attempts to the OS default browser instead of new Electron windows.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      void shell.openExternal(url);
    }

    return { action: 'deny' };
  });
  // Support browser-like zoom keyboard shortcuts for frameless windows.
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const isZoomModifierPressed = process.platform === 'darwin' ? input.meta : input.control;
    if (!isZoomModifierPressed || input.type !== 'keyDown') {
      return;
    }

    if (isZoomInShortcut(input)) {
      event.preventDefault();
      setWindowZoomFactor(mainWindow, ZOOM_STEP);
      return;
    }

    if (isZoomOutShortcut(input)) {
      event.preventDefault();
      setWindowZoomFactor(mainWindow, -ZOOM_STEP);
      return;
    }

    if (isResetZoomShortcut(input)) {
      event.preventDefault();
      mainWindow.webContents.setZoomFactor(DEFAULT_ZOOM_FACTOR);
    }
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.on('ready', registerProjectIpcHandlers);
app.on('ready', registerTaskIpcHandlers);
app.on('ready', registerToolIpcHandlers);
app.on('ready', registerAppIpcHandlers);

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
    // Open the folder selection dialog
    const selectedFolder = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Project Folder',
    });

    if (selectedFolder.canceled || selectedFolder.filePaths.length === 0) {
      return null;
    }

    // Instantiate services
    const service = new CreateProjectService();
    const repository = new CreateProjectRepository();
    const facade = new CreateProjectFacade(service, repository);

    // Create the project
    return facade.execute({
      folderPath: selectedFolder.filePaths[0],
    } satisfies CreateProjectCommand);
  });

  ipcMain.handle('projects:list', async () => {
    // Insansitate services
    const repository = new ProjectsRepository();
    const facade = new FindProjectsFacade(repository);

    // Return the projects
    return facade.execute();
  });
}

function registerTaskIpcHandlers(): void {
  ipcMain.handle('tasks:add', async (_event, command: CreateTaskCommand) => {
    // Instantiate services.
    const service = new CreateTaskService();
    const repository = new CreateTaskRepository();
    const facade = new CreateTaskFacade(service, repository);

    // Create the task.
    return facade.execute(command);
  });

  ipcMain.handle('tasks:list', async (_event, query: ListTasksQuery) => {
    // Instantiate services.
    const projectsRepository = new ProjectsRepository();
    const tasksRepository = new ListTasksRepository();
    const facade = new ListTasksFacade(projectsRepository, tasksRepository);

    // Return project tasks.
    return facade.execute(query);
  });
}

function registerToolIpcHandlers(): void {
  ipcMain.handle('tools:add', async (_event, command: AddToolCommand) => {
    // Instantiate services.
    const service = new AddToolService();
    const repository = new AddToolRepository();
    const facade = new AddToolFacade(service, repository);

    // Persist the tool.
    return facade.execute(command);
  });
}

function registerAppIpcHandlers(): void {
  ipcMain.handle('app:open-data-folder', async () => {
    // Resolve and ensure the zeta app data path exists before opening it.
    const appDataFolderPath = Repository.getStoragePath();
    await mkdir(appDataFolderPath, { recursive: true });

    const openErrorMessage = await shell.openPath(appDataFolderPath);
    if (openErrorMessage) {
      throw new Error(openErrorMessage);
    }

    return appDataFolderPath;
  });
  // Open trusted external URLs using the OS default browser/email client.
  ipcMain.handle('app:open-external-url', async (_event, url: string) => {
    if (!isSafeExternalUrl(url)) {
      throw new Error(`Unsupported external URL protocol: ${url}`);
    }

    await shell.openExternal(url);
  });

  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.handle('window:toggle-maximize', (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return false;
    }

    if (window.isMaximized()) {
      window.unmaximize();
      return false;
    }

    window.maximize();
    return true;
  });

  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  ipcMain.handle('window:is-maximized', (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false;
  });
}

function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
}

function setWindowZoomFactor(window: BrowserWindow, delta: number): void {
  // Clamp zoom factor to keep rendering predictable and readable.
  const next = clamp(window.webContents.getZoomFactor() + delta, MIN_ZOOM_FACTOR, MAX_ZOOM_FACTOR);
  window.webContents.setZoomFactor(next);
}

function isZoomInShortcut(input: Electron.Input): boolean {
  return (
    input.key === '=' ||
    input.key === '+' ||
    input.code === 'Equal' ||
    input.code === 'NumpadAdd'
  );
}

function isZoomOutShortcut(input: Electron.Input): boolean {
  return input.key === '-' || input.code === 'Minus' || input.code === 'NumpadSubtract';
}

function isResetZoomShortcut(input: Electron.Input): boolean {
  return input.key === '0' || input.code === 'Digit0' || input.code === 'Numpad0';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

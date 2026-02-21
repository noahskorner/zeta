import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import started from "electron-squirrel-startup";
import {
  CreateTaskCommand,
  CreateTaskFacade,
  CreateTaskRepository,
  CreateTaskService,
  CreateProjectCommand,
  CreateProjectFacade,
  CreateProjectRepository,
  CreateProjectService,
  FindProjectsFacade,
  ProjectsRepository,
  Repository,
} from "@zeta/commands";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  console.log("Creating main window...");
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
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
app.on("ready", createWindow);
app.on("ready", registerProjectIpcHandlers);
app.on("ready", registerTaskIpcHandlers);
app.on("ready", registerAppIpcHandlers);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function registerProjectIpcHandlers(): void {
  ipcMain.handle("projects:add", async () => {
    // Open the folder selection dialog
    const selectedFolder = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Select Project Folder",
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

  ipcMain.handle("projects:list", async () => {
    // Insansitate services
    const repository = new ProjectsRepository();
    const facade = new FindProjectsFacade(repository);

    // Return the projects
    return facade.execute();
  });
}

function registerTaskIpcHandlers(): void {
  ipcMain.handle("tasks:add", async (_event, command: CreateTaskCommand) => {
    // Instantiate services.
    const service = new CreateTaskService();
    const repository = new CreateTaskRepository();
    const facade = new CreateTaskFacade(service, repository);

    // Create the task.
    return facade.execute(command);
  });
}

function registerAppIpcHandlers(): void {
  ipcMain.handle("app:open-data-folder", async () => {
    // Resolve and ensure the zeta app data path exists before opening it.
    const appDataFolderPath = Repository.getStoragePath();
    await mkdir(appDataFolderPath, { recursive: true });

    const openErrorMessage = await shell.openPath(appDataFolderPath);
    if (openErrorMessage) {
      throw new Error(openErrorMessage);
    }

    return appDataFolderPath;
  });
}

import path from 'node:path';
import os from 'node:os';

export abstract class Repository {
  private static readonly ROOT_DIR = 'zeta';
  protected static readonly STORAGE_PATH = Repository.getStoragePath();

  public static getStoragePath(): string {
    const runtimeProcess = typeof process !== 'undefined' ? process : undefined;
    if (!runtimeProcess) {
      return Repository.ROOT_DIR;
    }

    // If the platform is Windows, use the APPDATA environment variable
    if (runtimeProcess.platform === 'win32') {
      const appDataPath = runtimeProcess.env.APPDATA;
      if (appDataPath) {
        return path.join(appDataPath, Repository.ROOT_DIR);
      }
    }

    // If the platform is macOS, use the Library/Application Support directory
    if (runtimeProcess.platform === 'darwin') {
      return path.join(os.homedir(), 'Library', 'Application Support', Repository.ROOT_DIR);
    }

    // For Linux and other platforms, use the XDG_CONFIG_HOME environment variable or default to ~/.config
    const xdgConfigHome = runtimeProcess.env.XDG_CONFIG_HOME;
    if (xdgConfigHome) {
      return path.join(xdgConfigHome, Repository.ROOT_DIR);
    }

    // Default to ~/.config/zeta
    return path.join(os.homedir(), '.config', Repository.ROOT_DIR);
  }
}

import path from "node:path";
import os from "node:os";

export abstract class Repository {
  private readonly ROOT_DIR = "zeta";
  protected readonly STORAGE_PATH = this.getStoragePath();

  private getStoragePath() {
    // If the platform is Windows, use the APPDATA environment variable
    if (process.platform === "win32") {
      const appDataPath = process.env.APPDATA;
      if (appDataPath) {
        return path.join(appDataPath, this.ROOT_DIR);
      }
    }

    // If the platform is macOS, use the Library/Application Support directory
    if (process.platform === "darwin") {
      return path.join(
        os.homedir(),
        "Library",
        "Application Support",
        this.ROOT_DIR,
      );
    }

    // For Linux and other platforms, use the XDG_CONFIG_HOME environment variable or default to ~/.config
    const xdgConfigHome = process.env.XDG_CONFIG_HOME;
    if (xdgConfigHome) {
      return path.join(xdgConfigHome, this.ROOT_DIR);
    }

    // Default to ~/.config/zeta
    return path.join(os.homedir(), ".config", this.ROOT_DIR);
  }
}

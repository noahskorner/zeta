import { Bell, FolderOpen, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../components/ui/sidebar';

type SettingsSection = 'general' | 'notifications' | 'advanced';

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Keep section metadata centralized for sidebar navigation.
const settingsSections: Array<{
  id: SettingsSection;
  label: string;
  description: string;
}> = [
  {
    id: 'general',
    label: 'General',
    description: 'Manage local application defaults and storage.',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Placeholder preferences for alerts and reminders.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Placeholder controls for diagnostics and behavior.',
  },
];

export function SettingsDialog(props: SettingsDialogProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [isOpeningAppDataFolder, setIsOpeningAppDataFolder] = useState(false);

  // Open the app data folder and surface success/error state to the user.
  async function handleOpenApplicationDataFolder() {
    setIsOpeningAppDataFolder(true);

    try {
      const appDataFolderPath = await window.zetaApi.openApplicationDataFolder();
      toast.success('Opened application data folder.', {
        description: appDataFolderPath,
      });
    } catch (error) {
      toast.error('Failed to open application data folder.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsOpeningAppDataFolder(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-4xl" showCloseButton>
        <SidebarProvider defaultOpen className="h-140 min-h-0">
          {/* Keep this as a static settings nav panel with no collapse behavior. */}
          <Sidebar collapsible="none" className="w-60 border-r">
            <SidebarHeader className="border-b p-4">
              <DialogTitle className="text-base">Settings</DialogTitle>
              <DialogDescription>{getSection(activeSection).description}</DialogDescription>
            </SidebarHeader>

            <SidebarContent className="p-2">
              <SidebarGroup className="p-0">
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsSections.map((section) => (
                      <SidebarMenuItem key={section.id}>
                        <SidebarMenuButton
                          isActive={activeSection === section.id}
                          onClick={() => setActiveSection(section.id)}
                        >
                          <span>{section.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Render the currently selected settings section content. */}
          <section className="flex-1 overflow-y-auto p-6">
            {activeSection === 'general' ? (
              <GeneralSettingsSection
                isOpeningAppDataFolder={isOpeningAppDataFolder}
                onOpenApplicationDataFolder={handleOpenApplicationDataFolder}
              />
            ) : null}

            {activeSection === 'notifications' ? <NotificationSettingsSection /> : null}

            {activeSection === 'advanced' ? <AdvancedSettingsSection /> : null}
          </section>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}

type GeneralSettingsSectionProps = {
  isOpeningAppDataFolder: boolean;
  onOpenApplicationDataFolder: () => Promise<void>;
};

function GeneralSettingsSection(props: GeneralSettingsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">General</h3>
        <p className="text-sm text-muted-foreground">
          Open local folders and configure core defaults.
        </p>
      </div>

      <div className="space-y-3 rounded-md border p-4">
        <div className="flex items-start gap-3">
          <FolderOpen className="mt-0.5 size-4 text-muted-foreground" />
          <div className="space-y-1">
            <div className="text-sm font-medium">Application Data Folder</div>
            <p className="text-sm text-muted-foreground">
              Open the `zeta` data directory in your system file explorer.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void props.onOpenApplicationDataFolder()}
          disabled={props.isOpeningAppDataFolder}
        >
          {props.isOpeningAppDataFolder
            ? 'Opening Application Data Folder...'
            : 'Open Application Data Folder'}
        </Button>
      </div>
    </div>
  );
}

function NotificationSettingsSection() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Placeholder section for toast, desktop, and digest preferences.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border p-4">
        <Bell className="mt-0.5 size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Notification controls will be added here in a future iteration.
        </p>
      </div>
    </div>
  );
}

function AdvancedSettingsSection() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Advanced</h3>
        <p className="text-sm text-muted-foreground">
          Placeholder section for diagnostics, telemetry, and power-user controls.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md border p-4">
        <Shield className="mt-0.5 size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Advanced options will be added here in a future iteration.
        </p>
      </div>
    </div>
  );
}

function getSection(sectionId: SettingsSection) {
  return settingsSections.find((section) => section.id === sectionId) ?? settingsSections[0];
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Unknown error';
}

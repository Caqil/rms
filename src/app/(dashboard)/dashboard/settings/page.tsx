"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  User,
  Bell,
  Shield,
  DollarSign,
  Globe,
  Palette,
  Database,
  Mail,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Key,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    timezone: "America/New_York",
    language: "en",
    avatar: "",
  });

  // Restaurant settings state
  const [restaurantSettings, setRestaurantSettings] = useState({
    name: "",
    description: "",
    currency: "USD",
    timezone: "America/New_York",
    taxRate: 8.5,
    serviceChargeRate: 0,
    businessHours: {
      monday: { open: "09:00", close: "22:00", isClosed: false },
      tuesday: { open: "09:00", close: "22:00", isClosed: false },
      wednesday: { open: "09:00", close: "22:00", isClosed: false },
      thursday: { open: "09:00", close: "22:00", isClosed: false },
      friday: { open: "09:00", close: "22:00", isClosed: false },
      saturday: { open: "09:00", close: "22:00", isClosed: false },
      sunday: { open: "09:00", close: "22:00", isClosed: false },
    },
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    inventoryAlerts: true,
    staffUpdates: false,
    systemMaintenance: true,
    marketingEmails: false,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
    },
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: 365,
    maintenanceMode: false,
    debugMode: false,
    analyticsEnabled: true,
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // API call to update profile
      console.log("Saving profile settings:", profileSettings);
      // await updateProfile(profileSettings);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRestaurant = async () => {
    setLoading(true);
    try {
      // API call to update restaurant settings
      console.log("Saving restaurant settings:", restaurantSettings);
      // await updateRestaurantSettings(restaurantSettings);
    } catch (error) {
      console.error("Failed to save restaurant settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // API call to update notification settings
      console.log("Saving notification settings:", notificationSettings);
      // await updateNotificationSettings(notificationSettings);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      // API call to update security settings
      console.log("Saving security settings:", securitySettings);
      // await updateSecuritySettings(securitySettings);
    } catch (error) {
      console.error("Failed to save security settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    try {
      // API call to update system settings
      console.log("Saving system settings:", systemSettings);
      // await updateSystemSettings(systemSettings);
    } catch (error) {
      console.error("Failed to save system settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupData = async () => {
    setLoading(true);
    try {
      console.log("Creating backup...");
      // await createBackup();
      setIsBackupDialogOpen(false);
    } catch (error) {
      console.error("Failed to create backup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreData = async (file: File) => {
    setLoading(true);
    try {
      console.log("Restoring from backup:", file.name);
      // await restoreFromBackup(file);
    } catch (error) {
      console.error("Failed to restore backup:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, restaurant, and system preferences
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="restaurant" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Restaurant
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profileSettings.timezone}
                    onValueChange={(value) =>
                      setProfileSettings({ ...profileSettings, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={profileSettings.language}
                  onValueChange={(value) =>
                    setProfileSettings({ ...profileSettings, language: value })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveProfile} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restaurant Settings */}
        <TabsContent value="restaurant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Configuration</CardTitle>
              <CardDescription>
                Configure your restaurant settings and business hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={restaurantSettings.name}
                    onChange={(e) =>
                      setRestaurantSettings({ ...restaurantSettings, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={restaurantSettings.currency}
                    onValueChange={(value) =>
                      setRestaurantSettings({ ...restaurantSettings, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={restaurantSettings.description}
                  onChange={(e) =>
                    setRestaurantSettings({ ...restaurantSettings, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={restaurantSettings.taxRate}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        taxRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                  <Input
                    id="serviceCharge"
                    type="number"
                    step="0.1"
                    value={restaurantSettings.serviceChargeRate}
                    onChange={(e) =>
                      setRestaurantSettings({
                        ...restaurantSettings,
                        serviceChargeRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Business Hours</Label>
                <div className="space-y-3 mt-3">
                  {Object.entries(restaurantSettings.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-20 font-medium capitalize">{day}</div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) =>
                            setRestaurantSettings({
                              ...restaurantSettings,
                              businessHours: {
                                ...restaurantSettings.businessHours,
                                [day]: { ...hours, open: e.target.value },
                              },
                            })
                          }
                          className="w-32"
                          disabled={hours.isClosed}
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) =>
                            setRestaurantSettings({
                              ...restaurantSettings,
                              businessHours: {
                                ...restaurantSettings.businessHours,
                                [day]: { ...hours, close: e.target.value },
                              },
                            })
                          }
                          className="w-32"
                          disabled={hours.isClosed}
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={!hours.isClosed}
                            onCheckedChange={(checked) =>
                              setRestaurantSettings({
                                ...restaurantSettings,
                                businessHours: {
                                  ...restaurantSettings.businessHours,
                                  [day]: { ...hours, isClosed: !checked },
                                },
                              })
                            }
                          />
                          <Label>Open</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveRestaurant} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Restaurant Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Order Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new orders and status changes
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.orderUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        orderUpdates: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Inventory Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Low stock and inventory warnings
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.inventoryAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        inventoryAlerts: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Staff Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Staff schedule and performance notifications
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.staffUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        staffUpdates: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security & Access</CardTitle>
              <CardDescription>
                Manage your account security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: checked,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                    className="w-32 mt-1"
                  />
                </div>

                <Separator />

                <div>
                  <Label className="text-base">Password Requirements</Label>
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label htmlFor="minLength">Minimum Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={securitySettings.passwordRequirements.minLength}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordRequirements: {
                              ...securitySettings.passwordRequirements,
                              minLength: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-32 mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Require Uppercase Letters</Label>
                      <Switch
                        checked={securitySettings.passwordRequirements.requireUppercase}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordRequirements: {
                              ...securitySettings.passwordRequirements,
                              requireUppercase: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Require Numbers</Label>
                      <Switch
                        checked={securitySettings.passwordRequirements.requireNumbers}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordRequirements: {
                              ...securitySettings.passwordRequirements,
                              requireNumbers: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Require Symbols</Label>
                      <Switch
                        checked={securitySettings.passwordRequirements.requireSymbols}
                        onCheckedChange={(checked) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordRequirements: {
                              ...securitySettings.passwordRequirements,
                              requireSymbols: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSecurity} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Manage system-wide settings and data management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your data
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        autoBackup: checked,
                      })
                    }
                  />
                </div>

                {systemSettings.autoBackup && (
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select
                      value={systemSettings.backupFrequency}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          backupFrequency: value,
                        })
                      }
                    >
                      <SelectTrigger className="w-48 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={systemSettings.dataRetention}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        dataRetention: parseInt(e.target.value),
                      })
                    }
                    className="w-32 mt-1"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable public access
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        maintenanceMode: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Analytics Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect usage analytics and insights
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.analyticsEnabled}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        analyticsEnabled: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base">Data Management</Label>
                <div className="flex items-center space-x-4 mt-3">
                  <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Create Backup
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Data Backup</DialogTitle>
                        <DialogDescription>
                          This will create a backup of all your restaurant data.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button onClick={handleBackupData} disabled={loading}>
                          <Download className="mr-2 h-4 w-4" />
                          Create Backup
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Restore Backup
                  </Button>
                </div>
              </div>

              <Button onClick={handleSaveSystem} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
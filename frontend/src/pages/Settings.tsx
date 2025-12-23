import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { User, Bell, Shield, Palette } from "lucide-react";

const FIXED_USER_ID = "c39967a5-0b09-4b1d-aa40-6765d979838b";
localStorage.setItem(
  "user_id",
  "c39967a5-0b09-4b1d-aa40-6765d979838b"
);


export default function Settings() {
  const qc = useQueryClient();

  // Local UI state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const [password, setPassword] = useState("");

  // 1) Ensure user_id exists (so api.ts sends x-user-id)
  useEffect(() => {
    localStorage.setItem("user_id", FIXED_USER_ID);
  }, []);

  // 2) Fetch profile
  const meQ = useQuery({
    queryKey: ["me"],
    queryFn: () => api.me(),
    staleTime: 30_000,
  });

  // 3) Fetch settings
  const settingsQ = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
    staleTime: 30_000,
  });

  // 4) Fill local state when data arrives
  useEffect(() => {
    if (meQ.data) {
      setName(meQ.data.name ?? "");
      setEmail(meQ.data.email ?? "");
    }
  }, [meQ.data]);

  useEffect(() => {
    if (settingsQ.data) {
      setTheme(settingsQ.data.theme ?? "system");
      setEmailNotif(!!settingsQ.data.email_notifications);
      setPushNotif(!!settingsQ.data.push_notifications);
    }
  }, [settingsQ.data]);

  // 5) Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.classList.remove("light", "dark");
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  // Mutations
  const updateMeM = useMutation({
    mutationFn: (payload: { name: string; email: string }) => api.updateMe(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      alert("Profile saved");
    },
    onError: (e) => alert(`Profile save failed: ${String(e)}`),
  });

  const updateSettingsM = useMutation({
    mutationFn: (payload: {
      theme: "light" | "dark" | "system";
      email_notifications: boolean;
      push_notifications: boolean;
    }) => api.updateSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      alert("Settings saved");
    },
    onError: (e) => alert(`Settings save failed: ${String(e)}`),
  });

  const passwordM = useMutation({
    mutationFn: (payload: { newPassword: string }) => api.updatePassword(payload),
    onSuccess: () => {
      alert("Password updated");
      setPassword("");
    },
    onError: (e) => alert(`Password update failed: ${String(e)}`),
  });

  const busy =
    meQ.isLoading ||
    settingsQ.isLoading ||
    updateMeM.isPending ||
    updateSettingsM.isPending ||
    passwordM.isPending;

  function saveProfile() {
    const n = name.trim();
    const e = email.trim();
    if (!n) return alert("Name is required.");
    if (!e) return alert("Email is required.");
    updateMeM.mutate({ name: n, email: e });
  }

  function saveNotifications() {
    updateSettingsM.mutate({
      theme,
      email_notifications: emailNotif,
      push_notifications: pushNotif,
    });
  }

  function saveTheme(next: "light" | "dark" | "system") {
    setTheme(next);
    updateSettingsM.mutate({
      theme: next,
      email_notifications: emailNotif,
      push_notifications: pushNotif,
    });
  }

  function changePassword() {
    if (password.length < 6) return alert("Password must be at least 6 characters");
    passwordM.mutate({ newPassword: password });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-neon-pink to-neon-mint bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Configure your platform preferences</p>
        <p className="text-xs text-muted-foreground mt-1">
          Active user_id: <span className="font-mono">{FIXED_USER_ID}</span>
        </p>
      </div>

      {(meQ.isError || settingsQ.isError) && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
          Failed to load settings:
          <div className="mt-1 text-xs font-mono">
            {meQ.isError ? String(meQ.error) : ""}
            {settingsQ.isError ? `\n${String(settingsQ.error)}` : ""}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROFILE */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Settings
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} disabled={busy} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} />
            </div>
            <Button onClick={saveProfile} disabled={busy}>
              {updateMeM.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* NOTIFICATIONS */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-neon-mint" />
              Notifications
            </CardTitle>
            <CardDescription>Configure notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} disabled={busy} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Push Notifications</Label>
              <Switch checked={pushNotif} onCheckedChange={setPushNotif} disabled={busy} />
            </div>
            <Button onClick={saveNotifications} disabled={busy}>
              {updateSettingsM.isPending ? "Saving..." : "Save Notifications"}
            </Button>
          </CardContent>
        </Card>

        {/* SECURITY */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              Security
            </CardTitle>
            <CardDescription>Manage security and privacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
            </div>
            <Button onClick={changePassword} disabled={busy}>
              {passwordM.isPending ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        {/* APPEARANCE */}
        <Card className="glass-panel border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-neon-pink" />
              Appearance
            </CardTitle>
            <CardDescription>Customize theme and display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v: any) => saveTheme(v)} disabled={busy}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { saveSettings, type SettingsFormState } from "@/app/(admin)/admin/(panel)/settings/actions";
import { Field, describedBy } from "@/components/admin/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(saveSettings, {});
  const e = state.errors ?? {};

  // After a submit React resets the form to these defaults, so prefer what was just sent.
  const v = state.values ?? {
    propertyName: settings.propertyName,
    address: settings.address,
    hostName: settings.hostName,
    welcomeMessage: settings.welcomeMessage,
    checkInTime: settings.checkInTime,
    checkOutTime: settings.checkOutTime,
    wifiSsid: settings.wifi.ssid,
    wifiPassword: settings.wifi.password,
    wifiSecurity: settings.wifi.security,
    wifiHidden: settings.wifi.hidden ? "on" : "",
    houseRules: settings.houseRules.join("\n"),
  };

  return (
    <form action={action} className="flex flex-col gap-8" noValidate>
      <Section title="Property">
        <Field id="propertyName" label="Property name" error={e.propertyName}>
          <Input {...describedBy("propertyName", e.propertyName)} defaultValue={v.propertyName} />
        </Field>
        <Field id="address" label="Street address" hint="Shown next to the emergency numbers." error={e.address}>
          <Input {...describedBy("address", e.address, true)} defaultValue={v.address} autoComplete="street-address" />
        </Field>
        <Field id="hostName" label="Host name" error={e.hostName}>
          <Input {...describedBy("hostName", e.hostName)} defaultValue={v.hostName} />
        </Field>
        <Field id="welcomeMessage" label="Welcome message" error={e.welcomeMessage}>
          <Textarea {...describedBy("welcomeMessage", e.welcomeMessage)} defaultValue={v.welcomeMessage} rows={2} />
        </Field>
      </Section>

      <Section title="Check-in and check-out" description="New York time.">
        <div className="grid grid-cols-2 gap-4">
          <Field id="checkInTime" label="Check-in" error={e.checkInTime}>
            <Input {...describedBy("checkInTime", e.checkInTime)} type="time" defaultValue={v.checkInTime} />
          </Field>
          <Field id="checkOutTime" label="Check-out" error={e.checkOutTime}>
            <Input {...describedBy("checkOutTime", e.checkOutTime)} type="time" defaultValue={v.checkOutTime} />
          </Field>
        </div>
      </Section>

      <Section title="Wi-Fi" description="Shown on the Wi-Fi screen with a scan-to-join QR code.">
        <Field id="wifiSsid" label="Network name" error={e.wifiSsid}>
          <Input {...describedBy("wifiSsid", e.wifiSsid)} defaultValue={v.wifiSsid} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
        </Field>
        <Field id="wifiSecurity" label="Security" error={e.wifiSecurity}>
          <NativeSelect {...describedBy("wifiSecurity", e.wifiSecurity)} defaultValue={v.wifiSecurity}>
            <option value="WPA">WPA / WPA2 / WPA3 (most networks)</option>
            <option value="WEP">WEP (old)</option>
            <option value="nopass">Open — no password</option>
          </NativeSelect>
        </Field>
        <Field id="wifiPassword" label="Password" hint="Leave empty for an open network." error={e.wifiPassword}>
          <Input
            {...describedBy("wifiPassword", e.wifiPassword, true)}
            defaultValue={v.wifiPassword}
            className="font-mono"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
          />
        </Field>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="wifiHidden" defaultChecked={v.wifiHidden === "on"} className="size-5 accent-primary" />
          <span>Hidden network (doesn’t broadcast its name)</span>
        </label>
      </Section>

      <Section title="House rules" description="One rule per line.">
        <Field id="houseRules" label="Rules" error={e.houseRules}>
          <Textarea {...describedBy("houseRules", e.houseRules)} defaultValue={v.houseRules} rows={5} />
        </Field>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" size="compact" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        <p aria-live="polite" className="text-sm">
          {!pending && state.ok && (
            <span className="flex items-center gap-1 text-foreground">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-primary" strokeWidth={2} aria-hidden />
              Saved. Guest screens update on their next refresh.
            </span>
          )}
          {!pending && state.errors && <span className="text-destructive">Please fix the highlighted fields.</span>}
        </p>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1">
        <span className="block font-heading text-lg font-bold">{title}</span>
        {description && <span className="block text-sm text-muted-foreground">{description}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

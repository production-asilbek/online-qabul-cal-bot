"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/lib/hooks/use-store";
import { useAuth } from "@/lib/hooks/use-auth";
import { isDemoGoogleUser } from "@/lib/auth/identity";
import { completeRegistration, isRegistrationComplete } from "@/lib/auth/registration";
import { applyGoogleProfile, finishRegistration } from "@/lib/services/businesses";
import { setLocale, useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/messages";
import { Sun } from "lucide-react";
import { haptic } from "@/lib/telegram";

const WELCOME_KEY = "stom-welcome-lang";

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function RegisterInner() {
  useAppStore();
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<"language" | "google" | "service">("language");
  const [serviceName, setServiceName] = useState("");
  const [chosen, setChosen] = useState<Locale>("uz");
  const [busy, setBusy] = useState(false);
  const error = params.get("error");

  useEffect(() => {
    if (!ready) return;
    if (user && isRegistrationComplete()) {
      router.replace("/");
      return;
    }
    if (user && !isDemoGoogleUser(user)) {
      applyGoogleProfile(user.name);
      setStep("service");
      return;
    }
    if (user) {
      setStep("service");
      return;
    }
    const welcomed = typeof window !== "undefined" && window.sessionStorage.getItem(WELCOME_KEY) === "1";
    setStep(welcomed || params.get("setup") === "1" ? "google" : "language");
    if (!welcomed && params.get("setup") !== "1") {
      setChosen("uz");
      setLocale("uz");
    }
  }, [ready, user, router, params]);

  const goToGoogle = () => {
    setLocale(chosen);
    window.sessionStorage.setItem(WELCOME_KEY, "1");
    haptic("light");
    setStep("google");
  };

  const finish = () => {
    const name = serviceName.trim();
    if (!name) return;
    setLocale(chosen);
    finishRegistration(name);
    completeRegistration(name);
    haptic("success");
    router.replace("/");
  };

  return (
    <main className="flex min-h-dvh flex-col px-6 py-10">
      {step === "language" ? (
        <div className="flex flex-1 flex-col justify-center">
          <h1 className="flex items-center gap-2 text-[34px] font-semibold tracking-tight">
            {t.appName}
            <Sun size={30} className="text-[var(--tg-button-color)]" aria-hidden />
          </h1>
          <div className="mt-8 rounded-[18px] bg-[var(--tg-section-bg-color)] p-4">
            <LanguageSwitcher compact value={chosen} onChange={setChosen} />
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={goToGoogle}>
            {t.continue}
          </Button>
        </div>
      ) : null}

      {step === "google" ? (
        <div className="flex flex-1 flex-col justify-center">
          <p className="text-sm font-medium text-[var(--tg-accent-text-color)]">{t.appName}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t.signInTitle}</h1>
          <p className="mt-3 text-[var(--tg-subtitle-text-color)]">{t.signInSubtitle}</p>
          {error ? (
            <p className="mt-4 text-sm text-[var(--tg-destructive-text-color)]">
              {error === "google-config" ? t.googleNotConfigured : t.somethingWrong}
            </p>
          ) : null}
          <a
            href="/api/auth/google"
            onClick={() => {
              setBusy(true);
              haptic("medium");
            }}
            className="mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-white text-base font-semibold text-[#1f1f1f] shadow-sm ring-1 ring-black/10"
          >
            <GoogleMark />
            {busy ? t.googleConnecting : t.continueWithGoogle}
          </a>
        </div>
      ) : null}

      {step === "service" ? (
        <div className="flex flex-1 flex-col justify-center">
          {user ? (
            <p className="text-sm text-[var(--tg-subtitle-text-color)]">
              {t.signedInAs} {user.name}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-semibold">{t.nameYourService}</h1>
          <p className="mt-3 text-[var(--tg-subtitle-text-color)]">{t.nameYourServiceHint}</p>
          <div className="mt-6">
            <Input
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder=""
              autoFocus
            />
          </div>
          <Button className="mt-6 w-full" size="lg" disabled={!serviceName.trim()} onClick={finish}>
            {t.enterApp}
          </Button>
        </div>
      ) : null}
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-6 mt-16 h-64" />}>
      <RegisterInner />
    </Suspense>
  );
}

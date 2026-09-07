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
import { applyGoogleProfile, finishRegistration, getCurrentBusiness } from "@/lib/services/businesses";
import { setLocale, useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/messages";
import { Sun } from "lucide-react";
import { haptic } from "@/lib/telegram";

const WELCOME_KEY = "stom-welcome-lang";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C38.2 37.3 44 32 44 24c0-1.3-.1-2.5-.4-3.5z" />
    </svg>
  );
}

function RegisterInner() {
  useAppStore();
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const business = getCurrentBusiness();
  const [step, setStep] = useState<"language" | "google" | "service">("language");
  const [serviceName, setServiceName] = useState(
    business.name === "STOM Clinic" ? "" : business.name,
  );
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
              placeholder={t.serviceNamePlaceholder}
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

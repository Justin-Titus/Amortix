import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

type LoginSearchParams = {
  callbackUrl?: string;
  verified?: string;
};

function LoginContent({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  return (
    <Suspense>
      <LoginFormWrapper searchParams={searchParams} />
    </Suspense>
  );
}

function isValidCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || typeof callbackUrl !== "string") {
    return false;
  }

  return callbackUrl.startsWith("/") && !callbackUrl.startsWith("//");
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const safeCallbackUrl = isValidCallbackUrl(params.callbackUrl)
    ? params.callbackUrl
    : "/dashboard";

  return (
    <LoginForm
      callbackUrl={safeCallbackUrl}
      verified={params.verified === "true"}
    />
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  return (
    <AuthSplitLayout>
      <LoginContent searchParams={searchParams} />
    </AuthSplitLayout>
  );
}

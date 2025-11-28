import { DonationSuccessCard } from "@/components/donations/donation-success-card";
import { getPropertyCurrency } from "@/lib/server/property";

export const metadata = {
  title: "Donation Successful | Sahajanand Wellness",
};

export default async function DonateSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const sessionIdValue = resolvedParams.session_id;
  const sessionId = Array.isArray(sessionIdValue) ? sessionIdValue[0] : sessionIdValue;
  const currency = await getPropertyCurrency();

  return (
    <div className="bg-muted/20 py-16">
      <div className="mx-auto max-w-3xl px-6">
        {sessionId ? (
          <DonationSuccessCard sessionId={sessionId} currency={currency} />
        ) : (
          <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-10 text-center">
            <p className="text-lg font-semibold text-destructive">Missing session reference.</p>
            <p className="mt-2 text-sm text-destructive/80">Please return to the donations page and try again.</p>
            <a href="/donate" className="mt-4 inline-flex text-sm font-semibold text-primary underline">
              Back to donations
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

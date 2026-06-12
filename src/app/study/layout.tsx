import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NavigationBlocker } from '@/components/ui/NavigationBlocker';

const SCREEN_OUT_ROUTES: Record<string, string> = {
  S1_ENGLISH:       '/screening/english',
  S2_COMPREHENSION: '/screening/comprehension',
  S3_ATTENTION:     '/screening/attention',
};

export default async function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('participantId')?.value;

  const headersList = await headers();
  const currentPath = headersList.get('x-current-path') || '';

  // Debug mode bypass: skip strict routing guard and DB check entirely
  const isDebugMode = headersList.get('x-debug-mode') === 'true' || participantId === 'debug-participant';

  if (isDebugMode) {
    return (
      <>
        <NavigationBlocker />
        {children}
      </>
    );
  }

  // The proxy allows /study/consent without a participantId because the ID is created ON this page.
  if (!participantId) {
    if (currentPath === '/study/consent') {
      return (
        <>
          <NavigationBlocker />
          {children}
        </>
      );
    }
    // Any other /study/* route requires a participantId
    redirect('/');
  }

  // Fetch the participant's current state from the database
  const p = await db
    .select({ currentPage: participants.currentPage, screenedOutReason: participants.screenedOutReason })
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  if (p.length === 0) {
    // Session desync: cookie exists but no DB record.
    // Delete the cookie so they start fresh.
    cookieStore.delete('participantId');
    // If they were heading to /study/consent, they can re-register on the landing page.
    redirect('/');
  }

  const { currentPage, screenedOutReason } = p[0];

  // Guard 1: Screen-Out Enforcement
  // If this participant has been screened out, lock them to the screening page.
  if (screenedOutReason) {
    const dest = SCREEN_OUT_ROUTES[screenedOutReason] ?? '/screening/english';
    redirect(dest);
  }

  // Guard 2: Protected Consent Page
  // Prevent an active participant from restarting the study via /study/consent.
  if (currentPath === '/study/consent' && currentPage) {
    // They already have an active session — redirect them to where they left off.
    redirect(currentPage);
  }

  // Guard 3: Page Enforcement
  // If the participant is on a different page than the DB thinks they should be on, redirect.
  if (currentPage && currentPath && currentPath.startsWith('/study/') && currentPath !== currentPage) {
    redirect(currentPage);
  }

  return (
    <>
      <NavigationBlocker />
      {children}
    </>
  );
}

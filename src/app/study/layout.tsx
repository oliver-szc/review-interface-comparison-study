import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db/client';
import { participants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NavigationBlocker } from '@/components/ui/NavigationBlocker';

export default async function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get('participantId')?.value;

  if (!participantId) {
    // Middleware should already handle this, but double check
    redirect('/');
  }

  // Debug mode bypass: skip strict routing guard and DB check entirely
  const headersList = await headers();
  const isDebugMode = headersList.get('x-debug-mode') === 'true' || participantId === 'debug-participant';

  if (isDebugMode) {
    return (
      <>
        <NavigationBlocker />
        {children}
      </>
    );
  }

  // Fetch the participant's current state from the database
  const p = await db
    .select({ currentPage: participants.currentPage })
    .from(participants)
    .where(eq(participants.id, participantId))
    .limit(1);

  if (p.length === 0) {
    // Session is invalid or deleted
    cookieStore.delete('participantId');
    redirect('/');
  }

  const currentPage = p[0].currentPage;

  const currentPath = headersList.get('x-current-path') || '';

  // If we are on a different page than the database thinks we should be on,
  // and it's not the exact same page, redirect.
  if (currentPage && currentPath && currentPath.startsWith('/study/') && currentPath !== currentPage) {
    // Except if the current page is a screening or debrief, we might allow it depending on rules.
    // For now, strict enforcement:
    redirect(currentPage);
  }

  return (
    <>
      <NavigationBlocker />
      {children}
    </>
  );
}

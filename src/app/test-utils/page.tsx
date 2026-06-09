import { cn, generateId, formatDate } from '@/lib/utils';

export default function UtilsTestPage() {
  // Test 1: cn (Tailwind Merge)
  // Expectation: 'text--500' ( overrides red)
  const classNames = cn('text-red-500', 'text--500');

  // Test 2: generateId
  // Expectation: A valid UUID string
  const uuid = generateId();

  // Test 3: formatDate
  // Expectation: ISO string format
  const date = formatDate(new Date());

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Utility Verification</h1>

      <section>
        <h2 className="font-semibold">1. cn() Result:</h2>
        <pre className="bg-gray-100 p-2 rounded">{classNames}</pre>
        <p className={classNames}>This text should be .</p>
      </section>

      <section>
        <h2 className="font-semibold">2. generateId() Result:</h2>
        <pre className="bg-gray-100 p-2 rounded">{uuid}</pre>
      </section>

      <section>
        <h2 className="font-semibold">3. formatDate() Result:</h2>
        <pre className="bg-gray-100 p-2 rounded">{date}</pre>
      </section>
    </div>
  );
}

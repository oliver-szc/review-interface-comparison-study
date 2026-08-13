import { db } from '@/db/client';
import { participants, sequencePool } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export type ConditionType = 'BASELINE' | 'DASHBOARD' | 'CHATBOT';
export type ProductId = 'EARBUDS' | 'KETTLE' | 'SWEATSHIRT';

export interface BlockContext {
  conditionType: ConditionType;
  productId: ProductId;
}

const mapAssistance = (char: string): ConditionType => {
  switch (char) {
    case 'B': return 'BASELINE';
    case 'D': return 'DASHBOARD';
    case 'C': return 'CHATBOT';
    default: throw new Error(`Unknown assistance char: ${char}`);
  }
};

const mapProduct = (char: string): ProductId => {
  switch (char) {
    case 'E': return 'EARBUDS';
    case 'K': return 'KETTLE';
    case 'S': return 'SWEATSHIRT';
    default: throw new Error(`Unknown product char: ${char}`);
  }
};

// Static mock sequence for debug-participant: mirrors Sequence 1 in the pool
// Block 1: BASELINE/EARBUDS, Block 2: DASHBOARD/KETTLE, Block 3: CHATBOT/SWEATSHIRT
const DEBUG_SEQUENCE: BlockContext[] = [
  { conditionType: 'BASELINE', productId: 'EARBUDS' },
  { conditionType: 'DASHBOARD', productId: 'KETTLE' },
  { conditionType: 'CHATBOT', productId: 'SWEATSHIRT' },
];

export async function getBlockContext(participantId: string, blockIndex: 1 | 2 | 3): Promise<BlockContext> {
  let isDebugMode = false;
  try {
    const cookieStore = await cookies();
    isDebugMode = cookieStore.get('debugMode')?.value === 'true';
  } catch (e) {
    // ignore
  }

  // Debug mode: return static mock data without hitting the database
  if (participantId === 'debug-participant' || isDebugMode) {
    let productOrder = 'E,K,S'; // default
    let assistanceOrder = 'B,D,C'; // default: Block1=BASELINE, Block2=DASHBOARD, Block3=CHATBOT
    try {
      const cookieStore = await cookies();
      const customProductOrder = cookieStore.get('debugProductSequence')?.value;
      if (customProductOrder) {
        productOrder = customProductOrder;
      }
      const customAssistOrder = cookieStore.get('debugAssistanceOrder')?.value;
      if (customAssistOrder) {
        assistanceOrder = customAssistOrder;
      }
    } catch (e) {
      // ignore
    }

    const productArray = productOrder.split(',');
    const assistArray = assistanceOrder.split(',');

    return {
      conditionType: mapAssistance(assistArray[blockIndex - 1]),
      productId: mapProduct(productArray[blockIndex - 1]),
    };
  }


  const p = await db.select({
      sequenceId: sequencePool.sequenceId,
      assistanceOrder: sequencePool.assistanceOrder,
      productOrder: sequencePool.productOrder,
    })
    .from(participants)
    .innerJoin(sequencePool, eq(participants.id, sequencePool.reservedByParticipantId))
    .where(eq(participants.id, participantId))
    .limit(1);

  if (p.length === 0) {
    throw new Error('Participant or sequence not found');
  }

  const { assistanceOrder, productOrder } = p[0];

  // They are comma separated, e.g. "B,D,C"
  const assistArray = assistanceOrder.split(',');
  const productArray = productOrder.split(',');

  // blockIndex is 1-based (1, 2, 3), so array index is blockIndex - 1
  const arrayIndex = blockIndex - 1;

  if (arrayIndex < 0 || arrayIndex > 2) {
    throw new Error(`Invalid blockIndex: ${blockIndex}`);
  }

  return {
    conditionType: mapAssistance(assistArray[arrayIndex]),
    productId: mapProduct(productArray[arrayIndex]),
  };
}


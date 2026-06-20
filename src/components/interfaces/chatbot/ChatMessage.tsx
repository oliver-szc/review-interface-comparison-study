import { ReactNode } from 'react'

interface ChatMessageProps {
  role: 'user' | 'bot'
  text: string
  /** Render as an error/system message with warning styling */
  isError?: boolean
  /** Show a blinking cursor at the end (while streaming) */
  isStreaming?: boolean
}

function renderInlineMarkdown(text: string, keyPrefix: string, appendCursor: boolean): ReactNode[] {
  const regex = /(\*\*[\s\S]*?\*\*|__[\s\S]*?__|\*[\s\S]*?\*|_[\s\S]*?_)/g;
  const parts = text.split(regex);
  const rendered = parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <strong key={key} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={key} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });

  if (appendCursor) {
    rendered.push(
      <span key="cursor" className="inline-block w-1.5 h-4 ml-0.5 bg-sky-500 rounded-sm animate-pulse align-text-bottom" />
    );
  }

  return rendered;
}

function renderMessageText(text: string, isStreaming: boolean): ReactNode {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let currentListItems: ReactNode[] = [];

  const flushList = (listKey: number) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey}`} className="list-disc pl-5 my-2 space-y-1">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const isLastLine = index === lines.length - 1;
    const shouldAppendCursor = isLastLine && isStreaming;

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = line.replace(/^\s*[-*]\s+/, '');
      currentListItems.push(
        <li key={`li-${index}`} className="text-sm">
          {renderInlineMarkdown(content, `li-content-${index}`, shouldAppendCursor)}
        </li>
      );
    } else {
      flushList(index);
      if (trimmed === '' && !shouldAppendCursor) {
        elements.push(<div key={`empty-${index}`} className="h-2" />);
      } else {
        elements.push(
          <div key={`p-${index}`} className="mb-2 last:mb-0">
            {renderInlineMarkdown(line, `p-content-${index}`, shouldAppendCursor)}
          </div>
        );
      }
    }
  });

  flushList(lines.length);

  return <>{elements}</>;
}

export function ChatMessage({ role, text, isError = false, isStreaming = false }: ChatMessageProps) {
  // Error messages always render as bot-style (left-aligned) with distinct styling
  const effectiveRole = isError ? 'bot' : role

  return (
    <div
      className={`flex ${effectiveRole === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`rounded-xl px-3 py-2 break-words whitespace-pre-wrap text-sm leading-relaxed ${isError
            ? 'max-w-full bg-red-50 text-red-700 border border-red-200 rounded-bl-none'
            : effectiveRole === 'user'
              ? 'max-w-[80%] bg-sky-600 text-white rounded-br-none'
              : 'max-w-full text-slate-700 rounded-bl-none'
          }`}
      >
        <div>
          {renderMessageText(text, isStreaming)}
        </div>
      </div>
    </div>
  );
}

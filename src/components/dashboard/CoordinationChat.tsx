import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, MessageSquare, Send, Users } from 'lucide-react';
import { downloadBlob, toCsv } from '@/lib/csv';
import { useAuth } from '@/hooks/useAuth';
import type { CountryProfile } from '@/data/westAfrica';
import { agencyHeadsFor } from '@/data/commandCenter';

export interface ChatMessage {
  id: string;
  channel: string;
  author: string;
  role: string;
  body: string;
  at: string;
}

const storageKey = (code: string) => `wamhews.chat.${code}`;

const seedFor = (country: CountryProfile): ChatMessage[] => {
  const heads = agencyHeadsFor(country).slice(0, 3);
  const base = Date.now() - 3 * 3600_000;
  return heads.map((h, i) => ({
    id: `seed-${country.code}-${i}`,
    channel: i === 0 ? 'Command' : i === 1 ? 'Field ops' : 'Dissemination',
    author: h.head,
    role: `${h.agencyName} · ${h.title}`,
    body:
      i === 0
        ? `${country.shortName} command room open. Post threshold breaches here with the affected boundary unit.`
        : i === 1
          ? 'Field teams deployed to the highest-risk units. Household verification sweeps under way.'
          : 'SMS cascade and community radio scripts translated; town criers briefed for tonight.',
    at: new Date(base + i * 45 * 60_000).toISOString(),
  }));
};

const channels = ['Command', 'Field ops', 'Dissemination', 'Data'] as const;

/** Operational coordination chat per country, persisted locally and exportable. */
const CoordinationChat = ({ country }: { country: CountryProfile }) => {
  const { user, scope } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channel, setChannel] = useState<string>('Command');
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(country.code));
      setMessages(raw ? (JSON.parse(raw) as ChatMessage[]) : seedFor(country));
    } catch {
      setMessages(seedFor(country));
    }
  }, [country]);

  const persist = (next: ChatMessage[]) => {
    setMessages(next);
    try {
      window.localStorage.setItem(storageKey(country.code), JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const visible = useMemo(() => messages.filter((m) => m.channel === channel), [messages, channel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [visible.length]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    persist([
      ...messages,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        channel,
        author: user?.name ?? 'Operator',
        role: `${scope.agencyCode ?? country.leadAgency} · ${scope.role.replace('_', ' ')}`,
        body,
        at: new Date().toISOString(),
      },
    ]);
    setDraft('');
  };

  const exportCsv = () =>
    downloadBlob(
      `${country.code}-coordination-chat.csv`,
      'text/csv;charset=utf-8',
      toCsv(
        ['timestamp', 'channel', 'author', 'role', 'message'],
        messages.map((m) => [m.at, m.channel, m.author, m.role, m.body]),
      ),
    );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="inline-flex rounded border border-border bg-secondary/40 p-0.5 text-[10px]">
          {channels.map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={`px-2 py-1 rounded transition-colors ${
                channel === c ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" /> {country.focalPersons.active.toLocaleString()} focal persons online
        </span>
        <button
          onClick={exportCsv}
          className="ml-auto inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] text-foreground hover:bg-secondary transition-colors"
        >
          <Download className="h-3 w-3" /> Export transcript
        </button>
      </div>

      <div className="h-[280px] overflow-y-auto rounded-md border border-border bg-secondary/30 p-3 space-y-2">
        {visible.length === 0 && (
          <p className="text-[11px] text-muted-foreground">No messages yet on #{channel.toLowerCase()}.</p>
        )}
        {visible.map((m) => (
          <div key={m.id} className="rounded-md bg-background/60 border border-border/60 p-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-foreground">{m.author}</span>
              <span className="text-[10px] text-muted-foreground">{m.role}</span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                {new Date(m.at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
            <p className="text-[11px] text-foreground mt-1 whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder={`Message #${channel.toLowerCase()} — ${country.shortName} command`}
          className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={send}
          className="inline-flex items-center gap-1 rounded-md bg-primary/25 border border-primary/40 px-3 py-2 text-[11px] text-foreground hover:bg-primary/35 transition-colors"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <MessageSquare className="h-3 w-3" /> Messages are stored on this device and included in the downloadable
        transcript.
      </p>
    </div>
  );
};

export default CoordinationChat;

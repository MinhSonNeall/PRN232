'use client'

import type { ConversationListItemDto } from '@/types/chat'

interface ConversationListProps {
  conversations: ConversationListItemDto[]
  selectedId?: string
  onSelect: (conv: ConversationListItemDto) => void
  /** Group by category with section headers (owner view) */
  categorized?: boolean
}

const CATEGORY_CONFIG: Record<string, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  CurrentTenant: {
    label: 'Current Tenants',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  PendingRequest: {
    label: 'Pending Requests',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    dotClass: 'bg-amber-500',
  },
  Inquiry: {
    label: 'Inquiries',
    bgClass: 'bg-stone-50',
    textClass: 'text-stone-500',
    dotClass: 'bg-stone-400',
  },
}

const CATEGORY_ORDER = ['CurrentTenant', 'PendingRequest', 'Inquiry']

/** Time-ago helper */
function timeAgo(dateStr?: string) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export function ConversationList({ conversations, selectedId, onSelect, categorized }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-stone-400">
        No conversations yet
      </div>
    )
  }

  if (categorized) {
    const grouped = CATEGORY_ORDER.map(cat => ({
      category: cat,
      config: CATEGORY_CONFIG[cat] ?? { label: cat, bgClass: 'bg-stone-50', textClass: 'text-stone-500', dotClass: 'bg-stone-400' },
      items: conversations.filter(c => c.category === cat),
    })).filter(g => g.items.length > 0)

    return (
      <div>
        {grouped.map(group => (
          <div key={group.category}>
            <div className={`sticky top-0 z-10 flex items-center gap-2 px-4 py-2 border-b border-stone-100 ${group.config.bgClass}`}>
              <div className={`h-2 w-2 rounded-full ${group.config.dotClass}`} />
              <span className={`text-[11px] font-semibold uppercase tracking-wider ${group.config.textClass}`}>
                {group.config.label} ({group.items.length})
              </span>
            </div>
            {group.items.map(conv => (
              <ConversationRow
                key={conv.conversationId}
                conv={conv}
                selected={conv.conversationId === selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y divide-stone-100">
      {conversations.map(conv => (
        <ConversationRow
          key={conv.conversationId}
          conv={conv}
          selected={conv.conversationId === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function ConversationRow({
  conv, selected, onSelect,
}: {
  conv: ConversationListItemDto
  selected: boolean
  onSelect: (conv: ConversationListItemDto) => void
}) {
  return (
    <button
      onClick={() => onSelect(conv)}
      className={`w-full text-left px-4 py-3 transition-colors hover:bg-stone-50 ${
        selected ? 'bg-teal-50 border-l-2 border-teal-500' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-stone-800 truncate">{conv.otherPartyName}</span>
        <span className="text-[10px] text-stone-400 flex-shrink-0 ml-2">{timeAgo(conv.lastMessageAt)}</span>
      </div>
      {conv.listingTitle && (
        <p className="text-[11px] text-teal-600 truncate mt-0.5">{conv.listingTitle}</p>
      )}
      {conv.lastMessageBody && (
        <p className="text-xs text-stone-500 truncate mt-0.5">
          {conv.lastMessageBody.length > 60
            ? conv.lastMessageBody.slice(0, 60) + '...'
            : conv.lastMessageBody}
        </p>
      )}
    </button>
  )
}

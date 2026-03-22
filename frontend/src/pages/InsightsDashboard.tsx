import { useEffect, useMemo, useState } from 'react'

import heroCharacter from '../assets/insights-hero-character.png'
import { listExperiments } from '../lib/api'
import type { Experiment } from '../lib/types'
import '../styles/insights-dashboard.css'

type IconProps = {
  className?: string
}

type EarningsRow = {
  id: string
  name: string
  subtitle: string
  currentPledge: number
  lifetimeSupport: number
  deltaPct: number
  storageUsed: number
  storageTotal: number
  accent: 'blue' | 'salmon'
}

type MembershipBar = {
  label: string
  value: number
  tone: 'sky' | 'blue'
}

const FALLBACK_ROWS: EarningsRow[] = [
  {
    id: 'fallback-1',
    name: 'EchoBot',
    subtitle: 'GPT4-based',
    currentPledge: 80,
    lifetimeSupport: 512,
    deltaPct: 12,
    storageUsed: 128,
    storageTotal: 512,
    accent: 'blue',
  },
  {
    id: 'fallback-2',
    name: 'EchoBot',
    subtitle: 'GPT4-based',
    currentPledge: 160,
    lifetimeSupport: 256,
    deltaPct: 12,
    storageUsed: 128,
    storageTotal: 512,
    accent: 'salmon',
  },
]

const MEMBERSHIP_BARS: MembershipBar[] = [
  { label: '18 Jul', value: 45, tone: 'sky' },
  { label: '25 Jul', value: 65, tone: 'blue' },
  { label: '3 Aug', value: 90, tone: 'sky' },
  { label: '10 Aug', value: 55, tone: 'blue' },
  { label: '17 Aug', value: 80, tone: 'sky' },
]

type NavItem = {
  key: string;
  label: string;
  icon: React.FC<IconProps>;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'insights', label: 'Insights', icon: FolderIcon, active: true },
  { key: 'models', label: 'Chat bots', icon: BotIcon },
  { key: 'schedules', label: 'Schedule', icon: CalendarIcon },
  { key: 'payouts', label: 'Payouts', icon: WalletIcon },
  { key: 'settings', label: 'Settings', icon: GridIcon },
]

const dollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatStat(value: number): string {
  if (value >= 1000) {
    return `${Math.round((value / 1000) * 10) / 10}k`
  }
  return `${value}`
}

export default function InsightsDashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false) // Default not collapsed

  useEffect(() => {
    const media = window.matchMedia('(max-width: 960px)')
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsCollapsed(true)
      }
    }

    if (media.matches) {
      setIsCollapsed(true)
    }

    media.addEventListener('change', onMediaChange)
    return () => media.removeEventListener('change', onMediaChange)
  }, [])

  useEffect(() => {
    let active = true

    setIsLoading(true)
    listExperiments()
      .then((rows) => {
        if (!active) return
        setExperiments(rows)
        setError(null)
      })
      .catch((err: Error) => {
        if (!active) return
        setExperiments([])
        setError(err.message)
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const {
    activeExperiments,
    recentExperiments,
    ciTriageCount,
    audienceNewPct,
    earningsRows,
  } = useMemo(() => {
    return {
      activeExperiments: experiments.length || 678,
      recentExperiments: 256,
      ciTriageCount: 12,
      audienceNewPct: 68,
      earningsRows: FALLBACK_ROWS,
    }
  }, [experiments])

  return (
    <div className="insights-dashboard">
      <div className="insights-shell">
        <nav className={`insights-sidebar ${isCollapsed ? 'is-collapsed' : ''}`} aria-label="Primary navigation">
          
          <div className="insights-sidebar-top">
            <div className="insights-logo-mark" aria-hidden="true" style={{marginBottom: '16px'}}>
              <BoltIcon />
            </div>

            <ul className="insights-nav-list">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      aria-label={item.label}
                      className={`insights-nav-item ${item.active ? 'is-active' : ''}`}
                    >
                      <Icon className="insights-nav-icon" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <button
            type="button"
            className="insights-collapse-toggle"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setIsCollapsed((current) => !current)}
          >
            <ArrowIcon className={isCollapsed ? 'is-right' : ''} />
          </button>
        </nav>

        <main className="insights-main">
          <header className="insights-header">
            <div className="insights-header-left">
              <h1>Insights</h1>
              <button type="button" className="insights-header-ghost" aria-label="Previous range">
                <ChevronLeftIcon />
              </button>
              <button type="button" className="insights-header-ghost" aria-label="Next range">
                <ChevronRightIcon />
              </button>
            </div>
            <div className="insights-header-actions">
              <button type="button" className="insights-header-icon" aria-label="Add widget">
                <PlusCircleIcon />
              </button>
              <button type="button" className="insights-header-icon" aria-label="Notifications">
                <BellIcon />
              </button>
              <button type="button" className="insights-header-icon" aria-label="Search">
                <SearchIcon />
              </button>
              <button type="button" className="insights-avatar" aria-label="Open profile">
                <img src={heroCharacter} alt="Profile" style={{width: '100%', height:'100%', objectFit: 'cover', borderRadius: '50%'}} />
              </button>
            </div>
          </header>

          <section className="insights-grid-top">
            <article className="insights-card insights-hero-card">
              <div className="insights-hero-copy">
                <h2>Unlock Pro Insights</h2>
                <button type="button" className="insights-hero-cta">
                  View earning
                  <ChevronRightIcon />
                </button>
              </div>
              <div className="insights-hero-image-wrap" aria-hidden="true">
                <img src={heroCharacter} alt="" className="insights-hero-image" style={{ mixBlendMode: 'darken' }} />
              </div>

              <div className="insights-hero-metrics">
                <div>
                  <p>Active user</p>
                  <div className="metric-group">
                    <strong>{formatStat(activeExperiments)}</strong>
                    <span className="insights-delta">▲ 32%</span>
                  </div>
                </div>
                <div>
                  <p>New</p>
                  <div className="metric-group">
                    <strong>{formatStat(recentExperiments)}</strong>
                    <span className="insights-delta">▲ 48%</span>
                  </div>
                </div>
                <div>
                  <p>Cancelled</p>
                  <div className="metric-group">
                    <strong>{formatStat(ciTriageCount)}</strong>
                    <span className="insights-delta is-down">▼ 48%</span>
                  </div>
                </div>
              </div>
            </article>

            <div className="insights-side-column">
              <article className="insights-card insights-membership-card">
                <div className="insights-section-heading">
                  <h3>Membership</h3>
                  <span>1000</span>
                </div>
                <div className="insights-membership-bars" aria-hidden="true">
                  <div className="insights-membership-gridline" style={{bottom: '40px'}} />
                  {MEMBERSHIP_BARS.map((bar) => (
                    <div key={bar.label} className="insights-membership-bar">
                      <div className={`insights-membership-column ${bar.tone}`} style={{ height: `${bar.value}%` }} />
                      <small>{bar.label}</small>
                    </div>
                  ))}
                  <small className="insights-membership-zero">0</small>
                </div>
              </article>

              <article className="insights-card insights-audiences-card">
                <h3>Audiences</h3>
                <div className="insights-audience-main">
                  <div className="insights-donut" aria-hidden="true">
                    <div className="insights-donut-hole" />
                  </div>
                  <div className="insights-audience-details">
                    <strong>{audienceNewPct}%</strong>
                    <ul>
                      <li>
                        <span className="dot dot-blue" />New <em>▲ 8%</em>
                      </li>
                      <li>
                        <span className="dot dot-sky" />Subscribed <em>▲ 2%</em>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="insights-audience-scroll">
                  <button><ChevronLeftIcon style={{transform: 'rotate(90deg)'}} /></button>
                  <button><ChevronLeftIcon style={{transform: 'rotate(-90deg)'}} /></button>
                </div>
              </article>
            </div>
          </section>

          <section className="insights-card insights-earnings-card">
            <div className="insights-earnings-top">
              <h3>Earnings</h3>
              <div className="insights-timeframes" role="tablist" aria-label="Earnings time range">
                {['1D', '1W', '1M', '1Y', 'All time'].map((frame, index) => (
                  <button key={frame} type="button" className={index === 0 ? 'is-selected' : ''}>
                    {frame}
                  </button>
                ))}
              </div>
            </div>

            <div className="insights-earnings-table-wrap">
              <table className="insights-earnings-table">
                <thead>
                  <tr>
                    <th>Chatbot</th>
                    <th>Current pledge</th>
                    <th>Lifetime support</th>
                    <th>Available storage</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="insights-row-project">
                          <div className={`insights-row-avatar ${row.accent}`} aria-hidden="true">
                            <div className="eye" />
                            <div className="eye" />
                          </div>
                          <div>
                            <strong>{row.name}</strong>
                            <span>{row.subtitle}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className="td-value">{dollar.format(row.currentPledge)}</span></td>
                      <td>
                        <span className="td-value td-lifetime">
                          {dollar.format(row.lifetimeSupport)} 
                          <span className="insights-delta">▲ {row.deltaPct}%</span>
                        </span>
                      </td>
                      <td>
                        <div className="insights-storage-cell">
                          <div className="insights-storage-track">
                            <div className="insights-storage-fill" style={{ width: `${(row.storageUsed/row.storageTotal)*100}%` }} />
                          </div>
                          <span>
                            {row.storageUsed}<span>/{row.storageTotal} Gb</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function BoltIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={className ? undefined : {width: '100%', height: '100%'}}>
      <path d="M13.5 2.5 5.2 12.4h5l-1.8 9.1 8.5-10h-5.2l1.8-9Z" fill="currentColor" />
    </svg>
  )
}

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 11.5 12 5l7.5 6.5v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.7 10h16.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 6V4.8a.8.8 0 0 1 .8-.8h2.4a.8.8 0 0 1 .8.8V6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function BotIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="8" width="14" height="11" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 4v3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="13" r="1" fill="currentColor" />
      <circle cx="15" cy="13" r="1" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 4v4M16 4v4M4 10h16" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function WalletIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ChevronLeftIcon({ className, style }: IconProps & {style?: React.CSSProperties}) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon({ className, style }: IconProps & {style?: React.CSSProperties}) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m14 6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusCircleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 10a5 5 0 0 1 10 0v4l2 2H5l2-2v-4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 18a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

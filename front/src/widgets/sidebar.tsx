import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {useAppSelector} from "../app/hooks.ts";

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
)

const ApplicantsIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
)

const LogoMark = () => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <rect width="30" height="30" rx="9" fill="url(#lg)"/>
        <path d="M9 21L15 9L21 21" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 17H19" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="30" y2="30">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
            </linearGradient>
        </defs>
    </svg>
)

const AgentRobotIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="12" rx="3" />
        <circle cx="9" cy="14" r="1" />
        <circle cx="15" cy="14" r="1" />
        <path d="M10 17h4" />
    </svg>
);
const navItems = [
    { to: '/account', label: 'Мой аккаунт', Icon: UserIcon },
    { to: '/applicants', label: 'Список заявителей', Icon: ApplicantsIcon },
    { to: '/agent-setting', label: 'Настройка агентов', Icon: AgentRobotIcon },
]

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true)
    const { status } = useAppSelector((state) => state.auth)

    const css = `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
    
            .sb { font-family:'Outfit',sans-serif; }
    
            .sb-wrap {
                width: ${isOpen ? '256px' : '68px'};
                height: 100vh;
                background: linear-gradient(170deg,#0f0f1a 0%,#141428 55%,#111120 100%);
                border-right: 1px solid rgba(255,255,255,0.055);
                display: flex;
                flex-direction: column;
                padding: 18px 10px 14px;
                box-sizing: border-box;
                transition: width 0.38s cubic-bezier(.4,0,.2,1);
                overflow: hidden;
                flex-shrink: 0;
                position: relative;
                box-shadow: 6px 0 40px rgba(0,0,0,0.45);
            }
    
            .sb-glow-top {
                position:absolute;top:-80px;left:-50px;
                width:220px;height:220px;
                background:radial-gradient(circle,rgba(99,102,241,.13) 0%,transparent 70%);
                pointer-events:none;
            }
            .sb-glow-btm {
                position:absolute;bottom:30px;right:-50px;
                width:170px;height:170px;
                background:radial-gradient(circle,rgba(139,92,246,.07) 0%,transparent 70%);
                pointer-events:none;
            }
    
            .sb-header {
                display:flex;align-items:center;gap:12px;
                padding: 4px 6px;
                margin-bottom:28px;
                min-width:0;flex-shrink:0;
            }
            .sb-logo-text {
                font-size:17px;font-weight:700;letter-spacing:-.3px;
                background:linear-gradient(90deg,#fff 0%,#a5b4fc 100%);
                -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
                white-space:nowrap;
                opacity:${isOpen?1:0};
                transition:opacity .2s ease;
            }
    
            .sb-section {
                font-size:9.5px;font-weight:600;letter-spacing:1.3px;text-transform:uppercase;
                color:rgba(255,255,255,.18);padding:0 10px;margin-bottom:6px;
                white-space:nowrap;
                opacity:${isOpen?1:0};transition:opacity .2s ease;
            }
    
            .sb-nav { display:flex;flex-direction:column;gap:3px;flex:1; }
    
            .sb-link {
                display:flex;align-items:center;gap:13px;
                padding:11px 10px;border-radius:11px;
                text-decoration:none;
                color:rgba(255,255,255,.4);
                font-size:13.5px;font-weight:500;
                white-space:nowrap;
                transition:all .2s ease;
                position:relative;overflow:hidden;
            }
            .sb-link:hover {
                background:rgba(255,255,255,.055);
                color:rgba(255,255,255,.8);
            }
            .sb-link.active {
                background:linear-gradient(130deg,rgba(99,102,241,.22) 0%,rgba(139,92,246,.13) 100%);
                color:#fff;
                box-shadow:inset 0 0 0 1px rgba(99,102,241,.3);
            }
            .sb-link.active::before {
                content:'';position:absolute;left:0;top:22%;bottom:22%;
                width:3px;border-radius:0 3px 3px 0;
                background:linear-gradient(180deg,#818cf8,#a78bfa);
            }
            .sb-icon { flex-shrink:0;display:flex;align-items:center;justify-content:center;width:20px; }
            .sb-label { opacity:${isOpen?1:0};transition:opacity .18s ease; }
    
            .sb-divider { height:1px;background:rgba(255,255,255,.055);margin:14px 4px; }
    
            .sb-toggle {
                display:flex;align-items:center;gap:11px;
                padding:10px 10px;border-radius:11px;border:none;
                background:rgba(255,255,255,.035);
                color:rgba(255,255,255,.3);
                font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;
                cursor:pointer;transition:all .2s ease;white-space:nowrap;
                box-sizing:border-box;width:100%;
            }
            .sb-toggle:hover { background:rgba(255,255,255,.07);color:rgba(255,255,255,.65); }
            .sb-toggle-label { opacity:${isOpen?1:0};transition:opacity .18s ease; }
            .sb-chevron {
                flex-shrink:0;display:flex;align-items:center;
                transition:transform .38s cubic-bezier(.4,0,.2,1);
                transform:rotate(${isOpen?'0':'180'}deg);
            }
        `
    if (status === 'authenticated') {
        return (
            <div className="sb">
                <style>{css}</style>
                <div className="sb-wrap">
                    <div className="sb-glow-top"/>
                    <div className="sb-glow-btm"/>

                    {/* Logo */}
                    <div className="sb-header">
                        <LogoMark/>
                        <span className="sb-logo-text">AiNexus</span>
                    </div>

                    {/* Section label */}
                    <div className="sb-section"></div>

                    {/* Nav links */}
                    <nav className="sb-nav">
                        {navItems.map(({ to, label, Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
                            >
                                <span className="sb-icon"><Icon /></span>
                                <span className="sb-label">{label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="sb-divider"/>

                    {/* Toggle */}
                    <button className="sb-toggle" onClick={() => setIsOpen(p => !p)}>
                        <span className="sb-chevron">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </span>
                        <span className="sb-toggle-label">Свернуть панель</span>
                    </button>
                </div>
            </div>
        )
    }

}
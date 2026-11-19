type IconName = "grid"|"test"|"pyq"|"chapter"|"bookmark"|"settings"|"search"|"bell"|"user"|"help"|"moon"|"sun"|"menu"|"close"|"chevron"|"logout";

export function Icon({name,size=20}:{name:IconName;size?:number}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    test:<><path d="M7 3h10l4 4v14H3V3h4Z"/><path d="M8 2v5H3M8 12h8M8 16h8"/></>,
    pyq:<><path d="M5 3h14v18H5z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    chapter:<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V5H6.5A2.5 2.5 0 0 0 4 7.5v12Z"/><path d="M4 7.5v12"/></>,
    bookmark:<path d="M6 3h12v18l-6-4-6 4V3Z"/>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.9 1.9-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2H10V20a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.9-1.9.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 4 14H3.8v-2.8H4A1.7 1.7 0 0 0 5.5 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 6.1l.1.1A1.7 1.7 0 0 0 9 6.5 1.7 1.7 0 0 0 10 5V4.8h3V5a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.9 1.9-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 19 11h.2v3H19a1.7 1.7 0 0 0 .4 1Z"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    help:<><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.4 2c-1.2.7-1.2 1.3-1.2 2M12 17h.01"/></>,
    moon:<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
    close:<path d="m5 5 14 14M19 5 5 19"/>,
    chevron:<path d="m8 10 4 4 4-4"/>,
    logout:<><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h7v18h-7"/></>
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function SpotifyLogo() {
  return (
    <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 .007c-6.627 0-12 5.372-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.49 17.31c-.22.36-.685.478-1.045.257-2.9-1.775-6.55-2.176-10.85-1.192-.41.09-.82-.164-.915-.575-.09-.41.163-.82.574-.915 4.71-1.077 8.73-.617 11.977 1.37.36.223.478.69.258 1.055zm1.465-3.266c-.277.45-.866.597-1.317.32-3.32-2.04-8.38-2.63-12.305-1.44-.505.153-1.04-.136-1.193-.64-.153-.505.136-1.04.64-1.194 4.482-1.36 10.05-.7 13.856 1.64.45.278.6.867.32 1.315zm.126-3.39c-3.982-2.363-10.552-2.58-14.35-.765-.61.185-1.258-.155-1.443-.767-.186-.61.155-1.258.767-1.443 4.385-1.33 11.62-1.07 16.21 1.656.55.326.73 1.037.4 1.588-.325.55-1.037.73-1.587.4z"/>
      </svg>
      <span>Spotify</span>
    </div>
  );
}

function NetflixLogo() {
  return (
    <div className="flex items-center gap-1 font-extrabold tracking-tighter text-base">
      <svg className="h-5 w-4 fill-current text-red-600 dark:text-red-500" viewBox="0 0 24 24">
        <path d="M16 0v24h-3.412l-5.176-14.824v14.824h-3.412v-24h3.412l5.176 14.824v-14.824z" />
      </svg>
      <span>NETFLIX</span>
    </div>
  );
}

function YoutubeLogo() {
  return (
    <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
      <svg className="h-4.5 w-auto fill-current text-red-600 dark:text-red-500" viewBox="0 0 24 24">
        <path d="M23.498 6.163c-.272-1.016-1.07-1.815-2.085-2.087C19.578 3.53 12 3.53 12 3.53s-7.578 0-9.413.546c-1.015.272-1.813 1.071-2.085 2.087C0 8.002 0 12 0 12s0 3.998.502 5.837c.272 1.016 1.07 1.815 2.085 2.087 1.835.547 9.413.547 9.413.547s7.578 0 9.413-.547c1.015-.272 1.813-1.071 2.085-2.087C24 15.998 24 12 24 12s0-3.998-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      <span>YouTube</span>
    </div>
  );
}

function InstagramLogo() {
  return (
    <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
      <svg className="size-4.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
      <span>Instagram</span>
    </div>
  );
}

function ShopifyLogo() {
  return (
    <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
      <svg className="size-4.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
      </svg>
      <span>Shopify</span>
    </div>
  );
}

const PARTNERS = [
  { name: "Spotify", logo: SpotifyLogo },
  { name: "Netflix", logo: NetflixLogo },
  { name: "YouTube", logo: YoutubeLogo },
  { name: "Instagram", logo: InstagramLogo },
  { name: "Shopify", logo: ShopifyLogo },
];

export function TrustedBy() {
  return (
    <section className="w-full border-y border-border/40 bg-muted/20 py-7 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col md:flex-row items-center gap-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap md:border-r md:border-border/30 md:pr-8 h-5 flex items-center">
          Trusted by:
        </span>
        
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
          <div className="flex flex-nowrap w-max gap-16 animate-marquee hover:[animation-play-state:paused]">
            {/* First set */}
            {PARTNERS.map((partner, idx) => (
              <div key={`p1-${idx}`} className="flex items-center gap-2 text-muted-foreground/50 hover:text-foreground/80 transition-colors cursor-default">
                <partner.logo />
              </div>
            ))}
            {/* Second set for seamless looping */}
            {PARTNERS.map((partner, idx) => (
              <div key={`p2-${idx}`} className="flex items-center gap-2 text-muted-foreground/50 hover:text-foreground/80 transition-colors cursor-default">
                <partner.logo />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const googleAds = {
  id: 'AW-18382707513',
  form: 'AW-18382707513/gSlHCMrZ1ocdELm2x71E',
  sms: 'AW-18382707513/5S_bCPaB0ocdELm2x71E',
} as const;

type ConversionParameters = { send_to: string; transaction_id?: string };
type SendConversion = (command: 'event', event: 'conversion', parameters: ConversionParameters) => void;

declare global {
  interface Window {
    gtag?: SendConversion;
  }
}

// Local development and preview hosts must not send production conversions.
export function isProductionHost(hostname: string): boolean {
  return hostname === 'ansebjunk.com' || hostname === 'www.ansebjunk.com';
}

export function createGoogleAdsTracker(hostname: string, send: SendConversion) {
  const recordedLeads = new Set<string>();
  const enabled = isProductionHost(hostname);

  return {
    formAccepted(result: unknown): boolean {
      if (!enabled || typeof result !== 'object' || result === null) return false;
      const response = result as { success?: unknown; lead_id?: unknown };
      // The PHP endpoint supplies an ID only after mail() accepts a real lead.
      // Errors and silent antispam successes must never become conversions.
      if (response.success !== true || typeof response.lead_id !== 'string' ||
          !/^[a-f0-9]{32}$/.test(response.lead_id) || recordedLeads.has(response.lead_id)) return false;
      try {
        send('event', 'conversion', { send_to: googleAds.form, transaction_id: response.lead_id });
        recordedLeads.add(response.lead_id);
        return true;
      } catch {
        return false;
      }
    },
    smsClicked(href: string): boolean {
      if (!enabled || !/^sms:/i.test(href)) return false;
      try {
        // This measures opening the SMS app, never a sent message or qualified lead.
        send('event', 'conversion', { send_to: googleAds.sms });
        return true;
      } catch {
        return false;
      }
    },
  };
}

export const adsTracker = createGoogleAdsTracker(
  typeof window === 'undefined' ? '' : window.location.hostname,
  (...args) => window.gtag?.(...args),
);

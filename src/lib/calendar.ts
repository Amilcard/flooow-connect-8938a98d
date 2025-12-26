import { format } from "date-fns";

interface EventData {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
}

/**
 * Formate une date pour iCal (format: YYYYMMDDTHHMMSSZ)
 */
const formatICalDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

/**
 * Formate une date pour Google Calendar (format: YYYYMMDDTHHMMSSZ)
 */
const formatGoogleCalendarDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

/**
 * Génère un fichier iCal à partir d'un événement et le télécharge
 */
export const exportToICal = (event: EventData): void => {
  const startDate = formatICalDate(event.start_date);
  const endDate = event.end_date 
    ? formatICalDate(event.end_date)
    : formatICalDate(event.start_date);
  
  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Flooow//Events//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Événement Territoire
X-WR-TIMEZONE:Europe/Paris
BEGIN:VEVENT
UID:${event.id}@flooow.app
DTSTAMP:${formatICalDate(new Date().toISOString())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  // Créer un blob et télécharger le fichier
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Génère un lien Google Calendar et ouvre un nouvel onglet
 */
export const exportToGoogleCalendar = (event: EventData): void => {
  const startDate = formatGoogleCalendarDate(event.start_date);
  const endDate = event.end_date 
    ? formatGoogleCalendarDate(event.end_date)
    : formatGoogleCalendarDate(event.start_date);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || '',
    location: event.location || '',
  });

  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;
  window.open(url, '_blank');
};

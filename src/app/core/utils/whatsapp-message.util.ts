export interface MatchMessageInput {
  dateLabel: string;
  time?: string;
  venue?: string;
  availabilityHint: string;
  confirmedCount: number;
}

export function buildMatchWhatsAppMessage(input: MatchMessageInput): string {
  const lines = [
    'Sunday Football — Match',
    '',
    `Date: ${input.dateLabel}`,
  ];
  if (input.time) {
    lines.push(`Time: ${input.time}`);
  }
  if (input.venue) {
    lines.push(`Venue: ${input.venue}`);
  }
  lines.push('');
  lines.push(`${input.confirmedCount} player(s) confirmed so far.`);
  lines.push('');
  lines.push('Mark your availability:');
  lines.push(input.availabilityHint);
  return lines.join('\n');
}

export function whatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
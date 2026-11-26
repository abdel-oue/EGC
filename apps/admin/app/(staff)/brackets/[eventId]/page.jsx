import { redirect } from "next/navigation";

// Brackets now live in the event page.
export default async function BracketPage({ params }) {
  const { eventId } = await params;
  redirect(`/events/${eventId}?tab=bracket`);
}

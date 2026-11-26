import { withMembersOnly } from "@/components/auth/MembersOnly";
import EventListScreen from "@/screens/event-list-screen";

function EventRsvpsRoute() {
  return <EventListScreen mode="rsvps" />;
}

export default withMembersOnly(EventRsvpsRoute, "rsvp");

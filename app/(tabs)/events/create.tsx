import { withMembersOnly } from "@/components/auth/MembersOnly";
import EventFormScreen from "@/screens/event-form-screen";

function CreateEventRoute() {
  return <EventFormScreen mode="create" />;
}

export default withMembersOnly(CreateEventRoute, "event");

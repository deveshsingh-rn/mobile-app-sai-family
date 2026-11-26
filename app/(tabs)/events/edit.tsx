import { withMembersOnly } from "@/components/auth/MembersOnly";
import EventFormScreen from "@/screens/event-form-screen";

function EditEventRoute() {
  return <EventFormScreen mode="edit" />;
}

export default withMembersOnly(EditEventRoute, "event");

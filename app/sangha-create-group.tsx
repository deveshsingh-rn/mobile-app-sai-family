import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaCreateGroupScreen from "@/screens/sangha-create-group-screen";

function SanghaCreateGroupRoute() {
  return <SanghaCreateGroupScreen />;
}

export default withMembersOnly(SanghaCreateGroupRoute, "connect");

import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaCreateGroupScreen from "@/screens/sangha-create-group-screen";

function SanghaEditGroupRoute() {
  return <SanghaCreateGroupScreen mode="edit" />;
}

export default withMembersOnly(SanghaEditGroupRoute, "connect");

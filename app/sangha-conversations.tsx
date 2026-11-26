import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaConversationsScreen from "@/screens/sangha-conversations-screen";

function SanghaConversationsRoute() {
  return <SanghaConversationsScreen />;
}

export default withMembersOnly(SanghaConversationsRoute, "message");

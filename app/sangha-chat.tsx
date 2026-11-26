import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaChatScreen from "@/screens/sangha-chat-screen";

function SanghaChatRoute() {
  return <SanghaChatScreen />;
}

export default withMembersOnly(SanghaChatRoute, "message");

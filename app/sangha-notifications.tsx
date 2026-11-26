import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaNotificationsScreen from "@/screens/sangha-notifications-screen";

export default withMembersOnly(SanghaNotificationsScreen, "connect");
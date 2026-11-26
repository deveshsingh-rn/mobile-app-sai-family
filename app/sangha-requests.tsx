import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaRequestsScreen from "@/screens/sangha-requests-screen";

export default withMembersOnly(SanghaRequestsScreen, "connect");
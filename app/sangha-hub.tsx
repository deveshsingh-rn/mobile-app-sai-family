import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaHubScreen from '@/screens/sangha-hub-screen';

export default withMembersOnly(SanghaHubScreen, "connect");
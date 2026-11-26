import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaHubListScreen from '@/screens/sangha-hub-list-screen';

export default withMembersOnly(SanghaHubListScreen, "connect");
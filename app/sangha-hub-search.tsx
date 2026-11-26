import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaHubSearchScreen from '@/screens/sangha-hub-search-screen';

export default withMembersOnly(SanghaHubSearchScreen, "connect");
import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaProfileScreen from '@/screens/sangha-profile-screen';

export default withMembersOnly(SanghaProfileScreen, "connect");
import { withMembersOnly } from "@/components/auth/MembersOnly";
import SanghaListScreen from '@/screens/sangha-list-screen';

export default withMembersOnly(SanghaListScreen, "connect");
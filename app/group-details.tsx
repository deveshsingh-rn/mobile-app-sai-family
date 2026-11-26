import { withMembersOnly } from "@/components/auth/MembersOnly";
import GroupDetailsScreen from '@/screens/group-details-screen';

export default withMembersOnly(GroupDetailsScreen, "connect");
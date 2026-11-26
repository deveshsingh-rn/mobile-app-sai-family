import { withMembersOnly } from "@/components/auth/MembersOnly";
import CreateListingScreen from '@/screens/create-listing';

export default withMembersOnly(CreateListingScreen, "listing");
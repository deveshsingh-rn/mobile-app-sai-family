import { withMembersOnly } from "@/components/auth/MembersOnly";
import BusinessReviewScreen from '@/screens/bussiness-review-screen';

export default withMembersOnly(BusinessReviewScreen, "review");
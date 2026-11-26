import { withMembersOnly } from "@/components/auth/MembersOnly";
import DirectoryListingCollectionScreen from '@/screens/directory-listing-collection-screen';

function MyListingsRoute() {
  return <DirectoryListingCollectionScreen mode="mine" />;
}

export default withMembersOnly(MyListingsRoute, "listing");

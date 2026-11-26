import { withMembersOnly } from "@/components/auth/MembersOnly";
import DirectoryListingCollectionScreen from '@/screens/directory-listing-collection-screen';

function SavedListingsRoute() {
  return <DirectoryListingCollectionScreen mode="saved" />;
}

export default withMembersOnly(SavedListingsRoute, "bookmark");

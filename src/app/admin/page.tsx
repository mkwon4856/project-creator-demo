import { ActivityFeed } from './_components/ActivityFeed';
import AdminOverviewClient from './AdminOverviewClient';

export default function AdminOverviewPage() {
  return <AdminOverviewClient activityFeed={<ActivityFeed />} />;
}

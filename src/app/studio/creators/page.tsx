import { fetchAllCreators } from '@/lib/api/creators.server';

import { CreatorBrowse } from './_components/CreatorBrowse';

// 게임사 전용 크리에이터 둘러보기. 서버에서 전체 목록을 받아 클라이언트에서 필터링.
export default async function StudioCreatorsPage() {
  const { creators, total } = await fetchAllCreators();
  return <CreatorBrowse creators={creators} total={total} />;
}

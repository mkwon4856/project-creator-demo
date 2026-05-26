'use client';

import { useParams, useRouter } from 'next/navigation';

import { Modal } from '@/components/ui';
import { CampaignDetailContent } from '@/components/campaign/CampaignDetailContent';

export default function CampaignInterceptedModal() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const handleClose = () => router.back();

  return (
    <Modal open onClose={handleClose} size="lg" ariaLabel="Campaign details">
      <CampaignDetailContent campaignId={id} variant="modal" onClose={handleClose} />
    </Modal>
  );
}

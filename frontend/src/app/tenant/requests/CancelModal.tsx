'use client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function CancelModal({ isOpen, onClose, onConfirm, isLoading }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Request"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Keep Request</Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>Yes, Cancel</Button>
        </>
      }
    >
      <p>Are you sure you want to cancel this rental request? This action cannot be undone.</p>
    </Modal>
  )
}

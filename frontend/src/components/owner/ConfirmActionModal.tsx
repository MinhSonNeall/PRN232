'use client'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isLoading?: boolean
  variant?: 'danger' | 'primary'
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  variant = 'primary',
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>Confirm</Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { NexusHandoverForm } from '@/features/smartnet-nexus/components/nexus-handover-form';
import '@/features/smartnet-nexus/components/nexus-research-flow.css';

type Props = {
  projectName: string;
  defaultSummary?: string;
  label?: string;
  variant?: 'primary' | 'secondary';
};

export function ProjectCallTrigger({
  projectName,
  defaultSummary,
  label = 'Set up a call',
  variant = 'primary',
}: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const prefilledSummary =
    defaultSummary ||
    `I would like to set up a call with SmartNet to discuss ${projectName} and see how it could apply to our needs.`;

  return (
    <>
      <button
        type="button"
        className={
          variant === 'primary'
            ? 'sn-btn-primary'
            : 'sn-btn-secondary'
        }
        onClick={() => setOpen(true)}
      >
        <Calendar size={15} aria-hidden="true" />
        <span>{label}</span>
      </button>

      {open && (
        <dialog
          ref={dialogRef}
          className="sn-call-dialog"
          aria-label={`Set up a call about ${projectName}`}
          onCancel={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
          onClick={(event) => {
            if (event.target === dialogRef.current) {
              setOpen(false);
            }
          }}
        >
          <NexusHandoverForm
            initialCompany=""
            initialWebsite=""
            initialSummary={prefilledSummary}
            onDismiss={() => setOpen(false)}
            onCloseAll={() => setOpen(false)}
          />
        </dialog>
      )}
    </>
  );
}

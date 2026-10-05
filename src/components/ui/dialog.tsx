'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
    description?: React.ReactNode;
  }
>(({ className, title, description, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[2px]" />
    <DialogPrimitive.Content
      ref={ref}
      // Without a description Radix warns unless this is explicitly unset.
      {...(description ? {} : { 'aria-describedby': undefined })}
      className={cn(
        'fixed left-1/2 top-1/2 z-[60] flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-surface-3 bg-white shadow-xl outline-none',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 border-b border-surface-3 px-6 py-4">
        <div className="min-w-0">
          <DialogPrimitive.Title className="font-display text-base font-semibold text-ink">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description asChild>
              <div className="mt-1 text-xs text-ink-3">{description}</div>
            </DialogPrimitive.Description>
          )}
        </div>
        <DialogPrimitive.Close
          aria-label="Close"
          className="rounded-md p-1.5 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </div>
      <div className="overflow-y-auto px-6 py-5">{children}</div>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';

export { Dialog, DialogContent };

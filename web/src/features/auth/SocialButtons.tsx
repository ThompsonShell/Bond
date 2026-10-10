'use client';

import { useState } from 'react';
import { Button, Divider, Meta } from '@/components/ui';

/** Google / GitHub buttons. Real OAuth is not part of the design yet (HANDOFF §12). */
export function SocialButtons() {
  const [note, setNote] = useState(false);
  return (
    <>
      <Divider>yoki</Divider>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Button variant="secondary" style={{ flex: '1 1 140px' }} onClick={() => setNote(true)}>
          Google
        </Button>
        <Button variant="secondary" style={{ flex: '1 1 140px' }} onClick={() => setNote(true)}>
          GitHub
        </Button>
      </div>
      {note && <Meta role="status">Google va GitHub orqali kirish hali ulanmagan — email bilan davom eting.</Meta>}
    </>
  );
}

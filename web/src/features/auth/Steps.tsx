import { Meta } from '@/components/ui';
import s from './auth.module.css';

export function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className={s.steps}>
      <div className={s.stepBar} role="img" aria-label={`${total} qadamdan ${current}-qadam`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < current ? s.stepOn : undefined} />
        ))}
      </div>
      <Meta>
        {current}-qadam, jami {total} ta
      </Meta>
    </div>
  );
}

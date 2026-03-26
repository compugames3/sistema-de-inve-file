import { JosimarLogo } from './JosimarLogo';

export function BackgroundLogo() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
        <JosimarLogo size="800px" />
      </div>
    </div>
  );
}

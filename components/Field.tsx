import { useId } from "react";

type Props = {
  label: string; error?: string; hint?: string;
  children: (p: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
};

export const inputCls =
  "w-full min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 aria-[invalid=true]:border-red-600";

export default function Field({ label, error, hint, children }: Props) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-800">{label}</label>
      {children({ id, describedBy: error || hint ? msgId : undefined, invalid: !!error })}
      {error ? (
        <p id={msgId} role="alert" className="mt-1 text-sm text-red-700">{error}</p>
      ) : hint ? (
        <p id={msgId} className="mt-1 text-sm text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

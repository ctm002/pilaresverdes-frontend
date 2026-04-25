import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const fieldClass =
  'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-forest-950 ' +
  'placeholder-stone-300 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-forest-700/40 focus:border-forest-700 ' +
  'transition-all duration-150 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const labelClass = 'block text-[11px] font-semibold text-forest-800 mb-1.5 tracking-widest uppercase';

type InputFieldProps    = { label: string; id?: string; as?: 'input'    } & Omit<InputHTMLAttributes<HTMLInputElement>,       'className'>;
type TextareaFieldProps = { label: string; id?: string; as:  'textarea' } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export type FormFieldProps = InputFieldProps | TextareaFieldProps;

export default function FormField(props: FormFieldProps) {
  if (props.as === 'textarea') {
    const { label, id, as: _as, ...rest } = props;
    return (
      <div>
        <label htmlFor={id} className={labelClass}>{label}</label>
        <textarea id={id} className={fieldClass} {...rest} />
      </div>
    );
  }
  const { label, id, as: _as, ...rest } = props;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input id={id} className={fieldClass} {...rest} />
    </div>
  );
}

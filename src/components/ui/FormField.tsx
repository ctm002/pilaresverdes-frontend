import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const fieldClass = "w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500";

type InputFieldProps = { label: string; id?: string; as?: 'input' } & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;
type TextareaFieldProps = { label: string; id?: string; as: 'textarea' } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export type FormFieldProps = InputFieldProps | TextareaFieldProps;

export default function FormField(props: FormFieldProps) {
  if (props.as === 'textarea') {
    const { label, id, as: _as, ...rest } = props;
    return (
      <div>
        <label htmlFor={id} className="block text-gray-600 mb-1">{label}</label>
        <textarea id={id} className={fieldClass} {...rest} />
      </div>
    );
  }
  const { label, id, as: _as, ...rest } = props;
  return (
    <div>
      <label htmlFor={id} className="block text-gray-600 mb-1">{label}</label>
      <input id={id} className={fieldClass} {...rest} />
    </div>
  );
}

import { FunctionComponent } from "preact";

interface Options {
  value: string;
  display: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  class?: string;
  type?: string;
  value?: string;
  required?: boolean;
  options?: Options[];
  children?: preact.ComponentChildren; //para soporte de información de ayuda adicional
}

const FormField: FunctionComponent<FormFieldProps> = (
  props: FormFieldProps,
) => {
  props.class = props.class || "col-12 col-md-6 col-lg-3 col-xl-2 mb-2";
  return (
    <div class={props.class}>
      <label class="form-label">{props.label}</label>
      {props.children}
      {props.type === "select"
        ? (
          <select
            name={props.name}
            class="form-select"
            required={props.required}
            value={props.value}
          >
            <option value="">Seleccionar</option>
            {props.options?.map((opt) => (
              <option value={opt.value} selected={opt.value === props.value}>
                {opt.display}
              </option>
            ))}
          </select>
        )
        : (
          <input
            type={props.type || "number"}
            name={props.name}
            value={props.value || ""}
            class="form-control"
            required={props.required}
          />
        )}
    </div>
  );
};

export default FormField;

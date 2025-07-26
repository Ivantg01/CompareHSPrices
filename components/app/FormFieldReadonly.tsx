import { FunctionComponent } from "preact";

interface Options {
  value: string;
  display: string;
}

interface FormFieldProps {
  label: string;
  name?: string;
  class?: string;
  type?: string;
  value?: string;
  options?: Options[];
}

const FormFieldReadonly: FunctionComponent<FormFieldProps> = (
  props: FormFieldProps,
) => {
  props.class = props.class || "col-12 col-md-6 col-lg-3 col-xl-2 mb-2";
  return (
    <div class={props.class}>
      <label class="form-label">{props.label}</label>
      <input
        type={props.type || "text"}
        name={props.name}
        value={props.type === "select"
          ? props.options?.find((opt) => opt.value === props.value)?.display ||
            ""
          : props.value || ""}
        class="form-control"
        disabled
        readOnly
      />
    </div>
  );
};

export default FormFieldReadonly;

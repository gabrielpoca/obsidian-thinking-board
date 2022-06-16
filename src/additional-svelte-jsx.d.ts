declare namespace svelte.JSX {
  interface HTMLProps<HTMLDivElement> {
    onclickOutside: (event: any) => any;
  }

  interface SvelteInputProps {
    onclick?: (event: any) => any;
    value?: string | number;
    type?: string;
    name?: string;
    checked?: boolean | string;
    onchange?: (event: any) => any;
  }
}

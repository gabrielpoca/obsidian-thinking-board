<script>
  export let value = "";
  export let name = "";
  export let minRows = 1;
  export let maxRows = null;

  $: minHeight = `${1 + minRows * 1.2}em`;
  $: maxHeight = maxRows ? `${1 + maxRows * 1.2}em` : `auto`;
</script>

<div class="container">
  <pre
    aria-hidden="true"
    style="min-height: {minHeight}; max-height: {maxHeight}">{value +
      "\n"}</pre>

  <textarea bind:value {name} />
</div>

<style>
  .container {
    position: relative;
  }

  pre,
  textarea {
    font-family: inherit;
    font-size: inherit;
    padding: 0.5em;
    border: 1px solid #eee;
    line-height: 1.2;
    overflow: hidden;
    background-color: white;
    border: 2px solid var(--color-black);
  }

  textarea {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    resize: none;
  }

  textarea:focus {
    border-color: red;
    border-radius: 0;
  }
</style>

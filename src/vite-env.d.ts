/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Web3Forms access key for the contact form. Get one (free, email-only) at
   * https://web3forms.com. Set it in Vercel → Project → Settings → Environment
   * Variables and in a local `.env` file. Without it the form shows an error
   * state instead of a false success.
   */
  readonly VITE_WEB3FORMS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

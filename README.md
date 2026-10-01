# nfunc.xyz

The n-suite's home page. SvelteKit, prerendered to static files (`adapter-static`)
and served by nginx — there is no backend. Nostr features run in the browser.

```sh
npm install
npm run dev      # http://localhost:5010
npm run build    # → build/
./deploy.sh      # build + rsync to the server
```

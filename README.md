# Development - Deno

Run CLI script

    deno task start


Publish to JSR

    deno publish

# Package

To run from npm add this to scripts with latest version

    "scaffold:feature": "deno run --allow-read --allow-write --allow-net https://jsr.io/@stackrats/scaffold-feature/x.x.x/main.ts"

Then you can call the script

    npm run scaffold:feature


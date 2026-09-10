# Slideshow maintenance

GitHub Pages builds this Jekyll site from the root of master. No deployment setting
change is needed. The two Markdown posts, Moon theme and hash navigation are retained.
The reveal settings in _config.yml were already unused by the original initializer;
this cleanup does not activate them or change the existing presentation geometry.

## Local setup and checks

Use Node.js 24 and Ruby 3.4 (the existing Gemfile.lock requires a modern Ruby).

```sh
npm ci --ignore-scripts
npm run check:assets
bundle install
sh script/cibuild
bundle exec jekyll serve --baseurl /myfirstslideshow
```

Open http://localhost:4000/myfirstslideshow/. Verify both slides with the arrow keys,
hash deep links, overview with Escape, speaker notes with S, and ?print-pdf.
The CI build checks both root and repository base URLs, local assets and HTML links.
It uploads a review artifact and never deploys or publishes a gem.

## Updating reveal.js

npm is used to lock and verify the upstream browser distribution, not to build Jekyll.
Only the nine required upstream files are committed under assets/reveal, including
the MIT license; node_modules is ignored and excluded from Pages. This preserves
branch-based Pages, which does not run npm. The League Gothic font is embedded in
the new Moon CSS. Lato still uses the existing Google Fonts service.

After reviewing upstream compatibility/security notes:

```sh
npm install --save-exact --ignore-scripts reveal.js@VERSION
npm run assets
npm run check:assets
npm audit --omit=dev
sh script/cibuild
```

Commit package.json, package-lock.json and refreshed assets together. Dependabot
updates npm, Bundler and Actions weekly. Its reveal.js PRs must also refresh the
vendored assets; CI deliberately rejects stale copies. Review any changed upstream
asset layout before changing the explicit copy list.

The vendored files bypass Git line-ending conversion so the byte comparison also
works on Windows. The existing HTMLProofer dependency is retained; its Yell logging
dependency was patched from 2.2.0 to 2.2.2 for Ruby 3.4 compatibility.

## Security cleanup

The original site served reveal.js 3.9.2 and all its demos/plugins from node_modules,
had no root package.json, and used gem-publishing/Rake workflows despite having no
gemspec or Rakefile. This change uses reveal.js 6.0.2, its current plugin registration
and asset paths, and integrated print styles. Automatic mobile scroll mode is disabled
to preserve the slide experience. No slide content or user PDF has been removed.

References: [upstream migration guide](https://revealjs.com/upgrading/),
[upstream releases and security fixes](https://github.com/hakimel/reveal.js/releases).

The initial committed-file signature scan found no obvious credentials. This was
not an exhaustive history scan. Legacy script/stage targets an old training server
and force-pushes a generated site; it is not part of this build and should not be run.
Repository protection and security-scanning settings need separate owner review.

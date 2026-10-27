# Slideshow maintenance

GitHub Pages builds this Jekyll site from the root of master. No deployment setting
change is needed. The two Markdown posts, Moon theme and hash navigation are retained.
The reveal settings in _config.yml were already unused by the original initializer;
this cleanup does not activate them or change the existing presentation geometry.

## Public website and social preview

The site is published from the root of `master` at
https://ovidiudeica.github.io/myfirstslideshow/. The LinkedIn/Open Graph
image is `assets/images/og-preview.jpg`, referenced by
`_includes/head.html` with a cache-busting query parameter. The previous
`og-preview.png` image is no longer used and was removed.

Social metadata is independent of the slide contents. Do not change the
Markdown slides merely to alter the link preview.

## Local setup and checks

Use Node.js 24 and Ruby 3.4 (the existing Gemfile.lock requires a modern Ruby).

```sh
sh script/setup
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
not an exhaustive history scan. The obsolete `script/stage` tool, which targeted an
old training server and used a force push, and the empty `.gitmodules` file have
been removed. Local setup no longer attempts to initialize submodules.
On 27 October 2026, the branch API confirmed that master is protected and requires
`Build and validate slideshow` for everyone. The authenticated GitHub CLI also confirmed strict status checks, administrator
enforcement, zero required approving reviews, and disabled force pushes and branch
deletions. Pages uses legacy branch publishing from master at /, with HTTPS enforced.
No protection or deployment setting was changed.

## Ruby dependency security review — 27 October 2026

The reviewed baseline is master commit `691103f66eb612b290b40a1f357abf820bca091f`.
Its validation and managed Pages deployment passed; the public slideshow returned
HTTP 200. The Pages logs show master as the source and the root as the build source.

### Root cause and remediation

[GHSA-47m2-wp7j-p9vc / CVE-2026-85396](https://github.com/advisories/GHSA-47m2-wp7j-p9vc)
affects rubyzip before 3.4.0. It concerns path traversal during ZIP entry extraction
into sibling paths sharing the destination prefix. The
[upstream 3.4.0 release](https://github.com/rubyzip/rubyzip/releases/tag/v3.4.0)
also warns of breaking changes in the 3.x series.

Bundler confirmed the original chain:
`github-pages 232 -> jekyll-remote-theme 0.4.3 -> rubyzip >= 1.3.0, < 3.0`,
resolved to rubyzip 2.4.1. The patched version cannot satisfy that constraint.
Forcing rubyzip 3.4.0 into this chain would be incompatible.

This slideshow has local templates and vendored Moon/reveal.js assets, no
`remote_theme` configuration, and no ZIP extraction code. Its only configured
plugin is jemoji. The umbrella github-pages bundle is unnecessary for local/CI
builds. Gemfile now declares the existing Jekyll 3.10.0, jemoji 0.13.0 and
kramdown-parser-gfm 1.1.0 directly. Bundler regenerated Gemfile.lock, removing the
unused umbrella dependencies including jekyll-remote-theme and rubyzip. Retained
gem versions were not upgraded. HTMLProofer is constrained to `~> 5.2.3`
(5.2.x, at least 5.2.3), matching the CLI flags validated by script/cibuild.

### Exposure and remaining boundary

The flaw requires processing a crafted ZIP archive; installing rubyzip alone does
not establish exploitation. The original configuration does not activate remote
theme downloads. The
[remote-theme downloader](https://github.com/benbalter/jekyll-remote-theme/blob/v0.4.3/lib/jekyll-remote-theme/downloader.rb)
does extract archives when remote themes are used, so future remote-theme changes
must not reintroduce this vulnerable dependency chain. Local workstations and CI
could otherwise expose writable build files to malicious archive contents. CI
already uses ephemeral hosted runners, a read-only contents token, no persisted
checkout credentials, and no deployment credentials in the validation workflow.
The published static site does not execute Ruby or extract ZIP archives.

Branch-based GitHub Pages uses GitHub's managed build image and its own gem bundle;
[its entrypoint](https://github.com/actions/jekyll-build-pages/blob/44a6e6beabd48582f863aeeb6cb2151cc1716697/entrypoint.sh)
checks the source Gemfile but builds from the image's bundle. Removing rubyzip
from this repository therefore fixes the local/CI dependency graph; it does not
patch or attest to the managed image's transitive dependencies. The baseline and candidate managed build image used github-pages 232; direct
inspection of ghcr.io/actions/jekyll-build-pages:v1.0.13 also confirmed
jekyll-remote-theme 0.4.3 and affected rubyzip 2.3.2 in that provider-owned image. No remote theme is configured, and the public URL and Pages
deployment settings remain unchanged. Track upstream Pages/remote-theme updates.
A custom deployment migration would require separate validation and is outside
this minimal maintenance change. No security alert has been dismissed, suppressed
or ignored; alert closure must be checked after merge.

### Validation evidence

The [isolated Linux validation run](https://github.com/ovidiudeica/myfirstslideshow/actions/runs/40599729875)
used Ruby 3.4, Node.js 24 and Bundler 4.0.20. Both the baseline and candidate passed:

- `npm ci --ignore-scripts`, `npm run check:assets`, `npm audit --omit=dev`
  (zero npm vulnerabilities reported).
- `bundle install`, `bundle check`, and `sh script/cibuild`.
- Jekyll builds at both `""` and `"/myfirstslideshow"`, asset checks for two slides
  and 19 local references, and HTMLProofer 5.2.3.
- Bundler inspection confirmed the vulnerable chain before remediation and the
  absence of github-pages, jekyll-remote-theme and rubyzip afterwards.
- Both original Markdown posts, the PDF, reveal.js assets and initializer,
  layouts, npm manifests and baseurl configuration remained unchanged.
- Generated slide pages and the public index matched byte-for-byte after
  normalizing only the viewport zoom restriction; generated file inventories and
  all shared static file bytes were identical.

The [committed-candidate validation](https://github.com/ovidiudeica/myfirstslideshow/actions/runs/40600168147)
also passed the frozen lockfile install, explicit bundle check, both base URLs,
HTMLProofer and the managed Pages builder. Its index matched both the local build
and the public baseline after viewport normalization.

These checks do not constitute a scan of every Ruby advisory, Git history, or
a complete scan of GitHub's managed build environment. Headless Chrome also passed arrow navigation, Escape overview, hash deep links
and a two-slide count with no JavaScript errors. Native mobile pinch-zoom behavior
should also be checked on a physical device when available.

### Additional maintenance

The viewport now retains `width=device-width, initial-scale=1.0` and permits browser
zoom by removing `maximum-scale=1.0, user-scalable=no`. No presentation dimensions,
navigation code, theme styles or social metadata were changed.

All Actions in the validation workflow now use verified immutable commit SHAs.
The three previous v7 references resolve to the same versions; ruby/setup-ruby was
already pinned. Dependabot's weekly Actions updates remain enabled. An explicit
`bundle check` follows dependency installation; existing triggers, required job
name, timeout and read-only permissions are retained.

Git's executable bit was cleared on README.md, LICENSE, _config.yml and index.html:
they are documentation, license, YAML and HTML files, not executable programs.
Their contents were not changed. Shell scripts keep their executable bits. README
already preserved the July 2020 Learning Lab attribution and needed no text edits.

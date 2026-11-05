import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = new URL("../", import.meta.url);
const dist = new URL("dist/", root);

async function getHtmlPages(directory = dist) {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) pages.push(...await getHtmlPages(url));
    else if (entry.name.endsWith(".html")) pages.push(url);
  }
  return pages;
}

test("RSS lists every published post newest first with absolute links", async () => {
  const contentDirectory = new URL("src/content/posts/", root);
  const files = (await readdir(contentDirectory)).filter((file) => file.endsWith(".mdx"));
  const posts = [];

  for (const file of files) {
    const source = await readFile(new URL(file, contentDirectory), "utf8");
    const frontmatter = source.split("---")[1] ?? "";
    if (/^draft:\s*true$/m.test(frontmatter)) continue;
    const date = frontmatter.match(/^date:\s*(.+)$/m)?.[1]?.trim();
    assert.ok(date, `Missing date in ${file}`);
    posts.push({ id: file.replace(/\.mdx$/, ""), date: new Date(date) });
  }

  posts.sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.id.localeCompare(b.id));
  const rss = await readFile(new URL("rss.xml", dist), "utf8");
  const links = [...rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<\/item>/g)]
    .map((match) => match[1]);

  assert.deepEqual(links, posts.map(({ id }) => `https://dethanev.app/blog/${id}/`));
});

test("article output includes article metadata and BlogPosting data", async () => {
  const blogDirectory = new URL("blog/", dist);
  const routes = (await readdir(blogDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory());

  for (const route of routes) {
    const html = await readFile(new URL(`${route.name}/index.html`, blogDirectory), "utf8");
    assert.match(html, /property="og:type" content="article"/, route.name);
    assert.match(html, /property="article:published_time"/, route.name);
    assert.match(html, /"@type":"BlogPosting"/, route.name);
  }
});

test("article fallback images stay below 350 KiB", async () => {
  const blogDirectory = new URL("blog/", dist);
  const routes = (await readdir(blogDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory());

  for (const route of routes) {
    const html = await readFile(new URL(`${route.name}/index.html`, blogDirectory), "utf8");
    for (const match of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      const image = path.join(dist.pathname, match[1]);
      assert.ok((await stat(image)).size <= 350 * 1024, `${match[1]} exceeds 350 KiB`);
    }
  }
});

test("public HTML contains no placeholder links or labels", async () => {
  const pages = ["index.html", "about/index.html", "blog/index.html", "now/index.html"];
  for (const page of pages) {
    const html = await readFile(new URL(page, dist), "utf8");
    assert.doesNotMatch(html, /href="#"|待補/, page);
  }
});

test("HTML pages expose consistent language, landmarks, and heading levels", async () => {
  for (const page of await getHtmlPages()) {
    const html = await readFile(page, "utf8");
    if (!/<html\b/.test(html)) continue;
    const headings = [...html.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));

    assert.match(html, /<html lang="zh-Hant-TW">/, page.pathname);
    assert.match(html, /<body>\s*<a class="skip-link" href="#main-content"/, page.pathname);
    assert.match(html, /<main id="main-content" tabindex="-1">/, page.pathname);
    assert.equal(headings.filter((level) => level === 1).length, 1, page.pathname);
    for (let index = 1; index < headings.length; index += 1) {
      assert.ok(headings[index] <= headings[index - 1] + 1, `${page.pathname} skips h${headings[index - 1]} to h${headings[index]}`);
    }
    assert.doesNotMatch(html, /<meta name="keywords"/, page.pathname);
  }
});

test("primary navigation identifies the current page", async () => {
  const cases = [
    ["index.html", "/"],
    ["about/index.html", "/about/"],
    ["blog/index.html", "/blog/"],
    ["blog/2026-05-15-hello-world/index.html", "/blog/"],
    ["now/index.html", "/now/"],
  ];

  for (const [page, href] of cases) {
    const html = await readFile(new URL(page, dist), "utf8");
    const escapedHref = href.replaceAll("/", "\\/");
    assert.match(html, new RegExp(`href="${escapedHref}"[^>]*aria-current="page"`), page);
    assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1, page);
  }
});

test("internal page links use the trailing-slash canonical form", async () => {
  // Canonical URLs, sitemap, and RSS all end with "/"; a slashless link costs
  // a 308 redirect on Cloudflare and points crawlers at a non-canonical URL.
  for (const page of await getHtmlPages()) {
    const html = await readFile(page, "utf8");
    for (const [, href] of html.matchAll(/<a\b[^>]*\shref="(\/[^"#?]*)/g)) {
      if (path.extname(href)) continue;
      assert.ok(href.endsWith("/"), `${page.pathname} links to ${href}`);
    }
  }
});

test("404 output tells crawlers not to index it", async () => {
  const html = await readFile(new URL("404.html", dist), "utf8");
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});

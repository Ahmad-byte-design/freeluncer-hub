# CSS Bug Hunt — a frontend teaching demo

Two copies of the same landing page, for **Brewly**, a made-up coffee subscription.

- [`broken/`](broken/) has **17 real-world CSS bugs**.
- [`fixed/`](fixed/) is the same page with every bug fixed.

**The HTML is byte-for-byte identical** in both folders, so every difference
students see comes from `style.css`. That's the point: the markup is fine, the
CSS is what breaks.

```
css-debugging-landing-pages/
├── index.html          ← START HERE: side-by-side viewer with a width slider
├── broken/
│   ├── index.html      identical to fixed/index.html
│   └── style.css       17 bugs, NOT labelled (students hunt for them)
├── fixed/
│   ├── index.html
│   └── style.css       every change tagged FIX 01 … FIX 17 with Was / Saw / Why
├── assets/hero.svg     720×560 on purpose (bugs 03 and 04 need a big image)
└── README.md
```

## Running it

```bash
cd css-debugging-landing-pages
python3 -m http.server 8000
# open http://localhost:8000
```

If you open `index.html` straight from disk, some browsers block `file://` iframes.
If the panes stay blank, use the server.

**Viewer tips:**
- **Phone 390** shows most layout bugs.
- **Laptop 1280** shows the rest.
- **Hide fixed version** turns the page into a bug-hunt exercise, so students
  can't copy the answers.
- For the focus-outline bug (05), you need a real tab. Open the page with
  "open in new tab ↗" and press <kbd>Tab</kbd>.

---

## The 17 bugs

The table runs in page order: global rules first, then the page from top to bottom.
"Where to look" tells students where to see the bug. The tag in `fixed/style.css`
matches the number here.

| # | Bug | Where to look | Broken CSS | Fix |
|---|---|---|---|---|
| 01 | **No `box-sizing: border-box`** | Email input sticks out of the white signup card | nothing (defaults to `content-box`) + `input { width:100%; padding:14px 16px }` | `*, *::before, *::after { box-sizing: border-box }` |
| 02 | **Fixed-width container** | Horizontal scrollbar on anything under ~1190px (every phone) | `.container { width: 1140px }` | `width: min(100% - 48px, 1140px)` |
| 03 | **Image not responsive** | Hero image clipped, coffee cup cut off | nothing on `img` | `img { max-width:100%; height:auto }` + grid with `minmax(0,1fr)` |
| 04 | **Inline image baseline gap** | Thin orange strip under the hero image | `img` left `display: inline` | `img { display: block }` |
| 05 | **`outline: none`** | Press Tab and you can't see what's focused | `a, button, input { outline: none }` | `:focus-visible { outline: 3px solid … }` |
| 06 | **Low contrast** | Grey body copy, white-on-peach buttons, near-invisible footer | e.g. `#c9bcaf` on white = **1.86:1** | e.g. `#6b5646` on white = **6.9:1** (AA needs 4.5:1) |
| 07 | **Fixed header covers content** | Click "Pricing" and the heading lands under the header | `position: fixed` | `position: sticky` + `scroll-margin-top` on sections |
| 08 | **Missing `z-index`** | Scroll: hero image and badge slide *over* the header | no `z-index` on `.header` | `z-index: 100` |
| 09 | **Flex items not vertically aligned** | Nav links sit at the top of the header, not centred | `.header-inner { display:flex }` (default `stretch`) | `align-items: center` |
| 10 | **Margin collapse** | Cream gap between the header and the dark hero | `.hero-inner { margin-top:140px }`, no padding on `.hero` | Space with `padding` on `.hero` |
| 11 | **`height: 100vh`** | Hero text spills out of the dark block on short or narrow screens | `.hero { height: 100vh }` | Remove it (or `min-height`) and let padding + content size it |
| 12 | **Fixed `px` heading** | 72px heading on a phone, one word per line | `font-size: 72px` | `font-size: clamp(36px, 6vw, 72px)` |
| 13 | **Flex row that can't shrink or wrap** | Third feature card runs off the right edge | `.card { flex: 0 0 360px }`, no `flex-wrap` | `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` |
| 14 | **`!important` breaks the cascade** | "Choose Taster/Office" are filled peach with orange text | `.btn { background: … !important }` | Remove `!important` |
| 15 | **Fixed height on a text box** | "Ground for your brewer" text runs out of its card | `.card { height: 180px }` | Remove it and let the content set the height |
| 16 | **`absolute` with no positioned parent** | "Most popular" badge is at the top of the *page*, over the header | `.badge { position:absolute }`, no `position` on `.plan` | `.plan { position: relative }` |
| 17 | **Long word blows out the grid** | Second review card is far wider than the first, and the @handle overflows | `grid-template-columns: 1fr 1fr`, no wrapping | `minmax()` columns + `overflow-wrap: anywhere` |

### Bugs that hide other bugs

Some bugs cover up others, which is worth pointing out in class:

- **02 hides 12, 13 and 17 on phones.** With the container stuck at 1140px, a phone
  just shows a zoomed-out desktop page with a scrollbar. Once students fix 02, the
  giant heading, the overflowing cards and the review blowout appear. Real
  debugging works like this: fix one thing and the next one shows up.
- **07 and 10 are one mistake, twice.** The student pushed the hero down "to clear
  the fixed header" (bug 07). The margin collapsed (bug 10). Neither is needed once
  the header is `sticky`.
- **In 13, bug 01 makes the overflow worse.** Under `content-box`, each 360px card
  is really 416px wide because the padding is added on top.
- **In 03, `overflow: hidden` changes how the bug looks.** On a flex item it
  sets `min-width: auto` to 0, so the image box *shrinks and crops* instead of
  pushing the text aside. Ask students why removing `overflow: hidden` changes
  the symptom.

---

## Suggested run-of-show (≈ 60 min)

| Time | Activity |
|---|---|
| 0–5 | Open the viewer with **Hide fixed version** on, at Laptop 1280. Ask: "What looks wrong?" Write every answer on the board. |
| 5–10 | Switch to Phone 390. Students add to the list. Most people spot 6–8 bugs before using any tools. |
| 10–30 | **Pairs, DevTools only.** Each pair takes `broken/` and picks 4 bugs from the board. For each one: find the rule in the Elements panel, change it live, and write down the fix. They shouldn't open `fixed/` yet. |
| 30–45 | Go through the table above together. For each bug, a pair demos their live fix, then you show the `FIX NN` comment in `fixed/style.css`. |
| 45–55 | Turn off Hide fixed version and walk through the "Bugs that hide other bugs" section. Check contrast with DevTools' colour picker, which shows the ratio. |
| 55–60 | Homework: fork `broken/`, fix everything *without* looking at `fixed/`, then diff. |

**DevTools features worth showing along the way:**
- The box-model diagram (bug 01)
- Flex and grid overlay badges (bugs 09, 13, 17)
- Contrast ratio in the colour picker (bug 06)
- *Rendering → Emulate focused page* and the `:focus-visible` state toggle (bug 05)
- Hovering the badge to see its containing block (bug 16)
- The "Computed" tab showing that `!important` wins (bug 14)

path = r"c:\Users\user\Desktop\aurapilates\components\dashboard\admin-overview\admin-overview-dashboard.tsx"
with open(path, encoding="utf-8") as f:
    c = f.read()

old = """                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200/80">
                          <div
                            className={`h-full rounded-full transition-all ${occupancyBarClass(slot.occupancyPct)}`}
                          />
                        </div>"""

new = """                        <motion.div className={overviewStyles.occupancyTrack}>
                          <div
                            className={`${occupancyBarScaleClass(slot.occupancyPct)} ${occupancyBarClass(slot.occupancyPct)}`}
                            aria-hidden="true"
                          />
                        </motion.div>"""

new = new.replace("motion.div", "div")

if old not in c:
    raise SystemExit("old block not found")

c = c.replace(old, new)
c = c.replace(
    "<motion.div\n                  className={`${overviewStyles.trendBarBookings}",
    "<div\n                  className={`${overviewStyles.trendBarBookings}",
)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
print("patched")

import { existsSync, mkdirSync, symlinkSync, rmSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dir, "..")
const vendorRoot = join(root, "vendor", "Atlas")
const vendorPkg = join(vendorRoot, "package.json")

async function linkAtlasPackages() {
  const packagesDir = join(vendorRoot, "packages")
  const targetDir = join(root, "node_modules", "@atlas")
  mkdirSync(targetDir, { recursive: true })
  const entries = await Array.fromAsync(new Bun.Glob("*").scan({ cwd: packagesDir, onlyFiles: false }))
  for (const name of entries) {
    const src = join(packagesDir, name)
    const dest = join(targetDir, name)
    try {
      rmSync(dest, { recursive: true, force: true })
    } catch {
      // ignore
    }
    symlinkSync(src, dest, "dir")
  }
  console.log(`Linked ${entries.length} @atlas/* packages into node_modules.`)
}

if (!existsSync(vendorPkg)) {
  const token = process.env.ATLAS_GITHUB_TOKEN
  if (!token) {
    console.error(
      "Missing vendor/Atlas and ATLAS_GITHUB_TOKEN.\n" +
        "Clone https://github.com/lemon-squared/Atlas into vendor/Atlas, or set ATLAS_GITHUB_TOKEN and re-run.",
    )
    process.exit(1)
  }
  console.log("Cloning lemon-squared/Atlas into vendor/Atlas…")
  mkdirSync(join(root, "vendor"), { recursive: true })
  const clone = Bun.spawn(
    [
      "git",
      "clone",
      "--depth",
      "1",
      `https://x-access-token:${token}@github.com/lemon-squared/Atlas.git`,
      vendorRoot,
    ],
    { stdout: "inherit", stderr: "inherit" },
  )
  if ((await clone.exited) !== 0) process.exit(1)
  const install = Bun.spawn(["bun", "install"], {
    cwd: vendorRoot,
    stdout: "inherit",
    stderr: "inherit",
  })
  if ((await install.exited) !== 0) process.exit(1)
} else {
  console.log("Atlas vendor present.")
}

await linkAtlasPackages()

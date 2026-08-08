import { existsSync, mkdirSync, symlinkSync, rmSync } from "node:fs"
import { join } from "node:path"

const root = join(import.meta.dir, "..")
const vendorRoot = join(root, "vendor", "Atlas")
const vendorPkg = join(vendorRoot, "package.json")
const fontPkg = join(vendorRoot, "packages", "font", "package.json")

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

async function bunInstallAtlas() {
  const install = Bun.spawn(["bun", "install"], {
    cwd: vendorRoot,
    stdout: "inherit",
    stderr: "inherit",
  })
  if ((await install.exited) !== 0) process.exit(1)
}

async function cloneAtlas(token: string) {
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
  await bunInstallAtlas()
}

async function updateAtlas(token: string) {
  console.log("Updating vendor/Atlas to latest main (need @atlas/font)…")
  const remote = Bun.spawn(
    [
      "git",
      "remote",
      "set-url",
      "origin",
      `https://x-access-token:${token}@github.com/lemon-squared/Atlas.git`,
    ],
    { cwd: vendorRoot, stdout: "inherit", stderr: "inherit" },
  )
  if ((await remote.exited) !== 0) process.exit(1)
  const pull = Bun.spawn(["git", "pull", "--ff-only", "origin", "main"], {
    cwd: vendorRoot,
    stdout: "inherit",
    stderr: "inherit",
  })
  if ((await pull.exited) !== 0) {
    // shallow clones can fail ff-only; fall back to fetch + reset
    const fetch = Bun.spawn(["git", "fetch", "origin", "main"], {
      cwd: vendorRoot,
      stdout: "inherit",
      stderr: "inherit",
    })
    if ((await fetch.exited) !== 0) process.exit(1)
    const reset = Bun.spawn(["git", "reset", "--hard", "origin/main"], {
      cwd: vendorRoot,
      stdout: "inherit",
      stderr: "inherit",
    })
    if ((await reset.exited) !== 0) process.exit(1)
  }
  await bunInstallAtlas()
}

const token = process.env.ATLAS_GITHUB_TOKEN

if (!existsSync(vendorPkg)) {
  if (!token) {
    console.error(
      "Missing vendor/Atlas and ATLAS_GITHUB_TOKEN.\n" +
        "Clone https://github.com/lemon-squared/Atlas into vendor/Atlas, or set ATLAS_GITHUB_TOKEN and re-run.",
    )
    process.exit(1)
  }
  await cloneAtlas(token)
} else if (!existsSync(fontPkg)) {
  if (!token) {
    console.error(
      "vendor/Atlas is present but packages/font is missing.\n" +
        "Set ATLAS_GITHUB_TOKEN and re-run bun run ensure-atlas to pull latest Atlas.",
    )
    process.exit(1)
  }
  await updateAtlas(token)
} else {
  console.log("Atlas vendor present (including @atlas/font).")
}

await linkAtlasPackages()

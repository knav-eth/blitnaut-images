import axios from "axios"
import { createWriteStream, exists, mkdir, writeFile } from "fs"
import path from "path"
import { promisify } from "util"
import { getAllBlitnauts } from "./blitnauts-subgraph"

const existsAsync = promisify(exists)
const mkdirAsync = promisify(mkdir)
const writeFileAsync = promisify(writeFile)

const IMAGES_DIR = path.join(__dirname, "../blitnaut_images")

async function ensureDirExists(): Promise<void> {
  if (!(await existsAsync(IMAGES_DIR))) {
    await mkdirAsync(IMAGES_DIR)
  }
}

function imagePathForBlitnaut(blitnautId: number): string {
  return path.join(IMAGES_DIR, `${blitnautId}.png`)
}

async function blitnautImageExists(blitnautId: number): Promise<boolean> {
  return existsAsync(imagePathForBlitnaut(blitnautId))
}

async function saveBlitnautImage(blitnautId: number, image: string | Buffer): Promise<void> {
  await writeFileAsync(imagePathForBlitnaut(blitnautId), image)
}

async function downloadImage(url: string, destination: string): Promise<void> {
  const writer = createWriteStream(destination)
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve)
    writer.on("error", reject)
  })
}

async function downloadBlitnautImage(blitnautId: number): Promise<void> {
  if (await blitnautImageExists(blitnautId)) {
    console.log(`Already have image for Blitnaut #${blitnautId}. Skipping...`)
    return
  }
  await downloadImage(
    `https://blitnauts.blitmap.com/api/v1/img/${blitnautId}`,
    imagePathForBlitnaut(blitnautId),
  )
  console.log(`Blitnaut #${blitnautId} saved.`)
}

async function main() {
  await ensureDirExists()
  const blitnauts = await getAllBlitnauts()
  await Promise.all(blitnauts.map((b) => downloadBlitnautImage(b.numericId)))

  await downloadBlitnautImage(3)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .then(() => {
    process.exit(0)
  })

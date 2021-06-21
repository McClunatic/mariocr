import { createScheduler, createWorker } from 'tesseract.js'

export async function recognize(image: File) {
  const worker = createWorker({ logger: m => console.log(m) })

  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  const result = await worker.recognize(image)
  console.log(result)
  await worker.terminate()
}
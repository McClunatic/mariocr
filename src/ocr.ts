import { createWorker, Worker } from 'tesseract.js'

interface PDFWorker extends Worker {
  getPDF(title?: string, textonly?: boolean, jobId?: string): Promise<any>
}

export default class OCRPool {
  maxWorkers: Number = navigator.hardwareConcurrency
  format: 'text' | 'pdf' = 'text'
  logger: (m?: String) => void = () => {}
  workers: PDFWorker[] = []
  idleWorkers: PDFWorker[] = []

  constructor(maxWorkers?: Number, format?: 'text' | 'pdf', logger?: (m?: String) => void) {
    if (maxWorkers !== undefined) this.maxWorkers = maxWorkers
    if (format !== undefined) this.format = format
    if (logger !== undefined) this.logger = logger
  }

  async getWorker(): Promise<PDFWorker> {
    let worker: PDFWorker | undefined = undefined

    // Case 1: there are idle workers
    if (this.idleWorkers.length > 0) worker = this.idleWorkers.shift()
    // Case 2: there are still fewer than max workers
    else if (this.workers.length < this.maxWorkers) {
      worker = <PDFWorker>createWorker({ logger: this.logger })
      this.workers.push(worker)
      await worker.load()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')
    // Case 3: no idle workers and max workers exist
    } else {
      while (worker === undefined) {
        await new Promise(r => setTimeout(r, 100));
        worker = this.idleWorkers.shift()
      }
    }
    return worker!
  }

  async recognize(image: any) {
    const worker = await this.getWorker()
    const index = this.idleWorkers.indexOf(worker)
    this.idleWorkers.splice(index, 1)

    let result = await worker.recognize(image)
    if (this.format === 'pdf') {
      result = await worker.getPDF('Tesseract OCR Result')
    }

    this.idleWorkers.push(worker)
    return result
  }

  async terminate() {
    await Promise.all(this.workers.map(worker => worker.terminate()))
  }
}

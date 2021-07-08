import { createWorker, Worker, RecognizeResult } from 'tesseract.js'

interface PDFResult {
  jobID: string
  data: number[]
}

interface PDFWorker extends Worker {
  getPDF(title?: string, textonly?: boolean, jobId?: string): Promise<PDFResult>
}

export interface OCRResult {
  recognize: RecognizeResult
  pdf?: PDFResult
}

interface Binding {
  file?: string | undefined
  page?: number | undefined
}
interface WorkerData {
  worker: PDFWorker
  binding: Binding
}

export class OCRPool {
  maxWorkers: Number = navigator.hardwareConcurrency
  format: 'text' | 'pdf' = 'text'
  logger: (m?: String) => void = () => {}
  workers: WorkerData[] = []
  idleWorkers: WorkerData[] = []

  constructor(format?: 'text' | 'pdf', logger?: (m?: String) => void, maxWorkers?: Number) {
    if (format !== undefined) this.format = format
    if (logger !== undefined) this.logger = logger
    if (maxWorkers !== undefined) this.maxWorkers = maxWorkers
  }

  async getWorker(file?: string, page?: number): Promise<WorkerData> {
    let worker: PDFWorker | undefined = undefined
    let binding: Binding = { file, page }

    // Case 1: there are idle workers
    if (this.idleWorkers.length > 0) {
      const workerData = this.idleWorkers.shift();
      ({ worker, binding } = workerData!)
      binding.file = file
      binding.page = page
    }
    // Case 2: there are still fewer than max workers
    else if (this.workers.length < this.maxWorkers) {
      const logger = this.logger.bind(binding)
      worker = <PDFWorker>createWorker({ logger })
      this.workers.push({ worker, binding })
      await worker.load()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')
    // Case 3: no idle workers and max workers exist
    } else {
      while (worker === undefined) {
        await new Promise(r => setTimeout(r, 100));
        const workerData = this.idleWorkers.shift();
        ({ worker, binding } = workerData!)
        binding.file = file
        binding.page = page
      }
    }
    return { worker, binding }
  }

  async recognize(image: any, file?: string, page?: number) {
    const workerData = await this.getWorker(file, page)
    const { worker } = workerData
    const index = this.idleWorkers.indexOf(workerData)
    this.idleWorkers.splice(index, 1)

    const result: OCRResult = { recognize: await worker.recognize(image) }
    if (this.format === 'pdf') {
      result['pdf'] = await worker.getPDF('Tesseract OCR Result')
    }

    this.idleWorkers.push(workerData)
    return result
  }

  async terminate() {
    await Promise.all(this.workers.map(({ worker }) => worker.terminate()))
  }
}

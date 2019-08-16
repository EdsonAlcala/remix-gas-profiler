import {
  Api,
  CompilationResult,
  createIframeClient,
  IRemixApi,
  PluginApi,
  PluginClient,
  RemixTx,
} from '@remixproject/plugin'
import { Profiler } from './profiler'
import { getCodeWithGasCosts, getCostsColumn, transactionHeader } from './renderer'

const devMode = { port: 8080 }

export class GasProfilerPlugin {
  private readonly client: PluginApi<Readonly<IRemixApi>> &
    PluginClient<Api, Readonly<IRemixApi>>

  private readonly profiler: Profiler

  constructor() {
    this.client = createIframeClient({ devMode })
    this.profiler = new Profiler()
  }

  public async init() {
    console.log('Pluging loaded but waiting for Remix')

    await this.client.onload()

    this.client.on('udapp', 'newTransaction', async (transaction: RemixTx) => {
      try {
        console.log('A new transaction was sent', transaction)

        const { hash } = transaction as any
        console.log('Transaction hash', hash)

        this.setStatusToLoading(hash)

        const traces = await this.client.call('debugger' as any, 'getTrace', hash)
        console.log('Traces ', traces)

        const compilationResult: CompilationResult = await this.client.solidity.getCompilationResult()
        console.log('Compilation Result', compilationResult)

        const contracts = (compilationResult as any).data.contracts
        const contractSourceKeys = Object.keys(contracts)
        const contractSourceKey = contractSourceKeys[0]

        const originalSourceCode = (compilationResult as any).source.sources[
          contractSourceKey
        ].content.trim()
        console.log('originalSourceCode', originalSourceCode)

        const contractKeys = Object.keys(contracts[contractSourceKey])
        console.log('contractKeys', contractKeys)

        contractKeys.forEach(async element => {
          const sourceMap = contracts[contractSourceKey][element].evm.bytecode.sourceMap
          console.log('sourceMap', sourceMap)

          const bytecode = contracts[contractSourceKey][element].evm.bytecode.object
          console.log('bytecode', bytecode)

          const gasPerLineCost = await this.profiler.getGasPerLineCost(
            sourceMap,
            bytecode,
            originalSourceCode,
            traces,
          )

          this.render(originalSourceCode, gasPerLineCost, transaction)
          this.setStatusToSuccess(hash)
        })
      } catch (error) {
        console.log('Error in newTransaction event handler', error.message)
      }
    })
  }

  private setStatusToLoading(transactionHash: string) {
    this.client.emit('statusChanged', {
      key: 'loading',
      type: 'info',
      title: `Profiling for tx ${transactionHash} in progress`,
    })
  }

  private setStatusToSuccess(transactionHash: string) {
    this.client.emit('statusChanged', {
      key: 'succeed',
      type: 'success',
      title: `New profiling for tx ${transactionHash} is ready`,
    })
  }

  private render(originalSourceCode, gasPerLineCost, transaction) {
    const costsColumn = getCostsColumn(gasPerLineCost)
    const codeWithGasCosts = getCodeWithGasCosts(costsColumn, originalSourceCode)

    const htmlContent = `
      <ul class="list-group">
        ${transactionHeader(transaction)}
        <li class="code-content list-group-item d-flex">
          ${codeWithGasCosts}
        </li>
      </ul>
    `

    const root = document.getElementById('gas-profiler-root')
    root.innerHTML = htmlContent
    ;(window as any).PR.prettyPrint()
  }
}

new GasProfilerPlugin().init().then(() => {
  console.log('Gas Profiler Plugin loaded!!')
})

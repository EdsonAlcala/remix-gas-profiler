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

    this.client.on('udapp', 'newTransaction', async (tx: RemixTx) => {
      try {
        console.log('A new transaction was sent', tx)

        const { hash } = tx as any
        console.log('Transaction hash', hash)

        this.setStatusToLoading(hash);

        const traces = await this.client.call('debugger' as any, 'getTrace', hash)
        console.log('Traces ', traces)

        const compilationResult: CompilationResult = await this.client.solidity.getCompilationResult()
        console.log('Compilation Result', compilationResult)

        const target = (compilationResult as any).source.target
        console.log('target', target)

        const originalSourceCode = (compilationResult as any).source.sources[target]
          .content
        console.log('originalSourceCode', originalSourceCode)

        const name = target
          .replace('browser/', '')
          .replace('.sol', '')
          .trim()
        console.log('name', name)

        // const gasEstimates = (compilationResult as any).data.contracts[target][name].evm.bytecode.gasEstimates
        // console.log('gasEstimates', gasEstimates)
        // Gas Estimates
        // {
        //     "Creation": {
        //         "codeDepositCost": "39800",
        //         "executionCost": "20107",
        //         "totalCost": "59907"
        //     },
        //     "External": {
        //         "getState()": "396",
        //         "state()": "410"
        //     }
        // }
        const sourceMap = (compilationResult as any).data.contracts[target][name].evm
          .bytecode.sourceMap
        console.log('sourceMap', sourceMap)

        const bytecode = (compilationResult as any).data.contracts[target][name].evm
          .bytecode.object
        console.log('bytecode', bytecode)

        const gasPerLineCost = await this.profiler.getGasPerLineCost(
          sourceMap,
          bytecode,
          originalSourceCode,
          traces,
        )

        this.render(originalSourceCode, gasPerLineCost)
        this.setStatusToSuccess(hash);

      } catch (error) {
        console.log('Error in newTransaction event handler', error.message)
      }
    })
  }

  private setStatusToLoading(transactionHash: string) {
    this.client.emit('statusChanged', { key: 'loading', type: 'info', title: `Profiling for tx ${transactionHash} in progress` })
  }

  private setStatusToSuccess(transactionHash: string) {
    this.client.emit('statusChanged', { key: 'succeed', type: 'success', title: `New profiling for tx ${transactionHash} is ready` })
  }

  // interface Status {
  //   key: number | 'edited' | 'succeed' | 'loading' | 'failed' | 'none'  // Display an icon or number
  //   type?: 'success' | 'info' | 'warning' | 'error'  // Bootstrap css color
  //   title?: string  // Describe the status on mouseover
  // }

  private render(originalSourceCode, gasPerLineCost) {
    let costsColumn = ''
    gasPerLineCost.forEach(item => {
      const currentCell =
        item.gasCost > 0
          ? `<span class='gas-amount'>${item.gasCost}</span>`
          : `<span class='empty'>0</span>`
      costsColumn += currentCell
    })

    const htmlContent = `
    <table><tbody>
        <tr>
          <td class="gas-costs">
            ${costsColumn}
          </td>
          <td><pre class="prettyprint lang-js">${originalSourceCode}</pre></td>
        </tr>
      </tbody></table>`

    const root = document.getElementById('gas-profiler-root')
    root.innerHTML = htmlContent
      ; (window as any).PR.prettyPrint()
  }
}

new GasProfilerPlugin().init().then(() => {
  console.log('Gas Profiler Plugin loaded!!')
})

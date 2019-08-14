import {
  Api,
  CompilationResult,
  createIframeClient,
  IRemixApi,
  PluginApi,
  PluginClient,
  RemixTx,
} from '@remixproject/plugin'
import { constants } from './constants'
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
        console.log('A new transaction was sent')
        console.log('Transaction', tx)

        const { hash } = tx as any
        console.log('Transaction hash', hash)

        const NULL_ADDRESS = '0x0'
        const toAddress = tx.to === NULL_ADDRESS ? constants.NEW_CONTRACT : tx.to
        const isContractCreation = tx.to === constants.NEW_CONTRACT

        const provider1 = await this.client.network.getNetworkProvider()

        console.log('Provider1', provider1)

        const provider = await this.client.call('network', 'getNetworkProvider')
        console.log('Provider', provider) // TODO: Wait until is fixed

        // const network = await this.client.network.detectNetwork()
        // console.log("network", network)

        const traces =
          provider === 'vm'
            ? await this.client.call('debugger' as any, 'getTrace', hash)
            : await this.getTracesViaWeb3(hash)
        console.log('Traces ', JSON.stringify(traces))

        // TODOOOOOO
        // for (let i = 0; i < normalizedStructLogs.length; i++) {
        //   const structLog = normalizedStructLogs[i];
        //   if (structLog.depth !== addressStack.length - 1) {
        //       throw new Error(
        //           "Malformed trace. Trace depth doesn't match call stack depth"
        //       );
        //   }

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
      } catch (error) {
        console.log('Error in newTransaction event handler', error.message)
      }
    })
  }

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
    ;(window as any).PR.prettyPrint()
  }

  private async getTracesViaWeb3(transactionHash: string) {
    // TODO: Until remix issues are fixed I can test
    // const providerURL = await this.client.network.getEndpoint();
    // console.log('providerURL', providerURL)
    // const endpoint = await this.client.network.getEndpoint()
    // console.log('endpoint', endpoint)
    // const provider = new Web3.providers.HttpProvider(providerURL);
    // const web3 = new Web3(provider);
    ;(window as any).web3.extend({
      methods: [
        {
          name: 'traceTx',
          call: 'debug_traceTransaction',
          params: 2,
        },
      ],
    })
    try {
      const traces = await (window as any).web3.traceTx(transactionHash, {
        disableStack: true,
        disableMemory: true,
        disableStorage: true,
      })
      console.log('Traces via web3', traces)
      return traces
    } catch (error) {
      console.log('Problem Getting Traces', error)
    }
  }
}

new GasProfilerPlugin().init().then(() => {
  console.log('Gas Profiler Plugin loaded!!')
})

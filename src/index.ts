import Web3 from "web3"

import {
  Api,
  CompilationResult,
  createIframeClient,
  IRemixApi,
  PluginApi,
  PluginClient,
  RemixTx,
} from '@remixproject/plugin'


import { profiler } from "./profiler"

const devMode = { port: 8080 }

export class GasProfilerPlugin {
  private readonly client: PluginApi<Readonly<IRemixApi>> &
    PluginClient<Api, Readonly<IRemixApi>>

  constructor() {
    this.client = createIframeClient({ devMode })
  }

  public async init() {
    await this.client.onload()

    this.client.on('udapp', 'newTransaction', async (tx: RemixTx) => {

      try {
        console.log('A new transaction was sent')
        console.log('Transaction', tx)

        const { hash } = tx as any
        console.log('Transaction hash', hash)

        const provider1 = await this.client.network.getNetworkProvider()
        console.log("Provider1", provider1)

        const provider = await this.client.call('network', 'getNetworkProvider')
        console.log("Provider", provider)

        const traces = await this.getTracesViaWeb3(hash);//provider === 'vm' ? await this.client.call('debugger' as any, 'getTrace', hash) : await this.getTracesViaWeb3(hash);
        console.log('Traces ', traces)

        const compilationResult: CompilationResult = await this.client.solidity.getCompilationResult()
        console.log('Compilation Result', compilationResult)

        const target = (compilationResult as any).source.target
        console.log('target', target)

        const originalSourceCode = (compilationResult as any).source.sources[target].content
        console.log('originalSourceCode', originalSourceCode)

        const name = target.replace('browser/', '').replace('.sol', '').trim()
        console.log('name', name)

        const sourceMap = (compilationResult as any).data.contracts[target][name].evm.bytecode.sourceMap
        console.log('sourceMap', sourceMap)

        const bytecode = (compilationResult as any).data.contracts[target][name].evm.bytecode.object
        console.log('bytecode', bytecode)

        // const result = await profiler(sourceMap, bytecode, originalSourceCode, traces);

        // console.log(`The result is ${JSON.stringify(result)}`)
      } catch (error) {
        console.log("Error in newTransaction event handler", error.message)
      }
    })
  }

  public async getTracesViaWeb3(transactionHash: string) {
    const providerURL = await this.client.network.getEndpoint()
    console.log('providerURL', providerURL)
    const provider = new Web3.providers.HttpProvider(providerURL);
    const web3 = new Web3(provider);
    web3.extend({
      methods: [
        {
          name: 'traceTx',
          call: 'debug_traceTransaction',
          params: 2
        }
      ]
    });
    const traces = await web3.traceTx(transactionHash, { disableStack: true, disableMemory: true, disableStorage: true });
    console.log('Traces via web3', traces)
    return traces;
  }
}

new GasProfilerPlugin().init().then(() => {
  console.log('Gas Profiler Plugin loaded!!')
})





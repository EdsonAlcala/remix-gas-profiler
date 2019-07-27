import {
  Api,
  CompilationFileSources,
  CompilationResult,
  createIframeClient,
  IRemixApi,
  PluginApi,
  PluginClient,
  RemixTx,
} from '@remixproject/plugin'

const devMode = { port: 8080 }

export class Profiler {
  private readonly client: PluginApi<Readonly<IRemixApi>> &
    PluginClient<Api, Readonly<IRemixApi>>

  constructor() {
    this.client = createIframeClient({ devMode })
  }

  public async init() {
    await this.client.onload()

    this.client.solidity.on(
      'compilationFinished',
      (
        file: string,
        src: CompilationFileSources,
        version: string,
        result: CompilationResult,
      ) => {
        console.log('Compilation Finished')
      },
    )

    this.client.on('udapp', 'newTransaction', async (tx: RemixTx) => {
      // TODO: RemixTx type wrong
      // TODO report that it is debugger instead of debug
      console.log('A new transaction was sent')
      // then I need to make a call to get trace
      // test if I can get the compilation results
      const result = await this.client.solidity.getCompilationResult()
      console.log('Compilation Result!!', result)
      console.log('Tx', tx)
      const { hash } = tx as any
      console.log('hash ', hash)
      const resultado = await this.client.call('debugger' as any, 'getTrace', hash)
      console.log('Resultado ', resultado)
    })
  }
}

new Profiler().init().then(() => {
  console.log('Gas Profiler Plugin loaded!!')
})

// TODO:

// BEING ABLE TO call debug getTrace
// Then all should work with the ethereum evm js

// Ask question about the supoort of debug in Remix-plugin

// issue with

// Uncaught (in promise) TypeError: this.pendingRequest[u] is not a function
//     at t.<anonymous> (/build/app.js:3)
//     at /build/app.js:3
//     at Object.next (/build/app.js:3)
//     at /build/app.js:3
//     at new Promise (<anonymous>)
//     at s (/build/app.js:3)
//     at t.getMessage (/build/app.js:3)
//     at n.listener (/build/app.js:3)

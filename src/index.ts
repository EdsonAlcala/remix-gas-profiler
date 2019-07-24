import { createIframeClient, RemixTx, remixApi, NetworkProvider } from 'remix-plugin'

// require('@remixproject/plugin')

const devMode = { port: 8080 }
const client = createIframeClient({ customApi: remixApi, devMode })

client.onload().then(_ => {
    console.log("Gas Profiler Plugin loaded!!")
})

client.solidity.on('compilationFinished', (file, source, languageVersion, data) => {
    console.log("Compilation Finished")
    console.log(file, source, languageVersion, data)
})

client.on('udapp', 'newTransaction', (tx: RemixTx) => {
    console.log("A new transaction was sent")
    // then I need to make a call to get trace
    // test if I can get the compilation results
    // const result = await client.solidity.getCompilationResult()
    console.log("Compilation Result!!")
    // console.log(result)
})

client.on('fileManager', 'currentFileChanged', (provider: NetworkProvider) => {
    // Do something
    console.log("Current File Changed!!")
})

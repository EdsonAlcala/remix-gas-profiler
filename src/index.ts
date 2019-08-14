import Web3 from "web3"
// import { Collector } from "istanbul";
import { StructLog } from 'ethereum-types';

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
import { constants } from "./constants";

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

        const NULL_ADDRESS = '0x0';
        const toAddress = tx.to === NULL_ADDRESS ? constants.NEW_CONTRACT : tx.to
        const isContractCreation = tx.to === constants.NEW_CONTRACT;

        const provider1 = await this.client.network.getNetworkProvider()

        console.log("Provider1", provider1)

        const provider = await this.client.call('network', 'getNetworkProvider')
        console.log("Provider", provider) // TODO: Wait until is fixed

        // const network = await this.client.network.detectNetwork()
        // console.log("network", network)

        const traces = provider === 'vm' ? await this.client.call('debugger' as any, 'getTrace', hash) : await this.getTracesViaWeb3(hash);
        console.log('Traces ', JSON.stringify(traces))

        // have traces the StructLog type?
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

        const gasPerLineCost = await profiler(sourceMap, bytecode, originalSourceCode, traces);

        let costsColumn = ''
        gasPerLineCost.forEach((item) => {
          const currentCell = item.gasCost > 0 ? `<span class='gas-amount'>${item.gasCost}</span>` : `<span class='empty'>0</span>`
          costsColumn += currentCell
        })
        // console.log(`The result is ${JSON.stringify(result)}`)
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
        root.innerHTML = htmlContent;
        (window as any).PR.prettyPrint();

      } catch (error) {
        console.log("Error in newTransaction event handler", error.message)
      }
    })
  }

  public async getTracesViaWeb3(transactionHash: string) {
    //const providerURL = await this.client.network.getEndpoint()
    // console.log('providerURL', providerURL)
    // const endpoint = await this.client.network.getEndpoint()
    // console.log('endpoint', endpoint)
    // const provider = new Web3.providers.HttpProvider(providerURL);
    // const web3 = new Web3(provider);
    (window as any).web3.extend({
      methods: [
        {
          name: 'traceTx',
          call: 'debug_traceTransaction',
          params: 2
        }
      ]
    });
    try {
      const traces = await (window as any).web3.traceTx(0x323f3f535965128c7c95a2c853cb8340ba74113210f172d5d17583ddaaa58f4b, { disableStack: true, disableMemory: true, disableStorage: true });
      console.log('Traces via web3', traces)
      return traces;
    } catch (error) {
      console.log("PROBLEM GETTING TRACES", error)
    }

  }
}

new GasProfilerPlugin().init().then(() => {
  console.log('Gas Profiler Plugin loaded!!')
})

/**
 * Only on creation
 * get byte code
 * remove 0x -> const bytecodeHex = stripHexPrefix(bytecode);
 * get sourceMap
 * const pcToSourceRange = parseSourceMap(
 *  contractData.sourceCodes,
 *  sourceMap,
 *  bytecodeHex,
 *  contractData.sources)
 * 
 * 
 *  */

// for (let fileIndex = 0; fileIndex < contractData.sources.length; fileIndex++) {
//   const singleFileCoverageForTrace = this.profilerHandler(
//     contractData,
//     traceInfo.subtrace,
//     pcToSourceRange,
//     fileIndex
//   );
//   this._collector.add(singleFileCoverageForTrace);
// }
export interface ContractData {
  bytecode: string;
  sourceMap: string;
  runtimeBytecode: string;
  sourceMapRuntime: string;
  sourceCodes: string[];
  sources: string[];
}

export interface Coverage {
  [fineName: string]: {
    l?: LineCoverage;
    f: FunctionCoverage;
    s: StatementCoverage;
    b: BranchCoverage;
    fnMap: FnMap;
    branchMap: BranchMap;
    statementMap: StatementMap;
    path: string;
  };
}

export interface LineColumn {
  line: number;
  column: number;
}

export interface SourceRange {
  location: SingleFileSourceRange;
  fileName: string;
}

export interface SingleFileSourceRange {
  start: LineColumn;
  end: LineColumn;
}

export interface LocationByOffset {
  [offset: number]: LineColumn;
}

export interface FunctionDescription {
  name: string;
  line: number;
  loc: SingleFileSourceRange;
  skip?: boolean;
}

export type StatementDescription = SingleFileSourceRange;

export interface BranchDescription {
  line: number;
  type: 'if' | 'switch' | 'cond-expr' | 'binary-expr';
  locations: SingleFileSourceRange[];
}

export interface FnMap {
  [functionId: string]: FunctionDescription;
}

export interface BranchMap {
  [branchId: string]: BranchDescription;
}

export interface StatementMap {
  [statementId: string]: StatementDescription;
}

export interface LineCoverage {
  [lineNo: number]: number;
}

export interface FunctionCoverage {
  [functionId: string]: number;
}

export interface StatementCoverage {
  [statementId: string]: number;
}

export interface BranchCoverage {
  [branchId: string]: number[];
}

export type Subtrace = StructLog[];

export type SingleFileSubtraceHandler = (
  contractData: ContractData,
  subtrace: Subtrace,
  pcToSourceRange: { [programCounter: number]: SourceRange },
  fileIndex: number
) => Coverage;

// export const profilerHandler: SingleFileSubtraceHandler = (
//   contractData: ContractData,
//   subtrace: Subtrace,
//   pcToSourceRange: { [programCounter: number]: SourceRange },
//   fileIndex: number
// ): Coverage => {
//   const absoluteFileName = contractData.sources[fileIndex];
//   const profilerEntriesDescription = collectCoverageEntries(
//     contractData.sourceCodes[fileIndex]
//   );
//   const gasConsumedByStatement: { [statementId: string]: number } = {};
//   const statementIds = _.keys(profilerEntriesDescription.statementMap);
//   for (const statementId of statementIds) {
//     const statementDescription =
//       profilerEntriesDescription.statementMap[statementId];
//     const totalGasCost = _.sum(
//       _.map(subtrace, structLog => {
//         const sourceRange = pcToSourceRange[structLog.pc];
//         if (_.isUndefined(sourceRange)) {
//           return 0;
//         }
//         if (sourceRange.fileName !== absoluteFileName) {
//           return 0;
//         }
//         if (utils.isRangeInside(sourceRange.location, statementDescription)) {
//           return structLog.gasCost;
//         } else {
//           return 0;
//         }
//       })
//     );
//     gasConsumedByStatement[statementId] = totalGasCost;
//   }
//   const partialProfilerOutput = {
//     [absoluteFileName]: {
//       ...profilerEntriesDescription,
//       path: absoluteFileName,
//       f: {}, // I's meaningless in profiling context
//       s: gasConsumedByStatement,
//       b: {} // I's meaningless in profiling context
//     }
//   };
//   return partialProfilerOutput;
// };





import {
  buildLineOffsets,
  buildPcToInstructionMapping,
  normalizeStructLogs,
  parseSourceMap,
} from './utils'

const binarysearch = require('binarysearch') // tslint:disable-line

interface ISourceMap {
  [key: number]: any
}

export class Profiler {
  public async getGasPerLineCost(
    sourceMap: string,
    bytecode: string,
    sourceCode: string,
    trace: any,
  ) {
    try {
      const sourceMapParsed = parseSourceMap(sourceMap)

      const pcToIdx = buildPcToInstructionMapping(bytecode)

      const lineOffsets = buildLineOffsets(sourceCode) // To Know the lenght per line

      const lineGas: any[] = []

      let synthCost = 0

      const structLogs = trace.result ? trace.result.structLogs : trace.structLogs
      const normalisedStructLogs = normalizeStructLogs(structLogs)
      const bottomDepth = normalisedStructLogs[0].depth // should be 1

      console.log('bottomDepth', bottomDepth)

      for (let i = 0; i < normalisedStructLogs.length;) {
        const { gas, gasCost, op, pc } = normalisedStructLogs[i]

        let cost
        if (['CALL', 'CALLCODE', 'DELEGATECALL', 'STATICCALL'].includes(op)) {
          // for call instruction, gasCost is 63/64*gas, not real gas cost
          const gasBeforeCall = gas
          do {
            i += 1
          } while (normalisedStructLogs[i].depth > bottomDepth)
          cost = gasBeforeCall - normalisedStructLogs[i].gas
        } else {
          i += 1
          cost = gasCost
        }

        const instructionIdx = pcToIdx[pc]

        const { s, l, f, j } = sourceMapParsed[instructionIdx]
        if (f === -1) {
          synthCost += parseInt(cost, 10)
          continue
        }
        const line = binarysearch.closest(lineOffsets, s)

        if (lineGas[line] === undefined) {
          lineGas[line] = parseInt(cost, 10)
        } else {
          lineGas[line] += parseInt(cost, 10)
        }
      }

      const gasPerLineCost = []

      sourceCode.split('\n').forEach((line, i) => {
        const gas = lineGas[i] || 0
        gasPerLineCost.push({
          lineNumber: i + 1,
          gasCost: gas,
        })
      })

      return gasPerLineCost
    } catch (error) {
      console.log('ERROR', error)
    }
  }
}

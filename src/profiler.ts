
import { buildLineOffsets, buildPcToInstructionMapping, parseSourceMap } from './utils'

const binarysearch = require('binarysearch') // tslint:disable-line

interface ISourceMap {
  [key: number]: any
}

export const profiler = async (sourceMap: string, bytecode: string, originalSourceCode: string, trace: any) => {
  try {
    console.log('sourceMap', sourceMap)
    console.log('bytecode', bytecode)
    console.log('originalSourceCode', originalSourceCode)

    const sourceMapParsed = parseSourceMap(sourceMap)
    console.log('sourceMapParsed', sourceMapParsed)

    const pcToIdx = buildPcToInstructionMapping(bytecode)
    console.log('pcToIdx', pcToIdx)

    const lineOffsets = buildLineOffsets(originalSourceCode) // To Know the lenght per line
    console.log('lineOffsets', lineOffsets)

    const lineGas: any[] = []

    let synthCost = 0

    console.log('trace', trace)

    const bottomDepth = trace.structLogs[0].depth // should be 1

    console.log('bottomDepth', bottomDepth)
    console.log('trace.structLogs.length', trace.structLogs.length)

    for (let i = 0; i < trace.structLogs.length;) {
      const { depth, error, gas, gasCost, op, pc, stack } = trace.structLogs[i]
      console.log('gas', gas)
      console.log('gasCost', gasCost)
      console.log('op', op)
      console.log('pc', pc)

      let cost
      if (['CALL', 'CALLCODE', 'DELEGATECALL', 'STATICCALL'].includes(op)) {
        // for call instruction, gasCost is 63/64*gas, not real gas cost
        const gasBeforeCall = gas
        do {
          i += 1
        } while (trace.structLogs[i].depth > bottomDepth)
        cost = gasBeforeCall - trace.structLogs[i].gas
      } else {
        i += 1
        cost = gasCost
      }

      console.log('COST', cost)

      const instructionIdx = pcToIdx[pc]
      console.log('instructionIdx', instructionIdx)

      const { s, l, f, j } = sourceMapParsed[instructionIdx]
      if (f === -1) {
        synthCost += cost
        continue
      }
      const line = binarysearch.closest(lineOffsets, s)
      if (lineGas[line] === undefined) {
        lineGas[line] = cost
      } else {
        lineGas[line] += cost
      }
      console.log('line', line)
    }

    originalSourceCode.split('\n').forEach((line, i) => {
      const gas = lineGas[i] || 0
      console.log('%s\t\t%s', gas, line)
    })

    console.log('synthetic instruction gas', synthCost)
  } catch (error) {
    console.log('ERROR', error)
  }
}

import { buildLineOffsets, buildPcToInstructionMapping, parseSourceMap, normalizeStructLogs } from './utils'

const binarysearch = require('binarysearch') // tslint:disable-line

interface ISourceMap {
  [key: number]: any
}

export const profiler = async (sourceMap: string, bytecode: string, originalSourceCode: string, trace: any) => {
  try {
    console.log("FROM HERE !!!")
    console.log('sourceMap', sourceMap)
    console.log('bytecode', bytecode)
    console.log('originalSourceCode', originalSourceCode)

    const sourceMapParsed = parseSourceMap(sourceMap)
    console.log('sourceMapParsed', sourceMapParsed)

    const pcToIdx = buildPcToInstructionMapping(bytecode)
    console.log('pcToIdx !!!', pcToIdx) // TODO UNDERSTAND !!!

    const lineOffsets = buildLineOffsets(originalSourceCode) // To Know the lenght per line
    console.log('lineOffsets', lineOffsets)

    const lineGas: any[] = []

    let synthCost = 0

    // console.log('trace', trace)
    const structLogs = trace.result ? trace.result.structLogs : trace.structLogs;
    const normalisedStructLogs = normalizeStructLogs(structLogs)
    const bottomDepth = normalisedStructLogs[0].depth // should be 1

    console.log('bottomDepth', bottomDepth)
    // console.log('normalisedStructLogs.length', normalisedStructLogs.length)
    // console.log('normalisedStructLogs', normalisedStructLogs)
    // console.log('normalisedStructLogs length', normalisedStructLogs.length)

    console.log('ABOUT TO START THE REAL !!')

    for (let i = 0; i < normalisedStructLogs.length;) {
      const { depth, error, gas, gasCost, op, pc, stack } = normalisedStructLogs[i]
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
        } while (normalisedStructLogs[i].depth > bottomDepth)
        cost = gasBeforeCall - normalisedStructLogs[i].gas
      } else {
        i += 1
        cost = gasCost
      }

      console.log('COST', cost)

      const instructionIdx = pcToIdx[pc]
      console.log('instructionIdx', instructionIdx)

      const { s, l, f, j } = sourceMapParsed[instructionIdx]
      if (f === -1) {
        synthCost += parseInt(cost)
        continue
      }
      const line = binarysearch.closest(lineOffsets, s)

      console.log('lineGas === undefined', lineGas[line] === undefined)
      if (lineGas[line] === undefined) {
        lineGas[line] = parseInt(cost)
      } else {
        lineGas[line] += parseInt(cost)
      }

      console.log('lineGas[line]', lineGas[line])
      console.log('line', line)
      console.log('cost', cost)
      console.log('lineGas', lineGas)
    }

    const gasPerLineCost = []
    originalSourceCode.split('\n').forEach((line, i) => {
      const gas = lineGas[i] || 0
      console.log('%s\t\t%s', gas, line, i)
      gasPerLineCost.push({
        lineNumber: i + 1,
        gasCost: gas
      })
    })

    console.log('synthetic instruction gas', synthCost)

    return gasPerLineCost;

  } catch (error) {
    console.log('ERROR', error)
  }
}
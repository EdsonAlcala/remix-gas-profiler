// const getLineFromPos = require('get-line-from-pos');

// export const showAllPointsInSourceMap = (sourceMap, src, lineOffsets) => {
//     const linePoints = []; //line no -> number of points in source map
//     sourceMap.forEach(instruction => {
//         if (instruction.f === -1) {
//             return;
//         }
//         const s = instruction.s;
//         const line = binarysearch.closest(lineOffsets, s);
//         if (line === 0) {
//             console.log('>>>', instruction);
//         }
//         if (linePoints[line] === undefined) {
//             linePoints[line] = 1;
//         } else {
//             linePoints[line] += 1;
//         }
//     });

//     src.split('\n').forEach((line, i) => {
//         const points = linePoints[i] || 0;
//         console.log('%s\t%s\t%s\t\t%s', i, lineOffsets[i], points, line);
//     });

// }

export const buildLineOffsets = (src: string) => {
  let accu = 0
  return src.split('\n').map(line => {
    const ret = accu
    accu += line.length + 1
    return ret
  })
}

interface IMapping {
  [key: string]: number
}

export const parsedLast = (srcmap: string) => {
  return srcmap
    .split(';')
    .map(l => l.split(':'))
    .map(([s, l, f, j]) => ({ s: s === '' ? undefined : s, l, f, j }))
    .reduce(
      ([last, ...list], { s, l, f, j }) => [
        {
          s: parseInt(s || last.s, 10),
          l: parseInt(l || last.l, 10),
          f: parseInt(f || last.f, 10),
          j: j || last.j,
        },
        last,
        ...list,
      ],
      [{} as any],
    )
    .reverse()
    .slice(1)
  // .map(
  //     ({ s, l, f, j }: any) => `${srcmaps.sourceList[f]}:${getLineFromPos(source, s)}`
  // );
}

const isPush = (instruction: any) => instruction >= 0x60 && instruction < 0x7f // TODO: Improve types

const pushDataLength = (instruction: any) => instruction - 0x5f

const instructionLength = (instruction: any) =>
  isPush(instruction) ? 1 + pushDataLength(instruction) : 1

const byteToInstIndex = (binary: string) => {
  const result = []
  let byteIndex = 0
  let instIndex = 0
  while (byteIndex < binary.length) {
    const length = instructionLength(binary[byteIndex])
    for (let i = 0; i < length; i += 1) {
      result.push(instIndex)
    }
    byteIndex += length
    instIndex += 1
  }
  return result
}

export const parseRuntimeBinary = (binary: string) => {
  return byteToInstIndex(binary)
}

export const buildPcToInstructionMapping = (codeHexStr: string) => {
  const mapping: IMapping = {}
  // const codeHexStr =  code0xHexStr.slice(2)
  let instructionIndex = 0
  console.log('codeHexStr.length', codeHexStr.length)
  console.log('codeHexStr', codeHexStr)

  for (let pc = 0; pc < codeHexStr.length / 2;) {
    console.log('PC Counter', pc)
    mapping[pc] = instructionIndex

    const byteHex = codeHexStr[pc * 2] + codeHexStr[pc * 2 + 1]
    const byte = parseInt(byteHex, 16)

    // PUSH instruction has immediates
    if (byte >= 0x60 && byte <= 0x7f) {
      const n = byte - 0x60 + 1 // number of immediates
      pc += n + 1
    } else {
      pc += 1
    }
    instructionIndex += 1
  }
  return mapping
}

export const parseAnotherSourceMap = (sourceMap: string) => {
  const items = sourceMap.trim().split(';')
}

const scan = (array: [], reducer: any, initialValue: []) => {
  let accumulator = initialValue
  const result = []

  for (const currentValue of array) {
    const curr = reducer(accumulator, currentValue)
    accumulator = curr
    result.push(curr)
  }
  return result
}

// https://solidity.readthedocs.io/en/develop/miscellaneous.html#source-mappings
export const parseSourceMap = (sourceMap: string) => {
  let prevS: string
  let prevL: string
  let prevF: string
  let prevJ: string

  console.log('SourceMapToParse', sourceMap)

  return sourceMap
    .trim()
    .split(';')
    .map(section => {
      let [s, l, f, j] = section.split(':')

      if (s === '' || s === undefined) {
        s = prevS
      } else {
        prevS = s
      }

      if (l === '' || l === undefined) {
        l = prevL
      } else {
        prevL = l
      }

      if (f === '' || f === undefined) {
        f = prevF
      } else {
        prevF = f
      }

      if (j === '' || j === undefined) {
        j = prevJ
      } else {
        prevJ = j
      }

      return { s: Number(s), l: Number(l), f: Number(f), j }
    })
}

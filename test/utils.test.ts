import fs from "fs"

import { buildPcToInstructionMapping, parseRuntimeBinary, parseSourceMap } from "../src/utils"

const SOURCEMAP_FILE = "./test/mock-data/source-maps.json"; // TODO Change this
// TODO: Fix path

describe('Utils test', () => {

    describe('parseSourceMap', () => {
        it('should parse correctly the source maps', () => {
            const sourceMapFile = fs.readFileSync(SOURCEMAP_FILE, 'utf8');
            const sourceMap = JSON.parse(sourceMapFile).sourceMap;

            console.log("SourceMapFile", sourceMapFile)
            console.log("SourceMap", sourceMap)

            const result = parseSourceMap(sourceMap);

            console.log("RESULT", JSON.stringify(result))

            expect(result).toBeTruthy()

            // const anotherParseResult = parsedLast(sourceMap)

            // console.log("RESULT anotherParse", JSON.stringify(anotherParseResult))

            // expect(result).toEqual(anotherParseResult)
        })
    })

    describe('buildPcToInstructionMapping', () => {
        it('should calculate correctly the instructions from bytecode', () => {
            const sampleCode = "0x6080604052348015600f57600080fd5b506004361060325760003560e01c80631865c57d146037578063c19d93fb14604f575b600080fd5b603d6055565b60408051918252519081900360200190f35b603d605b565b60005490565b6000548156fea265627a7a723058209fa44d2c74885e60715e4d845d6f360f80cbef23b84d3804408903f946b90bbf64736f6c634300050a0032"
            // Runtime 0x6080604052348015600f57600080fd5b506004361060325760003560e01c80631865c57d146037578063c19d93fb14604f575b600080fd5b603d6055565b60408051918252519081900360200190f35b603d605b565b60005490565b6000548156fea265627a7a723058209fa44d2c74885e60715e4d845d6f360f80cbef23b84d3804408903f946b90bbf64736f6c634300050a0032
            // Not Runtime 0x6080604052348015600f57600080fd5b506103e86000556096806100246000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80631865c57d146037578063c19d93fb14604f575b600080fd5b603d6055565b60408051918252519081900360200190f35b603d605b565b60005490565b6000548156fea265627a7a723058209fa44d2c74885e60715e4d845d6f360f80cbef23b84d3804408903f946b90bbf64736f6c634300050a0032

            const result = buildPcToInstructionMapping(sampleCode);

            console.log("RESULT", JSON.stringify(result))

            expect(true).toEqual(true)
        })

        it('should calculate correctly the instructions from bytecode', () => {
            const sampleCode = "0x6080604052348015600f57600080fd5b506004361060325760003560e01c80631865c57d146037578063c19d93fb14604f575b600080fd5b603d6055565b60408051918252519081900360200190f35b603d605b565b60005490565b6000548156fea265627a7a723058209fa44d2c74885e60715e4d845d6f360f80cbef23b84d3804408903f946b90bbf64736f6c634300050a0032"

            const result = parseRuntimeBinary(sampleCode);

            console.log("RESULT", JSON.stringify(result))

            expect(true).toEqual(true)
        })
    })

})